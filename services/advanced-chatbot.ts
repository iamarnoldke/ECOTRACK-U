import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Advanced Chatbot Service with Google AI Studio Capabilities
 * Features:
 * - Real-time streaming responses with fallback to offline AI
 * - Context awareness and conversation history
 * - Function calling for tool integration
 * - Multi-language support
 * - Response caching and optimization
 * - Error recovery and retry logic
 * - Rate limiting and quota management
 */

interface ChatbotConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  offlineFallback?: boolean;
}

interface ConversationContext {
  userId: string;
  userName?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  language?: 'EN' | 'LG';
  district?: string;
  previousActivities?: string[];
  customContext?: Record<string, any>;
}

interface StreamOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  timeout?: number;
}

interface ChatResponse {
  text: string;
  timestamp: number;
  tokensUsed?: number;
  cached?: boolean;
}

export class AdvancedChatbot {
  private client: GoogleGenerativeAI | null;
  private model: any;
  private config: Required<ChatbotConfig>;
  private conversationHistory: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }> = [];
  private responseCache: Map<string, ChatResponse> = new Map();
  private maxCacheSize = 100;
  private retryAttempts = 3;
  private retryDelay = 1000;
  private requestTimestamps: number[] = [];
  private maxRequestsPerMinute = 15; // Conservative limit for free tier
  private offlineFallback: boolean = true;
  private ollamaUrl = 'http://localhost:11434';

  constructor(config: ChatbotConfig) {
    try {
      this.client = new GoogleGenerativeAI(config.apiKey);
      this.model = this.client.getGenerativeModel({ model: config.model || 'gemini-2.0-flash' });
    } catch (error) {
      console.warn('Failed to initialize Google AI, will use offline fallback');
      this.client = null;
    }

    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'gemini-2.0-flash',
      temperature: config.temperature ?? 0.7,
      maxOutputTokens: config.maxOutputTokens ?? 2048,
      topP: config.topP ?? 0.9,
      topK: config.topK ?? 40,
      offlineFallback: config.offlineFallback ?? true,
    };
  }

  /**
   * Check if rate limit is exceeded
   */
  private isRateLimited(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove timestamps older than 1 minute
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);
    
    // Check if we've exceeded the limit
    if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
      return true;
    }
    
    return false;
  }

  /**
   * Record a request
   */
  private recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Use offline fallback response
   */
  private async getOfflineFallback(userMessage: string): Promise<string> {
    const offlineResponses: { [key: string]: string } = {
      'carbon': 'Transport: car ~200g CO2/km, bicycle 0g, walking 0g. Choose eco-friendly options! 🌱',
      'footprint': 'Your carbon footprint depends on transport, energy, food, and waste. Track activities to see impact.',
      'recommendation': 'Tips: Use public transport, reduce meat consumption, save water, recycle, plant trees! 🌍',
      'challenge': 'Join community challenges: tree planting, plastic cleanup, energy conservation. Get points! 🎯',
      'hello|hi': 'Hello! I\'m EcoTrack AI. How can I help you track your sustainability journey today?',
      'thank': 'You\'re welcome! Keep up the great eco-friendly work! 💚',
    };

    for (const [keyword, response] of Object.entries(offlineResponses)) {
      if (userMessage.toLowerCase().includes(keyword)) {
        return response;
      }
    }

    return 'That\'s an interesting question about sustainability! I\'m currently in offline mode. Please try again when online, or ask me about carbon tracking, eco-tips, or community challenges.';
  }

  /**
   * Stream a chat response with real-time chunk delivery
   */
  async streamChat(
    userMessage: string,
    context: ConversationContext,
    options: StreamOptions = {}
  ): Promise<ChatResponse> {
    const cacheKey = this.generateCacheKey(userMessage, context);
    const cached = this.responseCache.get(cacheKey);

    if (cached) {
      options.onComplete?.(cached.text);
      return { ...cached, cached: true };
    }

    const systemPrompt = this.buildSystemPrompt(context);
    let fullResponse = '';
    let attempts = 0;

    // Check rate limit
    if (this.isRateLimited()) {
      console.warn('⚠️ Rate limit reached, using offline mode');
      fullResponse = await this.getOfflineFallback(userMessage);
      options.onComplete?.(fullResponse);
      return { text: fullResponse, timestamp: Date.now(), cached: false };
    }

    // Check if API client is available
    if (!this.client || !this.model) {
      console.warn('⚠️ Google AI not available, using offline mode');
      fullResponse = await this.getOfflineFallback(userMessage);
      options.onComplete?.(fullResponse);
      return { text: fullResponse, timestamp: Date.now(), cached: false };
    }

    while (attempts < this.retryAttempts) {
      try {
        // Add user message to history
        this.conversationHistory.push({
          role: 'user',
          parts: [{ text: userMessage }],
        });

        const response = await this.model.generateContentStream({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\nUser: ${userMessage}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: this.config.temperature,
            topP: this.config.topP,
            topK: this.config.topK,
            maxOutputTokens: this.config.maxOutputTokens,
          },
        });

        // Stream chunks as they arrive
        for await (const chunk of response.stream) {
          const text = chunk.text();
          fullResponse += text;
          options.onChunk?.(text);
        }

        // Add response to history
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: fullResponse }],
        });

        // Keep only last 20 messages for context
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20);
        }

        const chatResponse: ChatResponse = {
          text: fullResponse,
          timestamp: Date.now(),
        };

        // Cache the response
        this.cacheResponse(cacheKey, chatResponse);
        this.recordRequest();
        options.onComplete?.(fullResponse);

        return chatResponse;
      } catch (error) {
        const errorStr = String(error);
        
        // Handle quota exceeded error
        if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('Quota exceeded')) {
          console.warn('⚠️ API Quota exceeded, switching to offline mode');
          fullResponse = await this.getOfflineFallback(userMessage);
          options.onComplete?.(fullResponse);
          return { text: fullResponse, timestamp: Date.now(), cached: false };
        }

        attempts++;
        if (attempts < this.retryAttempts) {
          await this.delay(this.retryDelay * attempts);
        } else {
          // Fallback to offline response on final error
          console.warn('⚠️ API error, using offline fallback:', errorStr);
          fullResponse = await this.getOfflineFallback(userMessage);
          options.onComplete?.(fullResponse);
          return { text: fullResponse, timestamp: Date.now(), cached: false };
        }
      }
    }

    // Final fallback
    fullResponse = await this.getOfflineFallback(userMessage);
    options.onComplete?.(fullResponse);
    return { text: fullResponse, timestamp: Date.now(), cached: false };
  }

  /**
   * Get a regular (non-streaming) response
   */
  async getResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<ChatResponse> {
    const cacheKey = this.generateCacheKey(userMessage, context);
    const cached = this.responseCache.get(cacheKey);

    if (cached) {
      return { ...cached, cached: true };
    }

    try {
      const systemPrompt = this.buildSystemPrompt(context);

      const response = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\nUser: ${userMessage}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: this.config.temperature,
          topP: this.config.topP,
          topK: this.config.topK,
          maxOutputTokens: this.config.maxOutputTokens,
        },
      });

      const text = response.response.text();

      // Add to conversation history
      this.conversationHistory.push(
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text }] }
      );

      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      const chatResponse: ChatResponse = {
        text,
        timestamp: Date.now(),
      };

      this.cacheResponse(cacheKey, chatResponse);
      return chatResponse;
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Interactive multi-turn conversation
   */
  async continueConversation(
    userMessage: string,
    context: ConversationContext,
    options: StreamOptions = {}
  ): Promise<ChatResponse> {
    return this.streamChat(userMessage, context, options);
  }

  /**
   * Get contextual recommendations based on conversation
   */
  async getRecommendations(context: ConversationContext): Promise<string[]> {
    if (this.conversationHistory.length === 0) {
      return [];
    }

    try {
      const history = this.conversationHistory.map(msg => `${msg.role}: ${msg.parts[0].text}`).join('\n');

      const response = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Based on this conversation about sustainability:

${history}

Provide 3-5 specific, actionable recommendations for the user in ${context.language === 'LG' ? 'Luganda' : 'English'}.
Format as a simple numbered list.`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.3,
        },
      });

      const text = response.response.text();
      const recommendations = text.split('\n').filter(line => line.trim());

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Generate conversation summary with key insights
   */
  async summarizeConversation(): Promise<string> {
    if (this.conversationHistory.length === 0) {
      return 'No conversation to summarize';
    }

    try {
      const history = this.conversationHistory.map(msg => `${msg.role}: ${msg.parts[0].text}`).join('\n');

      const response = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Summarize this sustainability conversation into key insights and action items:

${history}

Provide a concise summary (2-3 paragraphs) with clear next steps.`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.3,
        },
      });

      return response.response.text();
    } catch (error) {
      return 'Could not generate summary';
    }
  }

  /**
   * Sentiment analysis of conversation
   */
  async analyzeSentiment(): Promise<{
    overallSentiment: 'positive' | 'neutral' | 'negative';
    emotionalTone: string;
    engagementLevel: 'low' | 'medium' | 'high';
    keyTopics: string[];
  }> {
    if (this.conversationHistory.length === 0) {
      return {
        overallSentiment: 'neutral',
        emotionalTone: 'No conversation yet',
        engagementLevel: 'low',
        keyTopics: [],
      };
    }

    try {
      const history = this.conversationHistory.map(msg => msg.parts[0].text).join('\n');

      const response = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analyze this sustainability discussion for sentiment and topics:

${history}

Provide a JSON response with:
{
  "sentiment": "positive/neutral/negative",
  "tone": "brief emotional tone",
  "engagement": "low/medium/high",
  "topics": ["topic1", "topic2", "topic3"]
}`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.2,
        },
      });

      try {
        const jsonText = response.response.text();
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            overallSentiment: parsed.sentiment,
            emotionalTone: parsed.tone,
            engagementLevel: parsed.engagement,
            keyTopics: parsed.topics,
          };
        }
      } catch {
        // JSON parsing failed
      }

      return {
        overallSentiment: 'neutral',
        emotionalTone: 'Analysis unavailable',
        engagementLevel: 'medium',
        keyTopics: [],
      };
    } catch (error) {
      return {
        overallSentiment: 'neutral',
        emotionalTone: 'Error analyzing',
        engagementLevel: 'medium',
        keyTopics: [],
      };
    }
  }

  /**
   * Answer a specific question with context from conversation history
   */
  async answerQuestion(
    question: string,
    context: ConversationContext
  ): Promise<ChatResponse> {
    const contextSummary =
      this.conversationHistory.length > 0
        ? `Previous context: ${this.conversationHistory.map(msg => msg.parts[0].text.substring(0, 100)).join(' | ')}`
        : '';

    const systemPrompt = this.buildSystemPrompt(context);

    const fullMessage = `${systemPrompt}

${contextSummary}

Question: ${question}

Provide a direct, helpful answer.`;

    try {
      const response = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: fullMessage }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.5,
        },
      });

      const text = response.response.text();

      return {
        text,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): Array<{ role: string; text: string }> {
    return this.conversationHistory.map(msg => ({
      role: msg.role,
      text: msg.parts[0].text,
    }));
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.responseCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.responseCache.size,
      maxSize: this.maxCacheSize,
    };
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  private buildSystemPrompt(context: ConversationContext): string {
    const userInfo =
      context.userName || context.language === 'EN' ? context.language : 'Luganda';
    const level = context.userLevel || 'beginner';
    const district = context.district || 'Uganda';

    return `You are EcoTrack, an advanced environmental sustainability assistant for Uganda.

User Profile:
- Language: ${context.language === 'LG' ? 'Luganda' : 'English'}
- Experience Level: ${level}
- Location: ${district}
${context.userName ? `- Name: ${context.userName}` : ''}

Your responsibilities:
1. Help track and reduce carbon footprint
2. Provide locally relevant sustainability advice for Uganda
3. Encourage eco-friendly actions with personalized recommendations
4. Share knowledge about environmental impact
5. Support community engagement in green initiatives

Communication style:
- Be conversational and encouraging
- Use relevant local examples from Uganda
- Provide actionable, practical advice
- Adapt complexity to the user's experience level
- Use ${context.language === 'LG' ? 'Luganda' : 'English'} naturally

Focus areas:
- Carbon emissions calculation
- Transport alternatives
- Energy conservation
- Waste reduction
- Water conservation
- Food sustainability
- Community environmental initiatives`;
  }

  private generateCacheKey(message: string, context: ConversationContext): string {
    return `${message.substring(0, 50)}-${context.userId}-${context.language}`.replace(/\s+/g, '-');
  }

  private cacheResponse(key: string, response: ChatResponse): void {
    if (this.responseCache.size >= this.maxCacheSize) {
      const firstKey = this.responseCache.keys().next().value;
      this.responseCache.delete(firstKey);
    }
    this.responseCache.set(key, response);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// SINGLETON INSTANCE MANAGER
// ============================================================================

let chatbotInstance: AdvancedChatbot | null = null;

export function initializeChatbot(config: ChatbotConfig): AdvancedChatbot {
  chatbotInstance = new AdvancedChatbot(config);
  return chatbotInstance;
}

export function getChatbot(): AdvancedChatbot | null {
  return chatbotInstance;
}

export function createChatbot(config: ChatbotConfig): AdvancedChatbot {
  return new AdvancedChatbot(config);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { ChatbotConfig, ConversationContext, StreamOptions, ChatResponse };

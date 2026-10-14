import { GoogleGenerativeAI, GenerativeContentBlob } from '@google/generative-ai';
import { getApiKey } from './config';

// ============================================================================
// ADVANCED GOOGLE AI STUDIO CAPABILITIES FOR VOICE & CHATBOT
// ============================================================================

interface VoiceContext {
  userId: string;
  language: string;
  district: string;
  isPremium: boolean;
  conversationHistory: Array<{
    role: 'user' | 'model';
    content: string;
    timestamp: number;
  }>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface StreamingCallback {
  onChunk: (chunk: string) => void;
  onComplete: (fullText: string) => void;
  onError: (error: Error) => void;
}

// System prompts for different contexts
const SYSTEM_PROMPTS = {
  ecoTracker: `You are EcoTrack, an intelligent environmental sustainability assistant for Uganda. 
Your role is to help users track their carbon footprint, understand environmental impact, and take action.
You are knowledgeable about:
- Carbon emissions calculation
- Sustainable practices in Uganda
- Local environmental challenges and solutions
- Green lifestyle recommendations
- Community environmental initiatives

Be encouraging, informative, and action-oriented. Always provide locally relevant advice for Uganda.
Keep responses concise but helpful. When asked about calculations, provide exact numbers.`,

  chatbot: `You are a friendly EcoTrack AI assistant helping users learn about sustainability.
You provide:
- Educational content about environmental impact
- Personalized recommendations based on user activities
- Community challenges and tips
- Motivation and encouragement for eco-friendly choices

Be conversational, supportive, and engaging. Use Ugandan context when relevant.`,

  voiceAssistant: `You are a real-time voice assistant integrated with EcoTrack.
Respond naturally and concisely to voice queries.
Prioritize clarity and brevity for voice interaction.
Always provide actionable advice about sustainability and carbon tracking.`,
};

// Function definitions for tool/function calling capability
const TOOLS = [
  {
    name: 'calculate_carbon_footprint',
    description: 'Calculate carbon footprint for a given activity',
    parameters: {
      type: 'object' as const,
      properties: {
        activityType: {
          type: 'string',
          description: 'Type of activity (transport, energy, waste, water, food)',
        },
        value: {
          type: 'number',
          description: 'Quantity of the activity',
        },
        unit: {
          type: 'string',
          description: 'Unit of measurement (km, hours, kg, liters, etc)',
        },
        subcategory: {
          type: 'string',
          description: 'Specific subcategory (e.g., bicycle, car, bus for transport)',
        },
      },
      required: ['activityType', 'value', 'unit'],
    },
  },
  {
    name: 'get_eco_recommendation',
    description: 'Get personalized environmental recommendation based on activity',
    parameters: {
      type: 'object' as const,
      properties: {
        activityType: {
          type: 'string',
          description: 'Type of activity to get recommendations for',
        },
        userLevel: {
          type: 'string',
          enum: ['beginner', 'intermediate', 'advanced'],
          description: 'User experience level with sustainability',
        },
        location: {
          type: 'string',
          description: 'Uganda district for localized recommendations',
        },
      },
      required: ['activityType'],
    },
  },
  {
    name: 'search_community_initiatives',
    description: 'Find local environmental initiatives and challenges',
    parameters: {
      type: 'object' as const,
      properties: {
        district: {
          type: 'string',
          description: 'Uganda district to search in',
        },
        category: {
          type: 'string',
          description: 'Category of initiative (tree-planting, waste-management, renewable-energy, etc)',
        },
      },
      required: ['district'],
    },
  },
];

// ============================================================================
// ADVANCED STREAMING CHAT WITH GOOGLE AI STUDIO
// ============================================================================

export class AdvancedAIVoiceService {
  private client: GoogleGenerativeAI | null;
  private model: any;
  private context: VoiceContext;
  private conversationId: string;
  private requestTimestamps: number[] = [];
  private maxRequestsPerMinute = 10; // Conservative limit for voice API

  constructor(apiKey: string, context: VoiceContext) {
    try {
      this.client = new GoogleGenerativeAI(apiKey);
      this.model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
    } catch (error) {
      console.warn('Failed to initialize voice service');
      this.client = null;
    }
    this.context = context;
    this.conversationId = `${context.userId}-${Date.now()}`;
  }

  /**
   * Check if rate limit is exceeded
   */
  private isRateLimited(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo);
    
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
   * Get offline fallback response for voice assistant
   * Provides intelligent responses when API is unavailable
   */
  private async getOfflineFallback(userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();
    
    const offlineResponses: { [key: string]: string } = {
      'carbon': 'Your carbon footprint comes from transport, energy use, food, and waste. To reduce it, try walking or cycling, using renewable energy, eating less meat, and recycling more. Every action counts towards sustainability! 🌱',
      'footprint': 'Your carbon footprint depends on your daily transport choices, home energy, food consumption, and waste. Track each category to understand your impact and make targeted changes.',
      'recommend': 'Here are sustainable tips for you: Use public transport or ride-sharing, reduce meat consumption, save water at home, recycle properly, and plant trees in your community. 🌍',
      'challenge': 'Join EcoTrack challenges! Participate in tree planting drives, plastic cleanup events, renewable energy initiatives, and sustainable living competitions with your community.',
      'hello': 'Hello! I\'m EcoTrack Voice Assistant. I can help you track your carbon footprint, get personalized recommendations, find community initiatives, and answer questions about sustainability. What would you like help with?',
      'hi': 'Hi there! Welcome to EcoTrack. I can help you track your environmental impact and connect you with local green initiatives. How can I assist you today?',
      'help': 'I can help you with: tracking carbon emissions, getting eco-friendly recommendations, finding community projects, calculating your footprint, and learning about sustainability. What interests you?',
      'transport': 'Transport is a major source of emissions. Car travel produces ~200g CO2 per kilometer. Consider bicycles (0g), walking (0g), public transit (~50g), or electric vehicles (~50g CO2/km) for lower impact alternatives.',
      'energy': 'Home energy use contributes significantly to your carbon footprint. Switch to renewable energy providers, use LED bulbs, improve insulation, use efficient appliances, and adjust your thermostat to save energy and emissions.',
      'food': 'Food production impacts the environment. To reduce your foodprint: eat less meat (especially beef), buy local produce, reduce food waste, compost organic matter, and choose sustainable brands.',
      'waste': 'Waste management is crucial. Practice the 3Rs: Reduce consumption, Reuse items, and Recycle properly. Avoid single-use plastics, compost organic waste, and support circular economy initiatives.',
      'community': 'EcoTrack connects you with local environmental initiatives. Join tree-planting programs, plastic cleanup drives, renewable energy projects, and sustainable living groups in your district. Make a collective impact!',
      'uganda': 'EcoTrack Uganda focuses on local environmental challenges. We help Ugandan communities with reforestation, waste management, renewable energy adoption, and sustainable agriculture practices.',
    };

    // Find matching keyword
    for (const [keyword, response] of Object.entries(offlineResponses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }

    // Default response
    return 'I\'m in offline mode but ready to help! You can ask me about carbon tracking, eco-friendly recommendations, community initiatives, or environmental tips. What would you like to know?';
  }

  /**
   * Stream a response from the AI with real-time chunk delivery
   * Uses streaming for immediate feedback during voice interactions
   */
  async streamChatResponse(
    userMessage: string,
    callbacks: StreamingCallback,
    systemPrompt: keyof typeof SYSTEM_PROMPTS = 'chatbot'
  ): Promise<string> {
    try {
      // Check rate limit first
      if (this.isRateLimited()) {
        const fallback = await this.getOfflineFallback(userMessage);
        callbacks.onChunk(fallback);
        callbacks.onComplete(fallback);
        return fallback;
      }

      // Check if client is available
      if (!this.client || !this.model) {
        const fallback = await this.getOfflineFallback(userMessage);
        callbacks.onChunk(fallback);
        callbacks.onComplete(fallback);
        return fallback;
      }

      const history = this.formatConversationHistory();
      
      const prompt = `${SYSTEM_PROMPTS[systemPrompt]}

Conversation context (last 5 messages):
${history}

User: ${userMessage}

Respond naturally and helpfully:`;

      const response = await this.model.generateContentStream({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1024,
        },
      });

      this.recordRequest();
      let fullText = '';
      
      for await (const chunk of response.stream) {
        const text = chunk.text();
        fullText += text;
        callbacks.onChunk(text);
      }

      // Add to conversation history
      this.context.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      });
      
      this.context.conversationHistory.push({
        role: 'model',
        content: fullText,
        timestamp: Date.now(),
      });

      // Keep only last 20 messages
      if (this.context.conversationHistory.length > 20) {
        this.context.conversationHistory = this.context.conversationHistory.slice(-20);
      }

      callbacks.onComplete(fullText);
      return fullText;
    } catch (error) {
      const errorStr = String(error);
      
      // Handle quota errors gracefully
      if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('rate limit')) {
        console.warn('API quota exceeded, using offline mode');
        const fallback = await this.getOfflineFallback(userMessage);
        callbacks.onChunk(fallback);
        callbacks.onComplete(fallback);
        return fallback;
      }

      const err = error instanceof Error ? error : new Error(String(error));
      callbacks.onError(err);
      throw err;
    }
  }

  /**
   * Advanced chat with function calling support
   * Allows the AI to call tools for carbon calculation, recommendations, etc.
   */
  async advancedChatWithTools(
    userMessage: string,
    callbacks: StreamingCallback & {
      onToolCall?: (toolName: string, params: any) => Promise<string>;
    }
  ): Promise<string> {
    try {
      // Check rate limit first
      if (this.isRateLimited()) {
        const fallback = await this.getOfflineFallback(userMessage);
        callbacks.onChunk(fallback);
        callbacks.onComplete(fallback);
        return fallback;
      }

      // Check if client is available
      if (!this.client || !this.model) {
        const fallback = await this.getOfflineFallback(userMessage);
        callbacks.onChunk(fallback);
        callbacks.onComplete(fallback);
        return fallback;
      }

      const response = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
        ],
        tools: [
          {
            functionDeclarations: TOOLS as any,
          },
        ],
        generationConfig: {
          temperature: 0.3, // Lower for more consistent tool calling
          topP: 0.9,
          maxOutputTokens: 2048,
        },
        systemInstruction: SYSTEM_PROMPTS.ecoTracker,
      });

      this.recordRequest();
      let fullText = '';
      const toolCalls: Array<{ toolName: string; params: any; result: string }> = [];

      // Process response parts
      for (const part of response.response.content.parts) {
        if (part.text) {
          fullText += part.text;
          callbacks.onChunk(part.text);
        }

        // Handle function calls if present
        if ((part as any).functionCall) {
          const toolCall = (part as any).functionCall;
          const toolName = toolCall.name;
          const params = toolCall.args || {};

          if (callbacks.onToolCall) {
            try {
              const result = await callbacks.onToolCall(toolName, params);
              toolCalls.push({ toolName, params, result });
              callbacks.onChunk(`[Tool: ${toolName} executed]\n`);
            } catch (toolError) {
              callbacks.onChunk(`[Tool error: ${toolName}]\n`);
            }
          }
        }
      }

      callbacks.onComplete(fullText);
      return fullText;
    } catch (error) {
      const errorStr = String(error);
      
      // Handle quota errors gracefully
      if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('rate limit')) {
        console.warn('API quota exceeded, using offline mode for voice assistant');
        const fallback = await this.getOfflineFallback(userMessage);
        callbacks.onChunk(fallback);
        callbacks.onComplete(fallback);
        return fallback;
      }

      const err = error instanceof Error ? error : new Error(String(error));
      callbacks.onError(err);
      throw err;
    }
  }

  /**
   * Multimodal voice input processing
   * Process voice transcription with audio analysis
   */
  async processVoiceInput(
    transcribedText: string,
    audioBlob?: Blob,
    callbacks?: StreamingCallback
  ): Promise<string> {
    try {
      const content: any[] = [{ text: transcribedText }];

      // If audio blob provided, include it for context analysis
      if (audioBlob) {
        const base64Audio = await this.blobToBase64(audioBlob);
        content.push({
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Audio,
          },
        });
      }

      const response = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: content,
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
        systemInstruction: SYSTEM_PROMPTS.voiceAssistant,
      });

      const textResponse = response.response.text();
      callbacks?.onComplete(textResponse);
      return textResponse;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callbacks?.onError(err);
      throw err;
    }
  }

  /**
   * Context-aware response with user history
   * Maintains conversation context and personalizes responses
   */
  async contextualResponse(
    userMessage: string,
    callbacks: StreamingCallback
  ): Promise<string> {
    try {
      const userContext = `User Profile:
- District: ${this.context.district}
- Language: ${this.context.language}
- Premium: ${this.context.isPremium}
- Recent Activities: ${this.getRecentActivitiesSummary()}`;

      const prompt = `${SYSTEM_PROMPTS.chatbot}

${userContext}

Recent conversation:
${this.formatConversationHistory()}

User message: ${userMessage}

Provide a personalized response considering the user's location, premium status, and activity history:`;

      return await this.streamChatResponse(prompt, callbacks, 'chatbot');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callbacks.onError(err);
      throw err;
    }
  }

  /**
   * Batch processing for multiple voice queries
   * Efficiently handle multiple simultaneous queries
   */
  async processBatchVoiceQueries(
    queries: string[]
  ): Promise<Array<{ query: string; response: string; timestamp: number }>> {
    const results: Array<{ query: string; response: string; timestamp: number }> = [];

    for (const query of queries) {
      try {
        const response = await this.model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [{ text: query }],
            },
          ],
          systemInstruction: SYSTEM_PROMPTS.voiceAssistant,
        });

        results.push({
          query,
          response: response.response.text(),
          timestamp: Date.now(),
        });
      } catch (error) {
        results.push({
          query,
          response: 'Error processing query',
          timestamp: Date.now(),
        });
      }
    }

    return results;
  }

  /**
   * Conversation summary generation
   * Create actionable summaries from conversation history
   */
  async generateConversationSummary(): Promise<string> {
    try {
      const history = this.formatConversationHistory();
      
      const response = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{
              text: `Summarize this conversation into key environmental insights and recommendations for the user:

${history}

Provide a concise summary with actionable next steps.`,
            }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.3,
        },
      });

      return response.response.text();
    } catch (error) {
      return 'Could not generate summary';
    }
  }

  /**
   * Real-time response optimization for voice
   * Optimizes responses for voice output (shorter, clearer)
   */
  async voiceOptimizedResponse(
    userMessage: string,
    callbacks: StreamingCallback
  ): Promise<string> {
    try {
      const response = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
        ],
        systemInstruction: `${SYSTEM_PROMPTS.voiceAssistant}

IMPORTANT: Keep response under 150 words. Use short, clear sentences. Avoid complex technical terms.
Format for voice clarity: single sentences, clear pauses, friendly tone.`,
        generationConfig: {
          maxOutputTokens: 256,
          temperature: 0.6,
          topP: 0.8,
        },
      });

      const text = response.response.text();
      callbacks.onComplete(text);
      return text;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callbacks.onError(err);
      throw err;
    }
  }

  /**
   * Multi-language voice support
   * Automatically adapts responses based on user language preference
   */
  async multilingualVoiceResponse(
    userMessage: string,
    targetLanguage: string,
    callbacks: StreamingCallback
  ): Promise<string> {
    try {
      const systemMsg = `You are an environmental assistant for Uganda.
Respond in ${targetLanguage === 'LG' ? 'Luganda' : 'English'}.
Keep responses conversational and natural for voice interaction.
If responding in Luganda, use clear standard Luganda suitable for text-to-speech.`;

      return await this.streamChatResponse(userMessage, callbacks, 'voiceAssistant');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callbacks.onError(err);
      throw err;
    }
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  private formatConversationHistory(): string {
    return this.context.conversationHistory
      .slice(-10)
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
  }

  private getRecentActivitiesSummary(): string {
    if (this.context.conversationHistory.length === 0) {
      return 'No recent activities logged';
    }

    const lastMessages = this.context.conversationHistory.slice(-5);
    return lastMessages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content.substring(0, 50))
      .join(', ');
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Update user context for personalization
   */
  updateContext(updates: Partial<VoiceContext>): void {
    this.context = { ...this.context, ...updates };
  }

  /**
   * Get conversation metadata
   */
  getConversationMetadata() {
    return {
      conversationId: this.conversationId,
      userId: this.context.userId,
      messageCount: this.context.conversationHistory.length,
      language: this.context.language,
      district: this.context.district,
      isPremium: this.context.isPremium,
      startTime: this.context.conversationHistory[0]?.timestamp || Date.now(),
    };
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.context.conversationHistory = [];
    this.conversationId = `${this.context.userId}-${Date.now()}`;
  }
}

// ============================================================================
// SINGLETON INSTANCE MANAGER
// ============================================================================

let voiceServiceInstance: AdvancedAIVoiceService | null = null;

export function initializeVoiceService(
  apiKey: string,
  context: VoiceContext
): AdvancedAIVoiceService {
  voiceServiceInstance = new AdvancedAIVoiceService(apiKey, context);
  return voiceServiceInstance;
}

export function getVoiceService(): AdvancedAIVoiceService | null {
  return voiceServiceInstance;
}

export function createVoiceService(apiKey: string, context: VoiceContext): AdvancedAIVoiceService {
  return new AdvancedAIVoiceService(apiKey, context);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { VoiceContext, ChatMessage, StreamingCallback };

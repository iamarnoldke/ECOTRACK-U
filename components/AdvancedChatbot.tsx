import React, { useState, useRef, useEffect } from 'react';
import {
  AdvancedChatbot,
  initializeChatbot,
  ConversationContext,
  ChatResponse,
} from '../services/advanced-chatbot';
import { getApiKey } from '../services/config';

interface AdvancedChatbotComponentProps {
  language: string;
  user: any;
  district?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export const AdvancedChatbotComponent: React.FC<AdvancedChatbotComponentProps> = ({
  language,
  user,
  district,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const chatbotRef = useRef<AdvancedChatbot | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingMessageRef = useRef<string>('');

  // Initialize chatbot
  useEffect(() => {
    const apiKey = getApiKey();

    if (!apiKey || !apiKey.startsWith('AIzaSy')) {
      console.warn('⚠️ Gemini API key not available');
      return;
    }

    try {
      chatbotRef.current = initializeChatbot({
        apiKey,
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        maxOutputTokens: 2048,
      });
      console.log('✅ Chatbot initialized successfully');
    } catch (error) {
      console.error('Chatbot init error:', error);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatbotRef.current) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Add placeholder for streaming response
    const assistantMsgId = `msg-${Date.now() + 1}`;
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(true);
    streamingMessageRef.current = '';

    try {
      const context: ConversationContext = {
        userId: user?.id || 'anonymous',
        userName: user?.name,
        language: language === 'EN' ? 'EN' : 'LG',
        district: district || 'Uganda',
        userLevel: 'intermediate',
      };

      await chatbotRef.current.streamChat(
        userMessage,
        context,
        {
          onChunk: (chunk: string) => {
            streamingMessageRef.current += chunk;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === assistantMsgId
                  ? { ...msg, content: streamingMessageRef.current }
                  : msg
              )
            );
          },
          onComplete: (fullText: string) => {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
              )
            );
            setIsLoading(false);
          },
          onError: (error: Error) => {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === assistantMsgId
                  ? {
                      ...msg,
                      content: `❌ Error: ${error.message}`,
                      isStreaming: false,
                    }
                  : msg
              )
            );
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      const errorText = error instanceof Error ? error.message : 'Unknown error';
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMsgId
            ? { ...msg, content: `Error: ${errorText}`, isStreaming: false }
            : msg
        )
      );
      setIsLoading(false);
    }
  };

  // Get recommendations
  const handleGetRecommendations = async () => {
    if (!chatbotRef.current) return;

    try {
      const context: ConversationContext = {
        userId: user?.id || 'anonymous',
        language: language === 'EN' ? 'EN' : 'LG',
        district: district || 'Uganda',
      };

      const recommendations = await chatbotRef.current.getRecommendations(context);

      const assistantMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `📋 **Recommendations for You:**\n\n${recommendations.join('\n')}`,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
  };

  // Generate summary
  const handleGenerateSummary = async () => {
    if (!chatbotRef.current) return;

    try {
      const summary = await chatbotRef.current.summarizeConversation();

      const assistantMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `📊 **Conversation Summary:**\n\n${summary}`,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Error generating summary:', error);
    }
  };

  // Analyze sentiment
  const handleAnalyzeSentiment = async () => {
    if (!chatbotRef.current) return;

    try {
      const sentiment = await chatbotRef.current.analyzeSentiment();

      const assistantMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `💭 **Conversation Analysis:**

**Overall Sentiment:** ${sentiment.overallSentiment.toUpperCase()}
**Emotional Tone:** ${sentiment.emotionalTone}
**Engagement Level:** ${sentiment.engagementLevel.toUpperCase()}
**Key Topics:** ${sentiment.keyTopics.join(', ') || 'Not determined'}`,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      setStatistics(sentiment);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    }
  };

  // Clear conversation
  const handleClearChat = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([]);
      chatbotRef.current?.clearHistory();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex overflow-hidden">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 bg-gradient-to-b from-emerald-900 to-blue-900 text-white p-6 flex flex-col border-r border-emerald-800 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">EcoTrack</h1>
            <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest">
              Advanced AI Chatbot
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <button
              onClick={() => setMessages([])}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              ➕ New Chat
            </button>

            <button
              onClick={handleGenerateSummary}
              disabled={messages.length === 0}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              📊 Summary
            </button>

            <button
              onClick={handleGetRecommendations}
              disabled={messages.length === 0}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              💡 Tips
            </button>

            <button
              onClick={handleAnalyzeSentiment}
              disabled={messages.length === 0}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              💭 Analyze
            </button>
          </div>

          <div className="border-t border-emerald-700 pt-4 space-y-2">
            <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">Stats</p>
            <p className="text-xs text-emerald-100">
              Messages: <span className="font-bold">{messages.length}</span>
            </p>
            <p className="text-xs text-emerald-100">
              Cache: <span className="font-bold">{chatbotRef.current?.getCacheStats().size || 0}</span>
            </p>
          </div>

          <button
            onClick={() => setShowSidebar(false)}
            className="mt-auto bg-emerald-800/50 hover:bg-emerald-800 text-emerald-300 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
          >
            ← Hide
          </button>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-emerald-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 hover:bg-emerald-100 rounded-lg transition-all"
              >
                ☰
              </button>
            )}
            <div>
              <h2 className="font-black text-emerald-900 uppercase tracking-tighter">
                Advanced Chatbot
              </h2>
              <p className="text-xs text-emerald-600 font-bold">
                Streaming • Context-Aware • Multi-Language
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                Thinking...
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-60 text-center">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="font-black text-emerald-900 uppercase tracking-tighter mb-2">
                Start Your Conversation
              </h3>
              <p className="text-sm text-slate-600">
                Ask about sustainability, carbon tracking, environmental tips, or local initiatives
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-emerald-500 text-white rounded-br-none'
                      : 'bg-white text-slate-900 rounded-bl-none border border-emerald-100 shadow-md'
                  } ${msg.isStreaming ? 'border-b-2 border-blue-500' : ''}`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                    {msg.isStreaming && <span className="animate-pulse">▌</span>}
                  </div>
                  <p className="text-xs opacity-60 mt-2">
                    {new Date(msg.timestamp).toLocaleTimeString([], { timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-emerald-100 bg-white/80 backdrop-blur-md p-4 space-y-3">
          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about sustainability, carbon tracking, tips, or local initiatives..."
            className="w-full p-4 bg-slate-50 border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none font-medium text-sm"
            rows={3}
            disabled={isLoading}
          />

          <div className="flex gap-3">
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black py-3 rounded-xl uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? '⏳' : '🚀'} Send Message
            </button>

            <button
              onClick={handleClearChat}
              disabled={messages.length === 0}
              className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-900 font-bold py-3 px-4 rounded-xl text-xs uppercase transition-all"
              title="Clear chat"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedChatbotComponent;

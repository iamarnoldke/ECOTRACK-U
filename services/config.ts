/**
 * Global Configuration for EcoTrack
 * Manages API keys and environment variables for frontend
 */

const API_KEY = '';

export const config = {
  // Gemini API Configuration
  gemini: {
    apiKey: API_KEY,
    model: 'gemini-2.0-flash',
    voiceModel: 'gemini-2.5-flash-native-audio-preview-12-2025',
  },

  // Voice Assistant Configuration
  voice: {
    enabled: true,
    language: 'en-UG',
    sampleRate: 16000,
    timeout: 30000,
  },

  // Chatbot Configuration
  chatbot: {
    enabled: true,
    temperature: 0.7,
    maxTokens: 2048,
    streaming: true,
  },

  // Ollama Configuration (for offline mode)
  ollama: {
    url: 'http://localhost:11434',
    model: 'mistral',
    enabled: false,
  },

  // Server Configuration
  server: {
    baseUrl: 'http://localhost:8002',
    apiBase: '/api',
  },

  // Features
  features: {
    voiceAssistant: true,
    advancedChatbot: true,
    streamingResponses: true,
    functionCalling: true,
    multiLanguage: true,
    offlineMode: false,
  },
};

/**
 * Get API key safely
 */
export function getApiKey(): string {
  // Try to get from various sources
  const sources = [
    (window as any).VITE_GEMINI_API_KEY,
    (window as any).REACT_APP_GEMINI_API_KEY,
    process.env.VITE_GEMINI_API_KEY,
    process.env.REACT_APP_GEMINI_API_KEY,
    process.env.GEMINI_API_KEY,
    API_KEY,
  ];

  for (const source of sources) {
    if (source && !source.includes('undefined')) {
      return source;
    }
  }

  return API_KEY;
}

/**
 * Verify API key is valid
 */
export function isApiKeyValid(key: string): boolean {
  return key && key.length > 20 && key.startsWith('AIzaSy');
}

/**
 * Get voice configuration
 */
export function getVoiceConfig() {
  return config.voice;
}

/**
 * Get chatbot configuration
 */
export function getChatbotConfig() {
  return config.chatbot;
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof config.features): boolean {
  return config.features[feature];
}

export default config;

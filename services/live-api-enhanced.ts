/**
 * Voice Assistant Service for EcoTrack Uganda
 * Uses Web Speech API + Gemini for voice conversations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment or local storage
const getAPIKey = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('GEMINI_API_KEY') || (window as any).GEMINI_API_KEY || '';
  }
  return process.env.GEMINI_API_KEY || '';
};

// Audio utilities
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

/**
 * Check if Gemini API is available
 */
export async function isGeminiAvailable(): Promise<boolean> {
  const apiKey = getAPIKey();
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set');
    return false;
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
    await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'hello' }] }] });
    return true;
  } catch (error) {
    console.warn('Gemini API check failed:', error);
    return false;
  }
}

/**
 * Get Web Speech Recognition API
 */
const getSpeechRecognition = (): any => {
  if (typeof window === 'undefined') return null;
  
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    throw new Error('Speech Recognition not supported in this browser');
  }
  return SpeechRecognition;
};

/**
 * Text to Speech using browser Web Speech API
 */
export const textToSpeech = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Text-to-speech not available');
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Setup Live Voice Session
 */
export const setupLiveSession = (
  onTranscript: (text: string, role: 'user' | 'ai') => void,
  onAudioData: (base64: string) => void,
  onInterrupted: () => void,
  onError: (error: any) => void
) => {
  const apiKey = getAPIKey();
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY not configured. Please set it in .env or localStorage.');
    onError(error);
    return Promise.reject(error);
  }

  const SpeechRecognition = getSpeechRecognition();
  const recognition = new SpeechRecognition();
  const client = new GoogleGenerativeAI(apiKey);

  let isActive = true;
  let currentUserText = '';

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    console.log('🎤 Listening...');
    isActive = true;
  };

  recognition.onresult = (event: any) => {
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        currentUserText += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    // Show what user is saying
    const displayText = currentUserText + interimTranscript;
    if (displayText.trim()) {
      onTranscript(displayText.trim(), 'user');
    }
  };

  recognition.onerror = (event: any) => {
    const errorMsg = `Speech recognition error: ${event.error}`;
    console.error(errorMsg);
    onError(new Error(errorMsg));
  };

  recognition.onend = async () => {
    isActive = false;
    console.log('🛑 Stopped listening');

    if (currentUserText.trim()) {
      try {
        // Get AI response
        console.log('💭 Getting AI response...');
        const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
        
        const response = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [{
              text: `You are the friendly Eco-Consultant for EcoTrack Uganda, helping users with sustainability and environmental questions. 
User question: ${currentUserText}

Keep your response concise (1-2 sentences) and encourage eco-friendly actions. Focus on Western Uganda context (Mbarara, Kabale, etc.).`
            }]
          }],
        });

        const aiText = response.response.text();
        console.log('🤖 AI Response:', aiText);
        onTranscript(aiText, 'ai');

        // Speak the response
        console.log('🔊 Speaking response...');
        await textToSpeech(aiText);
        
        currentUserText = '';
      } catch (err) {
        console.error('❌ Error:', err);
        onError(err);
      }
    }
  };

  // Return session object
  const session = {
    start: () => {
      if (!isActive) {
        currentUserText = '';
        recognition.start();
      }
    },
    stop: () => {
      if (isActive) {
        recognition.stop();
      }
    },
    abort: () => {
      recognition.abort();
      isActive = false;
    },
    sendRealtimeInput: () => {
      // For compatibility
    },
    isActive: () => isActive
  };

  return Promise.resolve(session);
};

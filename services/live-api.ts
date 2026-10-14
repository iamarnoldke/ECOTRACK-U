
import { GoogleGenerativeAI, LiveServerMessage } from '@google/generative-ai';

// Implementation of manual base64 encoding/decoding as per requirements
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

export function createBlob(data: Float32Array): any {
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

export const setupLiveSession = (
  onTranscript: (text: string, role: 'user' | 'ai') => void,
  onAudioData: (base64: string) => void,
  onInterrupted: () => void,
  onError: (error: any) => void
) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY is not configured');
  }

  const ai = new GoogleGenerativeAI(apiKey);
  
  let currentInputTranscription = '';
  let currentOutputTranscription = '';

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: () => {
        console.log('Live session opened');
      },
      onmessage: async (message: LiveServerMessage) => {
        if (message.serverContent?.outputTranscription) {
          const text = message.serverContent.outputTranscription.text;
          currentOutputTranscription += text;
          onTranscript(currentOutputTranscription, 'ai');
        } else if (message.serverContent?.inputTranscription) {
          const text = message.serverContent.inputTranscription.text;
          currentInputTranscription += text;
          onTranscript(currentInputTranscription, 'user');
        }

        if (message.serverContent?.turnComplete) {
          currentInputTranscription = '';
          currentOutputTranscription = '';
        }

        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio) {
          onAudioData(base64Audio);
        }

        if (message.serverContent?.interrupted) {
          onInterrupted();
        }
      },
      onerror: (e: any) => {
        console.error('Live session error:', e);
        onError(e);
      },
      onclose: (e: any) => {
        console.log('Live session closed');
      },
    },
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
      systemInstruction: 'You are an Eco-Consultant for EcoTrack Uganda. You provide encouraging, localized sustainability advice to users in Uganda. Keep your spoken responses concise and friendly.',
      outputAudioTranscription: {},
      inputAudioTranscription: {},
    },
  });

  return sessionPromise;
};

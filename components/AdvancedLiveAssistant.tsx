import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AdvancedAIVoiceService,
  initializeVoiceService,
  VoiceContext,
  ChatMessage,
} from '../services/advanced-ai-voice';
import { getApiKey } from '../services/config';

interface AdvancedLiveAssistantProps {
  language: string;
  user: any;
  isPremium: boolean;
  district: string;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export const AdvancedLiveAssistant: React.FC<AdvancedLiveAssistantProps> = ({
  language,
  user,
  isPremium,
  district,
}) => {
  const [state, setState] = useState<VoiceState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);
  const [currentStreamChunk, setCurrentStreamChunk] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceServiceRef = useRef<AdvancedAIVoiceService | null>(null);
  const recordingRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize voice service
  useEffect(() => {
    const apiKey = getApiKey();

    if (!apiKey || !apiKey.startsWith('AIzaSy')) {
      setErrorMessage('⚠️ Gemini API key not available');
      return;
    }

    const context: VoiceContext = {
      userId: user?.id || 'anonymous',
      language: language === 'EN' ? 'English' : 'Luganda',
      district: district || 'Unknown',
      isPremium: isPremium || false,
      conversationHistory: [],
    };

    try {
      voiceServiceRef.current = initializeVoiceService(apiKey, context);
      console.log('✅ Voice service initialized successfully');
    } catch (error) {
      setErrorMessage('Failed to initialize voice service');
      console.error('Voice service init error:', error);
    }

    // Initialize speech recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'EN' ? 'en-UG' : 'lg-UG';
      console.log('✅ Speech Recognition initialized');
    } else {
      setErrorMessage('🎤 Speech Recognition not supported in this browser');
      console.warn('Speech Recognition not available');
    }
  }, [user?.id, language, district, isPremium]);

  // Handle speech recognition
  useEffect(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onstart = () => {
      setState('listening');
      setTranscript('');
      setErrorMessage(null);
      audioChunksRef.current = [];
    };

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + transcript + ' ');
        } else {
          interimTranscript += transcript;
        }
      }
      if (interimTranscript) {
        setTranscript(prev => prev.split(' ').slice(0, -1).join(' ') + ' ' + interimTranscript);
      }
    };

    recognitionRef.current.onend = async () => {
      setState('processing');
      const finalTranscript = transcript.trim();
      if (finalTranscript) {
        await processUserMessage(finalTranscript);
      } else {
        setState('idle');
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      setState('error');
      setErrorMessage(`Voice error: ${event.error}`);
      setTimeout(() => setState('idle'), 2000);
    };
  }, [transcript]);

  // Process user message with streaming
  const processUserMessage = useCallback(
    async (userMessage: string) => {
      if (!voiceServiceRef.current) {
        setErrorMessage('Voice service not initialized');
        return;
      }

      try {
        setIsStreamingResponse(true);
        setCurrentStreamChunk('');

        const audioBlob =
          audioChunksRef.current.length > 0 ? new Blob(audioChunksRef.current) : undefined;

        const response = await voiceServiceRef.current.processVoiceInput(
          userMessage,
          audioBlob,
          {
            onChunk: (chunk: string) => {
              setCurrentStreamChunk(prev => prev + chunk);
            },
            onComplete: (fullText: string) => {
              setIsStreamingResponse(false);
              setMessages(prev => [
                ...prev,
                {
                  role: 'user',
                  content: userMessage,
                  timestamp: Date.now(),
                },
                {
                  role: 'assistant',
                  content: fullText,
                  timestamp: Date.now(),
                },
              ]);

              if (!isMuted) {
                speakResponse(fullText);
              }
              setState('idle');
            },
            onError: (error: Error) => {
              setErrorMessage(`Error: ${error.message}`);
              setState('idle');
            },
          }
        );
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
        setState('idle');
      }
    },
    [isMuted]
  );

  // Text-to-speech response
  const speakResponse = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    window.speechSynthesis.cancel();
    synthesisRef.current = new SpeechSynthesisUtterance(text);
    synthesisRef.current.rate = 0.95;
    synthesisRef.current.pitch = 1;
    synthesisRef.current.volume = 1;
    synthesisRef.current.lang = language === 'EN' ? 'en-UG' : 'lg-UG';

    synthesisRef.current.onstart = () => {
      setState('speaking');
    };

    synthesisRef.current.onend = () => {
      setState('idle');
    };

    synthesisRef.current.onerror = () => {
      setState('idle');
    };

    window.speechSynthesis.speak(synthesisRef.current);
  }, [language]);

  // Record audio for multimodal input
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      recordingRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      setErrorMessage('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (recordingRef.current && recordingRef.current.state === 'recording') {
      recordingRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // Start voice interaction
  const handleStartVoiceChat = () => {
    startRecording();
  };

  // Stop voice interaction
  const handleStopVoiceChat = () => {
    stopRecording();
    window.speechSynthesis.cancel();
    setState('idle');
  };

  // Clear conversation
  const handleClearChat = () => {
    setMessages([]);
    voiceServiceRef.current?.clearHistory();
  };

  // Get conversation summary
  const handleGenerateSummary = async () => {
    if (!voiceServiceRef.current) return;
    try {
      const summary = await voiceServiceRef.current.generateConversationSummary();
      const summaryMessage: ChatMessage = {
        role: 'assistant',
        content: `📊 Conversation Summary:\n\n${summary}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, summaryMessage]);
    } catch (error) {
      setErrorMessage('Failed to generate summary');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-emerald-50/80 to-blue-50/80 backdrop-blur-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-emerald-100/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Voice Assistant</h2>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-full transition-all ${
              isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/20 text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
        <p className="text-emerald-100 text-xs font-bold uppercase tracking-[0.15em]">
          Advanced AI with Streaming & Real-Time Voice
        </p>
      </div>

      {/* Status Indicator */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              state === 'idle'
                ? 'bg-emerald-500'
                : state === 'listening'
                  ? 'bg-blue-500 animate-pulse'
                  : state === 'processing'
                    ? 'bg-amber-500'
                    : state === 'speaking'
                      ? 'bg-purple-500'
                      : 'bg-red-500'
            }`}
          ></div>
          <span className="text-slate-600">
            {state === 'idle'
              ? 'Ready'
              : state === 'listening'
                ? '🎤 Listening...'
                : state === 'processing'
                  ? '⚙️ Processing...'
                  : state === 'speaking'
                    ? '🔊 Speaking...'
                    : '❌ Error'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4 no-scrollbar bg-white/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <div className="text-4xl mb-2">🎯</div>
            <p className="font-bold text-slate-600">No messages yet</p>
            <p className="text-xs text-slate-500 mt-1">Click the microphone to start talking</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { timeStyle: 'short' })}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Streaming response */}
        {isStreamingResponse && currentStreamChunk && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-blue-100 text-slate-900 rounded-bl-none">
              <p className="text-sm leading-relaxed">{currentStreamChunk}</p>
              <span className="inline-block animate-pulse">▌</span>
            </div>
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="px-6 py-3 bg-amber-50/50 border-t border-amber-100">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">
            Current Input
          </p>
          <p className="text-sm text-amber-900 italic">{transcript}</p>
        </div>
      )}

      {/* Error Display */}
      {errorMessage && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-100">
          <p className="text-xs font-bold text-red-800">⚠️ {errorMessage}</p>
        </div>
      )}

      {/* Controls */}
      <div className="border-t border-emerald-100 p-6 space-y-3">
        <div className="flex gap-3">
          {state !== 'listening' && state !== 'processing' ? (
            <button
              onClick={handleStartVoiceChat}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 rounded-xl uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              🎤 Start Voice Chat
            </button>
          ) : (
            <button
              onClick={handleStopVoiceChat}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-3 rounded-xl uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 animate-pulse"
            >
              ⏹️ Stop
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleClearChat}
            className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-2 rounded-lg uppercase tracking-widest text-xs transition-all active:scale-95"
            disabled={messages.length === 0}
          >
            🗑️ Clear
          </button>
          <button
            onClick={handleGenerateSummary}
            className="bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold py-2 rounded-lg uppercase tracking-widest text-xs transition-all active:scale-95"
            disabled={messages.length === 0}
          >
            📊 Summary
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-2 bg-slate-50/80 border-t border-slate-100 text-center">
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
          💡 Streaming responses • 🎯 Advanced function calling • 🌍 Context-aware AI
        </p>
      </div>
    </div>
  );
};

export default AdvancedLiveAssistant;

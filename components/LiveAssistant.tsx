
import React, { useState, useEffect, useRef } from 'react';
import { setupLiveSession, decode, decodeAudioData, createBlob, isGeminiAvailable } from '../services/live-api-enhanced';
import { AppLanguage } from '../types';
import { LANGUAGE_NAMES } from '../services/translations';

interface LiveAssistantProps {
  language?: AppLanguage;
  isPremium?: boolean;
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({ language = AppLanguage.ENGLISH }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcripts, setTranscripts] = useState<{ user: string; ai: string }>({ user: '', ai: '' });
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const audioCtxRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check Gemini API availability on mount
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await isGeminiAvailable();
      setIsAvailable(available);
      if (!available) {
        console.warn('Gemini API not available - Voice Assistant disabled');
      }
      setIsLoading(false);
    };
    checkAvailability();
  }, []);

  const startSession = async () => {
    if (!isAvailable) {
      setErrorMessage('Voice Assistant is not available. Please check your Gemini API configuration.');
      return;
    }

    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioCtxRef.current = { input: inputCtx, output: outputCtx };

      const sessionPromise = setupLiveSession(
        (text, role) => {
          setTranscripts(prev => ({
            ...prev,
            [role]: text
          }));
        },
        async (base64) => {
          if (!audioCtxRef.current) return;
          setIsAiSpeaking(true);
          const ctx = audioCtxRef.current.output;
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
          try {
            const audioBuffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.addEventListener('ended', () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setIsAiSpeaking(false);
            });
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          } catch (err) {
            console.error("Audio decoding error:", err);
          }
        },
        () => {
          for (const source of sourcesRef.current) {
            try { source.stop(); } catch (e) {}
          }
          sourcesRef.current.clear();
          nextStartTimeRef.current = 0;
          setIsAiSpeaking(false);
        },
        (err) => {
          console.error("Live Assistant error:", err);
          setErrorMessage("Connection issue. Please try again later.");
          stopSession();
        }
      );

      sessionPromiseRef.current = sessionPromise;
      setIsActive(true);
      
      const source = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      scriptProcessor.onaudioprocess = (e) => {
        if (sessionPromiseRef.current) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          sessionPromiseRef.current.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
          }).catch(() => {
            // Silence promise rejection if session closes
          });
        }
      };
      source.connect(scriptProcessor);
      scriptProcessor.connect(inputCtx.destination);
    } catch (error) {
      console.error("Session start error:", error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg.includes('NotAllowedError')) {
        setErrorMessage('Microphone access denied. Please allow microphone access and try again.');
      } else if (errorMsg.includes('NotFoundError')) {
        setErrorMessage('No microphone found. Please connect a microphone.');
      } else {
        setErrorMessage('Could not connect to Voice Assistant. Please try again.');
      }
      stopSession();
    }
  };

  const stopSession = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close()).catch(() => {});
      sessionPromiseRef.current = null;
    }
    
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    
    audioCtxRef.current?.input.close().catch(() => {});
    audioCtxRef.current?.output.close().catch(() => {});
    audioCtxRef.current = null;
    
    setIsActive(false);
    setTranscripts({ user: '', ai: '' });
  };

  return (
    <>
      <button 
        onClick={isActive ? stopSession : startSession}
        disabled={!isAvailable || isLoading}
        title={isAvailable ? 'Start Voice Chat' : 'Voice Assistant not configured'}
        className={`fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-[60] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? 'bg-rose-500 animate-pulse' : isAvailable ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-400'}`}
      >
        {isLoading ? (
          <svg className="w-6 h-6 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isActive ? "M6 18L18 6M6 6l12 12" : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"} />
          </svg>
        )}
      </button>

      {isActive && (
        <div className="fixed inset-x-6 bottom-40 bg-white/95 backdrop-blur-xl border border-emerald-100 rounded-[2.5rem] p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] z-[55] animate-in slide-in-from-bottom-12 duration-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isAiSpeaking ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`}></div>
              <h3 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest">🎤 Eco Pulse AI</h3>
            </div>
            <button onClick={stopSession} className="text-slate-400 font-black text-[10px] uppercase hover:text-rose-500 transition-colors">Close</button>
          </div>

          <div className="space-y-6">
            {errorMessage ? (
              <div className="bg-rose-50 rounded-2xl p-5 border border-rose-100 text-center">
                <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest">⚠️ {errorMessage}</p>
                <button onClick={startSession} className="mt-2 text-[9px] font-bold text-emerald-600 uppercase hover:underline">Retry</button>
              </div>
            ) : (
              <>
                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                  <p className="text-[8px] text-emerald-400 font-black uppercase mb-1 tracking-widest">👂 Listening...</p>
                  <p className="text-xs text-emerald-900 font-bold italic min-h-[24px]">{transcripts.user || 'Speak to your eco-expert...'}</p>
                </div>
                
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm min-h-[60px]">
                  <p className="text-[8px] text-slate-400 font-black uppercase mb-1 tracking-widest">🤖 AI Response</p>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed min-h-[20px]">{transcripts.ai || 'Listening...'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LiveAssistant;

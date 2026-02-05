
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { MODEL_LIVE } from '../constants';
import { createPcmBlob, decodeAudioData, decode } from '../services/geminiService';
import { Expense, Currency } from '../types';
import { StorageRegistry } from '../services/storageRegistry';
import { calculateTotalMonthlyBurn, getCategoryBreakdown } from '../services/financeCore';

interface Props {
  expenses: Expense[];
  currency: Currency;
  trackAIUsage?: (amount?: number) => boolean;
  onUpgrade?: () => void;
}

export const LiveSession: React.FC<Props> = ({ expenses, currency, trackAIUsage, onUpgrade }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready to connect');
  const [error, setError] = useState<string | null>(null);

  // Refs for audio handling
  const nextStartTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const startSession = async () => {
    // Check AI usage - Live sessions cost 20 credits
    if (trackAIUsage && !trackAIUsage(20)) {
      alert('Live Coach requires 20 AI credits. Upgrade to Pro for unlimited access.');
      onUpgrade?.();
      return;
    }
    
    try {
      setIsActive(true);
      setError(null);
      setStatus("Initializing audio...");

      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputAudioContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime; // Reset timing

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus("Syncing Ledger Data...");

      // --- CONTEXT PREPARATION ---
      const budget = StorageRegistry.loadBudget();
      const totalMonthly = calculateTotalMonthlyBurn(expenses);
      const categoryData = getCategoryBreakdown(expenses);
      
      const topCategories = categoryData
        .slice(0, 5)
        .map(([cat, amt]) => `${cat}: ${Math.round(amt)}`)
        .join(', ');

      const topExpenses = [...expenses]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map(e => `${e.name} (${Math.round(e.amount)})`)
        .join(', ');

      const isOver = totalMonthly > budget;
      const statusStr = isOver ? `CRITICAL: OVER BUDGET by ${Math.round(totalMonthly - budget)}` : `SAFE: Under budget by ${Math.round(budget - totalMonthly)}`;

      const systemContext = `
      SYSTEM IDENTITY: You are CANN.ON.AI, an elite, high-performance financial tactical advisor.
      
      LIVE DATA FEED:
      - Currency: ${currency.code} (${currency.symbol})
      - Monthly Burn Rate: ${Math.round(totalMonthly)}
      - Budget Cap: ${budget}
      - Status: ${statusStr}
      - Top Cost Centers: ${topCategories}
      - Largest Outliers: ${topExpenses}
      - Total Data Points: ${expenses.length}

      PROTOCOL:
      - You are speaking directly to the user via voice.
      - Be concise, professional, and slightly futuristic/tactical in tone.
      - Use the provided data to answer questions about spending, savings, or specific costs.
      - If the user asks "How am I doing?", reference the Budget Status immediately.
      - Do not hallucinate data. Use the feed provided.
      `;

      setStatus("Connecting to Gemini Live...");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: MODEL_LIVE,
        callbacks: {
          onopen: () => {
            setStatus("Live Session Active");
            // Setup Microphone Stream
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
                const ctx = audioContextRef.current;
                
                // Ensure smooth playback timing
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    ctx,
                    24000,
                    1
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                
                source.addEventListener('ended', () => {
                    sourcesRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
            }

            // Handle Interruption
            if (msg.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                if(audioContextRef.current) nextStartTimeRef.current = audioContextRef.current.currentTime;
            }
          },
          onclose: () => {
            setStatus("Disconnected");
            setIsActive(false);
          },
          onerror: (e) => {
            console.error(e);
            setError("Connection Error");
            setIsActive(false);
          }
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' }}
            },
            systemInstruction: systemContext
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to start session");
        setIsActive(false);
    }
  };

  const stopSession = () => {
     if (inputAudioContextRef.current) inputAudioContextRef.current.close();
     if (audioContextRef.current) audioContextRef.current.close();
     
     sessionPromiseRef.current = null;
     setIsActive(false);
     setStatus("Stopped");
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 pb-24 relative overflow-hidden">
        {/* Animated Background Pulse */}
        {isActive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 bg-blue-500/20 rounded-full animate-ping"></div>
                <div className="w-48 h-48 bg-blue-500/30 rounded-full animate-pulse absolute"></div>
            </div>
        )}

        <div className="glass-panel w-full max-w-md p-8 rounded-3xl flex flex-col items-center gap-6 z-10 border-blue-500/30 shadow-2xl shadow-blue-900/40">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-inner ${isActive ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-800 text-gray-500'}`}>
                🎙️
            </div>
            
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Live Coach</h2>
                <p className="text-blue-400 mt-2 font-mono text-sm">{status}</p>
                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>

            <button
                onClick={isActive ? stopSession : startSession}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    isActive 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
            >
                {isActive ? 'End Session' : 'Start Conversation'}
            </button>
            
            <p className="text-xs text-gray-500 text-center px-4">
                Powered by Gemini 2.5 Native Audio. Latency may vary.
            </p>
        </div>
    </div>
  );
};

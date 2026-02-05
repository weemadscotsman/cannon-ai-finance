
import React, { useState, useRef } from 'react';
import { generateFinancialPlanStream, generateFastAudioInsight, speakText } from '../services/geminiService';
import { calculateTotalMonthlyBurn, getCategoryBreakdown } from '../services/financeCore';
import { Currency, Expense } from '../types';
import ReactMarkdown from 'react-markdown';
import { GenerateContentResponse } from '@google/genai';

interface Props {
  currency: Currency;
  expenses: Expense[];
  trackAIUsage?: (amount?: number) => boolean;
  onUpgrade?: () => void;
}

export const Planner: React.FC<Props> = ({ currency, expenses, trackAIUsage, onUpgrade }) => {
  const [goal, setGoal] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Aggressive Token Golfing: Compact Context
  const getCompressedContext = () => {
    const totalMonthly = calculateTotalMonthlyBurn(expenses);
    const byCategory = getCategoryBreakdown(expenses);

    // Only Top 5 expenses, formatted sparsely: "Name:Amount"
    const topExpenses = [...expenses]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map(e => `${e.name}:${Math.round(e.amount)}`)
        .join(',');

    // Categories sparse format: "Cat:Amount"
    const catStr = byCategory
        .map(([k, v]) => `${k}:${Math.round(v)}`)
        .join(',');

    // Dense Data Block
    return `Cur:${currency.code}|Burn:${Math.round(totalMonthly)}|Cats:${catStr}|Top5:${topExpenses}|Count:${expenses.length}`;
  };

  const stopAudio = () => {
      if (audioSourceRef.current) {
          try {
              audioSourceRef.current.stop();
          } catch (e) {
              // Ignore errors if already stopped
          }
          audioSourceRef.current = null;
      }
      setIsSpeaking(false);
      setIsAudioLoading(false);
  };

  // Internal helper to just play a buffer
  const playBuffer = async (buffer: AudioBuffer) => {
      stopAudio(); 
      setIsSpeaking(true);
      
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume();
      }

      const source = audioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtxRef.current.destination);
      source.onended = () => setIsSpeaking(false);
      audioSourceRef.current = source;
      source.start(0);
  }

  const playAudio = async (textToSpeak: string) => {
      if(!textToSpeak) return;
      
      // Check AI usage for TTS
      if (trackAIUsage && !trackAIUsage(1)) {
        alert('AI credit limit reached.');
        onUpgrade?.();
        return;
      }
      
      stopAudio(); 
      setIsAudioLoading(true);
      setStatusText("Synthesizing Audio...");
      
      try {
          const buffer = await speakText(textToSpeak);
          setIsAudioLoading(false);
          setStatusText(""); 
          if (buffer) playBuffer(buffer);
      } catch (e) {
          console.error("Audio failed", e);
          setIsSpeaking(false);
          setIsAudioLoading(false);
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      stopAudio(); // Immediate kill on keystroke
      setGoal(e.target.value);
  };

  const handlePlan = async () => {
    if (!goal) return;
    
    // Check AI usage limit
    if (trackAIUsage && !trackAIUsage(5)) { // Planning uses 5 credits
      alert('AI credit limit reached. Upgrade to Pro for unlimited AI interactions.');
      onUpgrade?.();
      return;
    }
    
    stopAudio(); 
    
    // UI State Immediate Updates
    setLoading(true);
    setPlan('');
    setStatusText("Initializing...");
    setIsAudioLoading(true); // Show audio loading immediately
    
    // Resume audio context immediately on user interaction
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
    }
    
    const contextData = getCompressedContext();
    const densePrompt = `Data[${contextData}] Goal[${goal}] Task:Strict financial roadmap. Brevity:High. Output:Markdown.`;

    // PARALLEL EXECUTION: Launch both streams
    // 1. Audio: Generates a short summary faster
    const audioPromise = generateFastAudioInsight(densePrompt)
        .then((buffer) => {
            if (buffer) {
                setIsAudioLoading(false);
                playBuffer(buffer);
            }
        })
        .catch(() => setIsAudioLoading(false));

    // 2. Visual: Streams the detailed text
    try {
      setStatusText("Streaming Tactics...");
      const responseStream = await generateFinancialPlanStream(densePrompt);
      
      let fullText = '';
      for await (const chunk of responseStream) {
          const c = chunk as GenerateContentResponse;
          if (c.text) {
              fullText += c.text;
              setPlan(fullText); 
          }
      }
      setLoading(false);
      // We do NOT playAudio(fullText) here anymore because audioPromise handles the speech
      // This prevents the "waiting for text to finish" delay.
    } catch (e) {
      console.error(e);
      setPlan("Error generating plan. Try again.");
      setLoading(false);
    }
    
    await audioPromise;
  };

  return (
    <div className="p-4 flex flex-col h-full pb-24 overflow-y-auto no-scrollbar">
      <div className="glass-panel p-6 rounded-2xl mb-6 border-purple-500/20 relative overflow-hidden transition-all duration-300">
        {isSpeaking && (
            <div className="absolute top-0 right-0 p-2">
                <div className="flex gap-1 items-end h-4">
                    <div className="w-1 bg-purple-500 animate-pulse h-full"></div>
                    <div className="w-1 bg-purple-400 animate-pulse h-2/3 delay-75"></div>
                    <div className="w-1 bg-purple-600 animate-pulse h-1/2 delay-150"></div>
                </div>
            </div>
        )}
        <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Deep Planner</h2>
        <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest transition-colors ${loading ? 'bg-purple-500 text-white border-purple-400 animate-pulse' : 'bg-purple-900/50 text-purple-200 border-purple-500/30'}`}>
                {statusText || "System Ready"}
            </span>
            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">Gemini Flash (Parallel)</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
            <textarea
                className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white focus:border-purple-500 outline-none resize-none h-40 text-sm shadow-inner transition-colors focus:bg-gray-900"
                placeholder={`Describe your mission (e.g., "Save ${currency.symbol}5k in 3mo").`}
                value={goal}
                onChange={handleInputChange}
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-gray-600 font-bold uppercase tracking-widest pointer-events-none">Strategy Input</div>
        </div>
        
        <button 
            onClick={handlePlan}
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] ${loading ? 'bg-gray-800 text-purple-400 border border-purple-500/30' : 'bg-gradient-to-r from-purple-600 to-pink-700 hover:shadow-2xl hover:shadow-purple-500/20 text-white'}`}
        >
            {loading ? 'FORGING STRATEGY...' : 'FORGE STRATEGY'}
        </button>
      </div>

      {plan && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Strategic Roadmap</h3>
                <button 
                    onClick={() => playAudio(plan)} 
                    disabled={isAudioLoading}
                    className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${isSpeaking ? 'text-purple-400' : 'text-gray-500 hover:text-white'} ${isAudioLoading ? 'opacity-50 cursor-wait' : ''}`}
                >
                    {isAudioLoading ? '⏳ Loading Voice...' : (isSpeaking ? '🔊 Playing' : '▶️ Replay Full Text')}
                </button>
            </div>
            <div className="glass-panel rounded-2xl p-6 border-l-4 border-purple-500 bg-black/40 min-h-[100px]">
                <div className="prose prose-invert prose-sm max-w-none font-medium text-gray-300 leading-relaxed prose-headings:text-white prose-headings:font-black prose-strong:text-purple-400">
                    <ReactMarkdown>{plan}</ReactMarkdown>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

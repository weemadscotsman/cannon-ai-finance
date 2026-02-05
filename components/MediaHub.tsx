import React, { useState } from 'react';
import { generateVeoVideo, editImage, chatWithSearch, searchLocalSavings } from '../services/geminiService';

interface Props {
  trackAIUsage?: (amount?: number) => boolean;
  onUpgrade?: () => void;
}

export const MediaHub: React.FC<Props> = ({ trackAIUsage, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState<'veo' | 'edit' | 'info' | 'maps'>('veo');
  const [prompt, setPrompt] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [searchResult, setSearchResult] = useState<{ text: string; sources: { title: string; uri: string }[] } | null>(null);

  const handleAction = async () => {
    if (!prompt) return;
    
    // Check AI usage - Media features cost 10 credits each
    if (trackAIUsage && !trackAIUsage(10)) {
      alert('Media features require 10 AI credits. Upgrade to Pro for unlimited access.');
      onUpgrade?.();
      return;
    }
    
    setLoading(true);
    setMediaUrl(null);
    setSearchResult(null);

    try {
        if (activeTab === 'veo') {
            const url = await generateVeoVideo(prompt, file ? await fileToBase64(file) : undefined);
            if (url) setMediaUrl(url);
        } else if (activeTab === 'edit') {
            if (!file) return alert("Image required.");
            const res = await editImage(await fileToBase64(file), prompt, file.type);
            if (res) setMediaUrl(res);
        } else if (activeTab === 'info') {
             const result = await chatWithSearch(prompt);
             setSearchResult(result);
        } else if (activeTab === 'maps') {
             navigator.geolocation.getCurrentPosition(async (pos) => {
                 const result = await searchLocalSavings(prompt, pos.coords.latitude, pos.coords.longitude);
                 setSearchResult(result);
                 setLoading(false);
             }, (err) => {
                 alert("Location access required for local savings.");
                 setLoading(false);
             });
             return; // Let geolocation callback finish
        }
    } catch (e) {
        console.error(e);
        alert("Command failed.");
    } finally {
        if (activeTab !== 'maps') setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="p-4 flex flex-col h-full pb-24 overflow-y-auto">
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-2 no-scrollbar">
            {['veo', 'edit', 'info', 'maps'].map((t) => (
                <button
                    key={t}
                    onClick={() => { setActiveTab(t as any); setMediaUrl(null); setFile(null); setSearchResult(null); }}
                    className={`flex-none px-4 py-2 rounded-lg font-bold uppercase text-[9px] tracking-widest border transition-all ${activeTab === t ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20' : 'bg-gray-900 border-gray-800 text-gray-500'}`}
                >
                    {t === 'veo' ? 'Visionary' : t === 'edit' ? 'Modify' : t === 'info' ? 'Search' : 'Local Savings'}
                </button>
            ))}
        </div>

        <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col gap-4 border-emerald-500/10">
            <h2 className="text-xl font-bold text-white tracking-tighter">
                {activeTab === 'veo' && "Strategic Future (Veo)"}
                {activeTab === 'edit' && "Receipt Forge"}
                {activeTab === 'info' && "Global Market IQ"}
                {activeTab === 'maps' && "Nearby Cost Audit"}
            </h2>

            {(activeTab === 'veo' || activeTab === 'edit') && (
                <div className="border border-dashed border-gray-800 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-black/20">
                    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">
                        {file ? file.name : "Attach Frame/Asset"}
                    </div>
                </div>
            )}

            <textarea
                placeholder={activeTab === 'maps' ? "Find cheaper gas, groceries, or gyms near me..." : "Enter Command..."}
                className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 text-white h-24 text-sm focus:border-emerald-500 outline-none"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
            />

            <button
                onClick={handleAction}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-black text-white shadow-xl transition-all ${loading ? 'bg-gray-800 animate-pulse' : 'bg-gradient-to-r from-emerald-600 to-teal-800 hover:scale-[1.01]'}`}
            >
                {loading ? "FORGING..." : "EXECUTE"}
            </button>

            {searchResult && (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-4 bg-emerald-950/20 border border-emerald-500/10 rounded-xl text-xs text-gray-300 leading-relaxed font-medium">
                        {searchResult.text}
                    </div>
                    {searchResult.sources.length > 0 && (
                        <div className="space-y-1.5">
                            <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Grounding Citations</span>
                            <div className="flex flex-wrap gap-2">
                                {searchResult.sources.map((source, i) => (
                                    <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] bg-gray-900 border border-gray-800 px-2 py-1 rounded-md text-emerald-400 hover:border-emerald-500 whitespace-nowrap">
                                        {source.title.substring(0, 24)}...
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {mediaUrl && (
                <div className="mt-4 rounded-xl overflow-hidden border border-gray-800 bg-black group relative shadow-2xl">
                    {activeTab === 'veo' ? <video src={mediaUrl} controls autoPlay loop className="w-full h-auto" /> : <img src={mediaUrl} alt="Forge" className="w-full h-auto" />}
                </div>
            )}
        </div>
    </div>
  );
};

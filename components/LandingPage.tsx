
import React from 'react';

interface Props {
  onStart: () => void;
  onPricing: () => void;
  onPrivacy?: () => void;
  onTerms?: () => void;
}

export const LandingPage: React.FC<Props> = ({ onStart, onPricing, onPrivacy, onTerms }) => {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Now with Live AI Coach
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
              Your Money.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400">
                Actually Understood.
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Track expenses, plan budgets, and talk to an AI that knows your finances in real-time. 
              No spreadsheets. No confusion.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button 
                onClick={onStart}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-emerald-900/50"
              >
                Start Free →
              </button>
              <button 
                onClick={onPricing}
                className="px-8 py-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white font-bold rounded-xl text-lg transition-all"
              >
                See Pricing
              </button>
            </div>
            
            <p className="text-sm text-gray-600">20 AI interactions free. Then $4.99 once. No subscription.</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="border-y border-gray-900 bg-gray-950/30">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="📊"
              title="Smart Tracking"
              desc="50+ expense categories pre-loaded. AI receipt scanning. Automatic monthly burn calculation."
            />
            <FeatureCard 
              icon="🧠"
              title="AI Strategy"
              desc='Ask "How do I save $5k?" Get a personalized roadmap based on YOUR actual spending. One-time $4.99 unlocks unlimited.'
            />
            <FeatureCard 
              icon="🎙️"
              title="Live Voice Coach"
              desc="Talk to your money. Real-time voice conversation with AI that knows your budget."
            />
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <p className="text-gray-500 text-sm uppercase tracking-widest mb-8">Trusted by early users</p>
        <div className="flex flex-wrap justify-center gap-8 text-gray-600 font-bold">
          <span>"Finally understand where my money goes"</span>
          <span>•</span>
          <span>"The voice coach is a game changer"</span>
          <span>•</span>
          <span>"Saved me $400 in month one"</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-12 text-center text-gray-600 text-sm">
        <p>© 2025 CANN.ON.AI FORGE. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <button onClick={onPrivacy} className="hover:text-emerald-400 transition-colors">Privacy</button>
          <button onClick={onTerms} className="hover:text-emerald-400 transition-colors">Terms</button>
          <a href="mailto:support@cannon.ai" className="hover:text-emerald-400 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: string; title: string; desc: string }) => (
  <div className="p-6 rounded-2xl bg-gray-900/30 border border-gray-800 hover:border-emerald-500/30 transition-colors">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

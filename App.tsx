
import React, { useState, useEffect } from 'react';
import { ExpenseList } from './components/ExpenseList';
import { Planner } from './components/Planner';
import { LiveSession } from './components/LiveSession';
import { MediaHub } from './components/MediaHub';
import { LandingPage } from './components/LandingPage';
import { Pricing } from './components/Pricing';
import { UsageWidget } from './components/UsageWidget';
import { Legal } from './components/Legal';
import { SUPPORTED_CURRENCIES } from './constants';
import { Expense, ViewState, Currency } from './types';
import { speakText } from './services/geminiService';
import { StorageRegistry } from './services/storageRegistry';
import { calculateTotalMonthlyBurn } from './services/financeCore';

// --- SUBSCRIPTION / MONETIZATION ---
type UserPlan = 'free' | 'pro' | 'business';

interface UserState {
  plan: UserPlan;
  aiUsed: number;
  aiLimit: number;
  isLoggedIn: boolean;
}

const PLAN_LIMITS: Record<UserPlan, number> = {
  free: 50,
  pro: Infinity,
  business: Infinity,
};

const MAX_FREE_EXPENSES = 100;

function App() {
  // --- APP STATE ---
  const [view, setView] = useState<ViewState>(ViewState.TRACKER);
  const [expenses, setExpenses] = useState<Expense[]>(() => StorageRegistry.loadExpenses());
  const [currency, setCurrency] = useState<Currency>(() => StorageRegistry.loadCurrency());
  const [isBriefing, setIsBriefing] = useState(false);
  
  // --- MONETIZATION STATE ---
  const [appView, setAppView] = useState<'landing' | 'pricing' | 'app' | 'privacy' | 'terms'>('landing');
  const [user, setUser] = useState<UserState>({
    plan: 'free',
    aiUsed: 0,
    aiLimit: PLAN_LIMITS.free,
    isLoggedIn: false,
  });

  // --- LOAD USER STATE ---
  useEffect(() => {
    const stored = localStorage.getItem('cannon_user_state');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(prev => ({ ...prev, ...parsed }));
      if (parsed.hasStarted) {
        setAppView('app');
      }
    }
  }, []);

  // --- PERSISTENCE ---
  useEffect(() => {
    StorageRegistry.saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    StorageRegistry.saveCurrency(currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('cannon_user_state', JSON.stringify({
      plan: user.plan,
      aiUsed: user.aiUsed,
      hasStarted: appView === 'app',
    }));
  }, [user.plan, user.aiUsed, appView]);

  // --- AI USAGE TRACKING ---
  const trackAIUsage = (amount: number = 1): boolean => {
    if (user.plan !== 'free') return true; // Unlimited
    
    if (user.aiUsed + amount > user.aiLimit) {
      return false; // Would exceed limit
    }
    setUser(prev => ({ ...prev, aiUsed: prev.aiUsed + amount }));
    return true;
  };

  // --- HANDLERS ---
  const handleStart = () => {
    setAppView('app');
    setUser(prev => ({ ...prev, isLoggedIn: true }));
  };

  const handleSubscribe = (plan: 'pro' | 'business') => {
    // In production, this opens Stripe Checkout
    // For now, simulate upgrade
    alert(`In production, this opens Stripe Checkout for ${plan} plan.\n\nSimulating upgrade...`);
    setUser({
      ...user,
      plan,
      aiLimit: PLAN_LIMITS[plan],
      aiUsed: 0,
    });
    setAppView('app');
  };

  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    // Free tier limit check
    if (user.plan === 'free' && expenses.length >= MAX_FREE_EXPENSES) {
      alert(`Free tier limited to ${MAX_FREE_EXPENSES} expenses. Upgrade to Pro for unlimited.`);
      setAppView('pricing');
      return;
    }
    const expenseWithId = { ...newExpense, id: crypto.randomUUID() };
    setExpenses(prev => [expenseWithId, ...prev]);
  };

  const handleEditExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleBriefing = async () => {
    if (!trackAIUsage(1)) {
      alert('AI credit limit reached. Upgrade to Pro for unlimited AI interactions.');
      setAppView('pricing');
      return;
    }
    
    setIsBriefing(true);
    const total = calculateTotalMonthlyBurn(expenses);
    
    const summary = `Welcome to Cannon AI. Your calculated monthly burn is ${currency.symbol}${total.toFixed(0)}. You are tracking ${expenses.length} distinct data points. Stay sharp.`;
    
    const buffer = await speakText(summary);
    if (buffer) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsBriefing(false);
      source.start(0);
    } else {
      setIsBriefing(false);
    }
  };

  // --- RENDER LEGAL ---
  if (appView === 'privacy' || appView === 'terms') {
    return (
      <Legal 
        page={appView}
        onBack={() => setAppView('landing')}
      />
    );
  }

  // --- RENDER LANDING ---
  if (appView === 'landing') {
    return (
      <LandingPage 
        onStart={handleStart} 
        onPricing={() => setAppView('pricing')}
        onPrivacy={() => setAppView('privacy')}
        onTerms={() => setAppView('terms')}
      />
    );
  }

  // --- RENDER PRICING ---
  if (appView === 'pricing') {
    return (
      <Pricing 
        onBack={() => setAppView(user.isLoggedIn ? 'app' : 'landing')}
        onSubscribe={handleSubscribe}
        currentPlan={user.plan}
      />
    );
  }

  // --- RENDER APP ---
  return (
    <div className="w-full h-screen bg-black text-white flex justify-center selection:bg-emerald-500/30">
      <div className="w-full max-w-lg h-full bg-[#050505] relative shadow-2xl flex flex-col border-x border-gray-900">
        
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-900 bg-black/80 backdrop-blur-xl z-20 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
                CANN.ON.AI
              </h1>
              <div className="h-4 w-[1px] bg-gray-800"></div>
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mt-0.5">FORGE</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleBriefing}
              disabled={isBriefing}
              className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-all ${isBriefing ? 'bg-emerald-500 text-black border-emerald-400 animate-pulse' : 'bg-black text-emerald-400 border-emerald-900 hover:border-emerald-500'}`}
            >
              {isBriefing ? "BRIEFING..." : "🔊 STANDUP"}
            </button>
            <select 
              value={currency.code}
              onChange={(e) => {
                const s = SUPPORTED_CURRENCIES.find(c => c.code === e.target.value);
                if(s) setCurrency(s);
              }}
              className="bg-transparent border-none text-xs font-black text-gray-400 focus:ring-0 cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
          </div>
        </div>

        {/* Usage Widget - Show for free users */}
        {user.plan === 'free' && (
          <div className="px-4 pt-3">
            <UsageWidget 
              used={user.aiUsed} 
              limit={user.aiLimit} 
              onUpgrade={() => setAppView('pricing')}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden relative">
          {view === ViewState.TRACKER && (
            <ExpenseList 
              expenses={expenses} 
              currency={currency} 
              onAdd={handleAddExpense} 
              onEdit={handleEditExpense} 
              onDelete={handleDeleteExpense}
              userPlan={user.plan}
              maxExpenses={MAX_FREE_EXPENSES}
              onUpgrade={() => setAppView('pricing')}
            />
          )}
          {view === ViewState.PLANNER && (
            <Planner 
              currency={currency} 
              expenses={expenses}
              trackAIUsage={trackAIUsage}
              onUpgrade={() => setAppView('pricing')}
            />
          )}
          {view === ViewState.LIVE && (
            <LiveSession 
              expenses={expenses} 
              currency={currency}
              trackAIUsage={trackAIUsage}
              onUpgrade={() => setAppView('pricing')}
            />
          )}
          {view === ViewState.MEDIA && (
            <MediaHub 
              trackAIUsage={trackAIUsage}
              onUpgrade={() => setAppView('pricing')}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="h-24 absolute bottom-0 w-full bg-black/95 backdrop-blur-2xl border-t border-gray-900 flex justify-around items-center px-4 z-30 pb-6">
          <NavBtn active={view === ViewState.TRACKER} onClick={() => setView(ViewState.TRACKER)} icon="📊" label="Assets" />
          <NavBtn active={view === ViewState.PLANNER} onClick={() => setView(ViewState.PLANNER)} icon="🧠" label="Strategy" />
          
          <button 
            onClick={() => setView(ViewState.LIVE)}
            className={`mb-10 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl transition-all active:scale-95 ${view === ViewState.LIVE ? 'bg-white text-black scale-110' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20'}`}
          >
            🎙️
          </button>
          
          <NavBtn active={view === ViewState.MEDIA} onClick={() => setView(ViewState.MEDIA)} icon="🛰️" label="IQ Hub" />
          <NavBtn active={false} onClick={() => setAppView('pricing')} icon="⚙️" label={user.plan === 'free' ? 'Upgrade' : 'Pro'} />
        </div>
      </div>
    </div>
  );
}

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 w-14 transition-colors ${active ? 'text-emerald-400' : 'text-gray-600 hover:text-gray-400'}`}>
    <span className="text-xl">{icon}</span>
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;

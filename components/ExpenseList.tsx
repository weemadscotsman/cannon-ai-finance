
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Expense, Currency, Frequency, SortMode } from '../types';
import { parseReceipt } from '../services/geminiService';
import { CATEGORIES } from '../constants';
import { normalizeToMonthly, calculateTotalMonthlyBurn, getCategoryBreakdown, validateExpenseInput, formatCurrency } from '../services/financeCore';
import { StorageRegistry } from '../services/storageRegistry';

interface Props {
  expenses: Expense[];
  currency: Currency;
  onAdd: (e: Omit<Expense, 'id'>) => void;
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
  userPlan?: 'free' | 'pro' | 'business';
  maxExpenses?: number;
  onUpgrade?: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Housing': '🏠', 'Utilities': '💡', 'Software': '🔄', 'Food': '🍔',
  'Transport': '🚗', 'Health': '❤️', 'Debt': '💳', 'Savings': '💰',
  'Investing': '📈', 'Entertainment': '🎬', 'Personal Care': '💅',
  'Education': '📚', 'Tech': '💻', 'Family': '👶', 'Pets': '🐾',
  'Gifts': '🎁', 'Insurance': '🛡️', 'Miscellaneous': '📦'
};

const FILTERS: ('all' | Frequency)[] = ['all', 'daily', 'weekly', 'monthly', 'yearly', 'one-time'];

export const ExpenseList: React.FC<Props> = ({ expenses, currency, onAdd, onEdit, onDelete, userPlan = 'free', maxExpenses = 100, onUpgrade }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Budget State
  const [budget, setBudget] = useState(() => StorageRegistry.loadBudget());
  const [showBudgetInput, setShowBudgetInput] = useState(false);

  // Save budget on change
  useEffect(() => {
    StorageRegistry.saveBudget(budget);
  }, [budget]);

  // Filter & Sort State
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | Frequency>('all');
  const [sortMode, setSortMode] = useState<SortMode>('highest');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Food',
    frequency: 'monthly' as Frequency,
    icon: '',
    isRecurring: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use core finance logic
  const totalMonthly = useMemo(() => calculateTotalMonthlyBurn(expenses), [expenses]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(expenses), [expenses]);

  const budgetProgress = Math.min((totalMonthly / budget) * 100, 100);
  const isOverBudget = totalMonthly > budget;
  
  // Determine color state
  const getProgressColor = () => {
      if (isOverBudget) return 'bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
      if (budgetProgress > 85) return 'bg-gradient-to-r from-yellow-600 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
      return 'bg-gradient-to-r from-emerald-600 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
  };

  const filtered = expenses
    .filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            e.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFreq = frequencyFilter === 'all' || e.frequency === frequencyFilter;
      return matchesSearch && matchesFreq;
    })
    .sort((a, b) => {
        const valA = normalizeToMonthly(a.amount, a.frequency);
        const valB = normalizeToMonthly(b.amount, b.frequency);
        
        switch (sortMode) {
            case 'highest': return valB - valA;
            case 'lowest': return valA - valB;
            case 'a-z': return a.name.localeCompare(b.name);
            case 'category': return a.category.localeCompare(b.category);
            default: return 0;
        }
    });

  const resetForm = () => {
    setFormData({ name: '', amount: '', category: 'Food', frequency: 'monthly', icon: '', isRecurring: true });
    setEditingId(null);
    setIsAdding(false);
    setIsScanning(false);
    setErrorMsg(null);
  };

  const startEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData({
      name: expense.name,
      amount: expense.amount.toString(),
      category: expense.category,
      frequency: expense.frequency,
      icon: expense.icon,
      isRecurring: expense.isRecurring ?? true
    });
    setIsAdding(true);
    setErrorMsg(null);
  };

  const handleSubmit = () => {
    setErrorMsg(null);
    const icon = formData.icon || CATEGORY_ICONS[formData.category] || '💸';
    const amount = parseFloat(formData.amount);
    
    const payload = {
        name: formData.name,
        amount,
        category: formData.category,
        frequency: formData.frequency,
        icon,
        isRecurring: formData.isRecurring
    };

    // Validate using Core Logic
    const error = validateExpenseInput(payload);
    if (error) {
        setErrorMsg(error);
        return;
    }

    if (editingId) {
      onEdit({ id: editingId, ...payload });
    } else {
      onAdd(payload);
    }
    resetForm();
  };

  const handleScanClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsScanning(true);
      if (!isAdding) setIsAdding(true);

      const reader = new FileReader();
      reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          try {
              const data = await parseReceipt(base64, file.type);
              setFormData(prev => ({
                  ...prev,
                  name: data.name,
                  amount: data.amount.toString(),
                  category: data.category || 'Food',
                  frequency: 'one-time', // Default scanned to one-time usually
                  isRecurring: false
              }));
          } catch (err) {
              console.error("Scanning failed", err);
              setErrorMsg("AI could not read receipt.");
          } finally {
              setIsScanning(false);
          }
      };
      reader.readAsDataURL(file);
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4 pb-24">
      {/* Financial Health & Budget Header */}
      <div className="glass-panel p-5 rounded-2xl bg-gradient-to-br from-emerald-950 to-black border-emerald-500/30 relative overflow-visible shrink-0 z-10">
        <div className="flex justify-between items-start z-10 relative">
            <div>
                <h2 className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Total Monthly Burn</h2>
                <div className="text-3xl font-black text-white mt-0.5 tracking-tight">{formatCurrency(totalMonthly, currency.code, currency.locale)}</div>
            </div>
            <div className="text-right cursor-pointer" onClick={() => setShowBudgetInput(!showBudgetInput)}>
                <h2 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Budget Limit</h2>
                {showBudgetInput ? (
                  <input 
                    type="number" 
                    className="bg-black/50 border border-emerald-500 rounded text-right w-24 text-xl font-bold text-white outline-none"
                    autoFocus
                    onBlur={() => setShowBudgetInput(false)}
                    value={budget}
                    onChange={e => setBudget(parseFloat(e.target.value))}
                  />
                ) : (
                  <div className="text-3xl font-black text-gray-500 mt-0.5 hover:text-white transition-colors tracking-tight">{formatCurrency(budget, currency.code, currency.locale)}</div>
                )}
            </div>
        </div>

        {/* Enhanced Budget Progress Bar */}
        <div className="mt-5 relative">
            <div className="flex justify-between text-[9px] uppercase font-black tracking-widest mb-1.5 px-0.5">
                <span className={isOverBudget ? 'text-red-400 animate-pulse' : (budgetProgress > 85 ? 'text-amber-400' : 'text-emerald-400')}>
                    {Math.round((totalMonthly / budget) * 100)}% CONSUMED
                </span>
                <span className="text-gray-500">
                    {formatCurrency(Math.max(0, budget - totalMonthly), currency.code, currency.locale)} REMAINING
                </span>
            </div>
            
            <div className="h-3 w-full bg-gray-900/80 rounded-full overflow-hidden border border-gray-800 relative shadow-inner">
                <div className="absolute inset-0 w-full h-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent 20%, rgba(0,0,0,0.5) 21%, transparent 22%)', backgroundSize: '20px 100%', zIndex: 1 }}></div>
                <div 
                    className={`h-full transition-all duration-700 ease-out relative z-0 ${getProgressColor()}`}
                    style={{ width: `${budgetProgress}%` }}
                >
                     <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20"></div>
                </div>
            </div>
            
            {isOverBudget && (
                 <div className="absolute -bottom-5 left-0 w-full text-center">
                    <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest animate-pulse bg-red-950/50 px-2 py-0.5 rounded border border-red-900/50">
                        ⚠️ Budget Cap Exceeded
                    </span>
                 </div>
            )}
        </div>

        <button 
            onClick={() => setShowAnalytics(!showAnalytics)} 
            className="w-full mt-6 flex items-center justify-center gap-1 text-[9px] uppercase font-bold tracking-widest text-gray-600 hover:text-emerald-400 transition-colors"
        >
            {showAnalytics ? 'Hide Metrics' : 'View Deep Metrics'} {showAnalytics ? '▲' : '▼'}
        </button>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
          <div className="glass-panel p-4 rounded-xl border border-gray-800 animate-in fade-in slide-in-from-top-2 shrink-0">
             <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Cost Center Breakdown</h3>
             <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                 {categoryBreakdown.map(([cat, amount]) => {
                     const pct = (amount / totalMonthly) * 100;
                     return (
                         <div key={cat} className="group">
                             <div className="flex justify-between text-[10px] text-gray-400 mb-1 group-hover:text-white transition-colors">
                                 <span>{cat}</span>
                                 <span className="font-mono">{Math.round(pct)}% ({formatCurrency(amount, currency.code, currency.locale)})</span>
                             </div>
                             <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full rounded-full ${pct > 40 ? 'bg-red-500' : pct > 20 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                    style={{ width: `${pct}%` }}
                                 ></div>
                             </div>
                         </div>
                     );
                 })}
             </div>
          </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex gap-2">
            <input 
                type="text" 
                placeholder="Search ledger..." 
                className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
             <select 
                className="bg-gray-900 border border-gray-800 rounded-xl px-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold uppercase tracking-wide"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
            >
                <option value="highest">Highest $$</option>
                <option value="lowest">Lowest $$</option>
                <option value="a-z">Name A-Z</option>
                <option value="category">Category</option>
            </select>
            <button 
                onClick={() => { resetForm(); setIsAdding(true); }}
                className="bg-emerald-600 text-white w-12 rounded-xl flex items-center justify-center text-2xl hover:bg-emerald-500 shadow-lg shadow-emerald-900/50"
            >
                +
            </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {FILTERS.map((f) => (
                <button
                    key={f}
                    onClick={() => setFrequencyFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-widest border transition-all whitespace-nowrap ${frequencyFilter === f ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'}`}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#0f0f0f] w-full max-w-md rounded-2xl border border-gray-800 p-6 shadow-2xl relative">
                <button onClick={resetForm} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
                
                <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                    {editingId ? 'Edit Entry' : 'New Cost Entry'}
                    {!editingId && (
                        <button 
                        onClick={handleScanClick}
                        className="text-[9px] bg-emerald-900/50 border border-emerald-500/50 px-2 py-1 rounded text-emerald-300 hover:bg-emerald-800 ml-auto uppercase tracking-widest"
                        >
                        {isScanning ? 'Processing...' : '📷 Scan'}
                        </button>
                    )}
                </h3>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

                {errorMsg && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-xs font-bold mb-4">
                        ⚠️ {errorMsg}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Description</label>
                        <input 
                            className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
                            placeholder="e.g. Camera Rental"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Cost</label>
                            <input 
                                type="number"
                                className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: e.target.value})}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Frequency</label>
                            <select 
                                className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none appearance-none"
                                value={formData.frequency}
                                onChange={e => setFormData({...formData, frequency: e.target.value as Frequency})}
                            >
                                <option value="one-time">One-Time</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 py-2">
                        <input 
                            type="checkbox" 
                            id="recurring"
                            className="w-4 h-4 accent-emerald-500 bg-gray-900 border-gray-800 rounded"
                            checked={formData.isRecurring}
                            onChange={e => setFormData({...formData, isRecurring: e.target.checked})}
                        />
                        <label htmlFor="recurring" className="text-xs text-gray-300 font-medium select-none">Mark as Auto-Pay / Recurring</label>
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Category</label>
                        <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFormData({...formData, category: cat})}
                                    className={`p-2 rounded-lg text-[10px] font-bold border transition-all truncate ${formData.category === cat ? 'bg-emerald-900 border-emerald-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'}`}
                                >
                                    {CATEGORY_ICONS[cat] || '🔹'} {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmit} 
                        disabled={isScanning}
                        className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-500 disabled:opacity-50 mt-4 shadow-lg shadow-emerald-900/20"
                    >
                        {editingId ? 'Update Record' : 'Commit to Ledger'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Free Tier Limit Warning */}
      {userPlan === 'free' && expenses.length >= maxExpenses * 0.8 && (
        <div className="shrink-0 mx-4 mb-2 p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl">
          <p className="text-xs text-amber-400 font-bold">
            {expenses.length >= maxExpenses 
              ? `Free limit reached (${maxExpenses}). ` 
              : `Almost at free limit (${expenses.length}/${maxExpenses}). `}
            <button onClick={onUpgrade} className="underline hover:text-amber-300">Upgrade to Pro</button>
          </p>
        </div>
      )}

      {/* Expense List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-20 custom-scrollbar">
        {filtered.length === 0 && (
            <div className="text-center text-gray-600 text-xs uppercase tracking-widest mt-10 font-bold">No records found.</div>
        )}
        {filtered.map(expense => (
          <div 
            key={expense.id} 
            onClick={() => startEdit(expense)}
            className="flex items-center justify-between p-3.5 bg-gray-900/20 rounded-xl border border-gray-800/50 hover:border-emerald-500/30 hover:bg-gray-900/40 transition-all group cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-lg border border-gray-800 relative">
                {expense.icon || CATEGORY_ICONS[expense.category] || '💸'}
                {expense.isRecurring && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-900 text-[8px] rounded-full w-4 h-4 flex items-center justify-center border border-emerald-500/50">🔄</div>
                )}
              </div>
              <div>
                <div className="font-bold text-white text-sm">{expense.name}</div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/50 uppercase tracking-widest">
                        {expense.category}
                    </span>
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest">
                        {expense.frequency}
                    </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
                 <div className="text-right">
                    <div className="font-mono text-white text-sm font-bold">{formatCurrency(expense.amount, currency.code, currency.locale)}</div>
                    {expense.frequency !== 'monthly' && expense.frequency !== 'one-time' && (
                        <div className="text-[9px] text-gray-600">
                            ≈ {formatCurrency(normalizeToMonthly(expense.amount, expense.frequency), currency.code, currency.locale)}/mo
                        </div>
                    )}
                 </div>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(expense.id); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-900/20 hover:text-red-500 transition-colors"
                 >
                    ✕
                 </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


import { Expense, Currency } from '../types';
import { INITIAL_EXPENSES, SUPPORTED_CURRENCIES } from '../constants';

const KEYS = {
  EXPENSES: 'cannon_ai_expenses_v1',
  CURRENCY: 'cannon_ai_currency_v1',
  BUDGET: 'cannon_ai_budget_v1'
};

export const StorageRegistry = {
  /**
   * Loads expenses. If empty, seeds with the massive INITIAL_EXPENSES list.
   */
  loadExpenses: (): Expense[] => {
    try {
      const stored = localStorage.getItem(KEYS.EXPENSES);
      if (!stored) return INITIAL_EXPENSES;
      
      const parsed = JSON.parse(stored);
      // Basic integrity check
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return INITIAL_EXPENSES;
    } catch (e) {
      console.warn("Corrupt storage found, resetting to default.", e);
      return INITIAL_EXPENSES;
    }
  },

  saveExpenses: (expenses: Expense[]) => {
    try {
      localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error("Failed to save expenses to local storage", e);
    }
  },

  loadCurrency: (): Currency => {
    try {
      const stored = localStorage.getItem(KEYS.CURRENCY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.code && parsed.symbol) return parsed;
      }
    } catch (e) {}
    return SUPPORTED_CURRENCIES[0];
  },

  saveCurrency: (currency: Currency) => {
    localStorage.setItem(KEYS.CURRENCY, JSON.stringify(currency));
  },

  loadBudget: (): number => {
    const stored = localStorage.getItem(KEYS.BUDGET);
    return stored ? parseFloat(stored) : 5000;
  },

  saveBudget: (amount: number) => {
    localStorage.setItem(KEYS.BUDGET, amount.toString());
  }
};

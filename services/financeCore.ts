
import { Expense, Frequency } from '../types';

// Multipliers for normalizing to monthly costs
const MULTIPLIERS: Record<Frequency, number> = {
  daily: 30.44, // Average days in month
  weekly: 4.345, // Average weeks in month
  monthly: 1,
  yearly: 1 / 12,
  'one-time': 0 // One-time costs do not contribute to monthly RECURRING burn
};

/**
 * Normalizes any amount to a monthly value based on frequency.
 * Returns 0 for one-time expenses (as they aren't monthly burn).
 */
export const normalizeToMonthly = (amount: number, frequency: Frequency): number => {
  if (amount < 0 || isNaN(amount)) return 0;
  return amount * (MULTIPLIERS[frequency] || 0);
};

/**
 * Calculates the total monthly burn rate from a list of expenses.
 */
export const calculateTotalMonthlyBurn = (expenses: Expense[]): number => {
  return expenses.reduce((total, item) => {
    if (!item.isRecurring && item.frequency === 'one-time') return total;
    // Note: If a user marks a weekly item as NOT recurring, should it count? 
    // For safety, we count everything except explicit 'one-time' frequency towards the "Average Monthly Cost".
    return total + normalizeToMonthly(item.amount, item.frequency);
  }, 0);
};

/**
 * Groups expenses by category and calculates totals.
 */
export const getCategoryBreakdown = (expenses: Expense[]) => {
  const map: Record<string, number> = {};
  
  expenses.forEach(e => {
    const val = normalizeToMonthly(e.amount, e.frequency);
    if (val > 0) {
      map[e.category] = (map[e.category] || 0) + val;
    }
  });

  return Object.entries(map)
    .sort(([, a], [, b]) => b - a); // Sort desc
};

/**
 * Validates expense input. Returns null if valid, error string if invalid.
 */
export const validateExpenseInput = (expense: Partial<Expense>): string | null => {
  if (!expense.name || expense.name.trim().length === 0) return "Name is required.";
  if (expense.amount === undefined || expense.amount === null || isNaN(expense.amount)) return "Amount must be a number.";
  if (expense.amount < 0) return "Amount cannot be negative.";
  if (!expense.category) return "Category is required.";
  return null;
};

/**
 * Formats a number as currency.
 */
export const formatCurrency = (amount: number, currencyCode: string = 'USD', locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(amount);
};

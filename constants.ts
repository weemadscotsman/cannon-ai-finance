
import { Expense, Currency } from './types';

// Models
export const MODEL_PLANNER = 'gemini-3-flash-preview'; // Switched to Flash for efficiency
export const MODEL_CHAT = 'gemini-3-flash-preview'; // General Chat + Search
export const MODEL_MAPS = 'gemini-2.5-flash-latest'; // Maps Grounding
export const MODEL_LIVE = 'gemini-2.5-flash-native-audio-preview-12-2025'; // Live
export const MODEL_IMAGE_EDIT = 'gemini-2.5-flash-image'; // Image Edit
export const MODEL_VEO = 'veo-3.1-fast-generate-preview'; // Video Gen
export const MODEL_TTS = 'gemini-2.5-flash-preview-tts'; // TTS
export const MODEL_TRANSCRIPTION = 'gemini-3-flash-preview'; // Audio Transcribe

// Top 20 Currencies
export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', locale: 'fr-CH' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', locale: 'es-MX' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'zh-HK' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' }
];

export const CATEGORIES = [
  'Housing', 'Utilities', 'Food', 'Transport', 'Health', 'Insurance', 'Debt', 'Savings', 'Investing', 'Entertainment', 'Personal Care', 'Education', 'Family', 'Pets', 'Gifts', 'Software', 'Tech', 'Miscellaneous'
];

// Massive 50+ Item "Life Simulator" Seed Data
export const INITIAL_EXPENSES: Expense[] = [
  // --- HOUSING ---
  { id: '1', category: 'Housing', name: 'Rent / Mortgage', amount: 2200, frequency: 'monthly', icon: '🏠', isRecurring: true },
  { id: '2', category: 'Housing', name: 'Property Tax / HOA', amount: 350, frequency: 'monthly', icon: '🏘️', isRecurring: true },
  { id: '3', category: 'Housing', name: 'Home Maintenance Fund', amount: 150, frequency: 'monthly', icon: '🔨', isRecurring: true },

  // --- UTILITIES ---
  { id: '4', category: 'Utilities', name: 'Electricity', amount: 120, frequency: 'monthly', icon: '⚡', isRecurring: true },
  { id: '5', category: 'Utilities', name: 'Water / Sewer', amount: 60, frequency: 'monthly', icon: '💧', isRecurring: true },
  { id: '6', category: 'Utilities', name: 'Gas / Heating', amount: 50, frequency: 'monthly', icon: '🔥', isRecurring: true },
  { id: '7', category: 'Utilities', name: 'Internet (Fiber)', amount: 89, frequency: 'monthly', icon: '🌐', isRecurring: true },
  { id: '8', category: 'Utilities', name: 'Mobile Phone Plan', amount: 75, frequency: 'monthly', icon: '📱', isRecurring: true },
  { id: '9', category: 'Utilities', name: 'Trash / Recycling', amount: 25, frequency: 'monthly', icon: '♻️', isRecurring: true },

  // --- FOOD ---
  { id: '10', category: 'Food', name: 'Groceries', amount: 150, frequency: 'weekly', icon: '🛒', isRecurring: true },
  { id: '11', category: 'Food', name: 'Dining Out', amount: 60, frequency: 'weekly', icon: '🍽️', isRecurring: false },
  { id: '12', category: 'Food', name: 'Morning Coffee', amount: 6, frequency: 'daily', icon: '☕', isRecurring: true },
  { id: '13', category: 'Food', name: 'Work Lunches', amount: 15, frequency: 'daily', icon: '🥪', isRecurring: true },
  { id: '14', category: 'Food', name: 'Snacks / Vending', amount: 20, frequency: 'weekly', icon: '🍫', isRecurring: false },
  { id: '15', category: 'Food', name: 'Alcohol / Bars', amount: 80, frequency: 'monthly', icon: '🍻', isRecurring: false },

  // --- TRANSPORT ---
  { id: '16', category: 'Transport', name: 'Car Payment', amount: 450, frequency: 'monthly', icon: '🚘', isRecurring: true },
  { id: '17', category: 'Transport', name: 'Car Insurance', amount: 110, frequency: 'monthly', icon: '🛡️', isRecurring: true },
  { id: '18', category: 'Transport', name: 'Fuel / Charging', amount: 140, frequency: 'monthly', icon: '⛽', isRecurring: true },
  { id: '19', category: 'Transport', name: 'Public Transit Pass', amount: 90, frequency: 'monthly', icon: '🚇', isRecurring: true },
  { id: '20', category: 'Transport', name: 'Uber / Lyft', amount: 35, frequency: 'monthly', icon: '🚕', isRecurring: false },
  { id: '21', category: 'Transport', name: 'Car Maint / Repairs', amount: 50, frequency: 'monthly', icon: '🔧', isRecurring: true },
  { id: '22', category: 'Transport', name: 'Parking / Tolls', amount: 30, frequency: 'monthly', icon: '🅿️', isRecurring: false },

  // --- HEALTH ---
  { id: '23', category: 'Health', name: 'Health Insurance Premium', amount: 250, frequency: 'monthly', icon: '🏥', isRecurring: true },
  { id: '24', category: 'Health', name: 'Gym Membership', amount: 60, frequency: 'monthly', icon: '💪', isRecurring: true },
  { id: '25', category: 'Health', name: 'Therapy / Mental Health', amount: 120, frequency: 'monthly', icon: '🧘', isRecurring: true },
  { id: '26', category: 'Health', name: 'Pharmacy / Meds', amount: 40, frequency: 'monthly', icon: '💊', isRecurring: true },
  { id: '27', category: 'Health', name: 'Dental / Vision Co-pay', amount: 200, frequency: 'yearly', icon: '👓', isRecurring: false },

  // --- PERSONAL CARE ---
  { id: '28', category: 'Personal Care', name: 'Haircuts / Salon', amount: 50, frequency: 'monthly', icon: '✂️', isRecurring: true },
  { id: '29', category: 'Personal Care', name: 'Toiletries / Hygiene', amount: 40, frequency: 'monthly', icon: '🧴', isRecurring: true },
  { id: '30', category: 'Personal Care', name: 'Cosmetics / Skincare', amount: 45, frequency: 'monthly', icon: '💄', isRecurring: true },
  { id: '31', category: 'Personal Care', name: 'Clothing / Apparel', amount: 100, frequency: 'monthly', icon: '👕', isRecurring: false },
  { id: '32', category: 'Personal Care', name: 'Laundry / Dry Cleaning', amount: 30, frequency: 'monthly', icon: '🧺', isRecurring: true },

  // --- SOFTWARE / TECH ---
  { id: '33', category: 'Software', name: 'Google One / iCloud', amount: 10, frequency: 'monthly', icon: '☁️', isRecurring: true },
  { id: '34', category: 'Software', name: 'AI Subscriptions', amount: 40, frequency: 'monthly', icon: '🤖', isRecurring: true },
  { id: '35', category: 'Software', name: 'Streaming (Netflix/HBO)', amount: 35, frequency: 'monthly', icon: '🎬', isRecurring: true },
  { id: '36', category: 'Software', name: 'Music (Spotify/Apple)', amount: 15, frequency: 'monthly', icon: '🎵', isRecurring: true },
  { id: '37', category: 'Tech', name: 'Hardware Upgrade Fund', amount: 100, frequency: 'monthly', icon: '💻', isRecurring: true },

  // --- DEBT / SAVINGS ---
  { id: '38', category: 'Debt', name: 'Student Loans', amount: 300, frequency: 'monthly', icon: '🎓', isRecurring: true },
  { id: '39', category: 'Debt', name: 'Credit Card Interest', amount: 60, frequency: 'monthly', icon: '💳', isRecurring: true },
  { id: '40', category: 'Savings', name: 'Emergency Fund', amount: 200, frequency: 'monthly', icon: '🆘', isRecurring: true },
  { id: '41', category: 'Investing', name: 'Retirement (401k/IRA)', amount: 500, frequency: 'monthly', icon: '📈', isRecurring: true },
  { id: '42', category: 'Investing', name: 'Crypto / Stocks', amount: 150, frequency: 'monthly', icon: '🪙', isRecurring: true },

  // --- FAMILY / PETS ---
  { id: '43', category: 'Family', name: 'Childcare / Babysitting', amount: 400, frequency: 'monthly', icon: '👶', isRecurring: true },
  { id: '44', category: 'Pets', name: 'Pet Food & Supplies', amount: 60, frequency: 'monthly', icon: '🐶', isRecurring: true },
  { id: '45', category: 'Pets', name: 'Vet Bills (Avg)', amount: 250, frequency: 'yearly', icon: '🩺', isRecurring: false },

  // --- LIFESTYLE ---
  { id: '46', category: 'Education', name: 'Books / Courses', amount: 40, frequency: 'monthly', icon: '📚', isRecurring: true },
  { id: '47', category: 'Entertainment', name: 'Movies / Events', amount: 80, frequency: 'monthly', icon: '🎟️', isRecurring: false },
  { id: '48', category: 'Entertainment', name: 'Gaming / Hobbies', amount: 50, frequency: 'monthly', icon: '🎮', isRecurring: true },
  { id: '49', category: 'Gifts', name: 'Birthdays / Holidays', amount: 600, frequency: 'yearly', icon: '🎁', isRecurring: false },
  { id: '50', category: 'Miscellaneous', name: 'Amazon / Online Shopping', amount: 100, frequency: 'monthly', icon: '📦', isRecurring: false },
  { id: '51', category: 'Miscellaneous', name: 'General Buffer', amount: 100, frequency: 'monthly', icon: '🤷', isRecurring: true },
];

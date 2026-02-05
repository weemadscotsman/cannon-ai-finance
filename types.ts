
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'one-time';

export type SortMode = 'highest' | 'lowest' | 'a-z' | 'category';

export interface Expense {
  id: string;
  category: string;
  name: string;
  amount: number;
  frequency: Frequency;
  icon: string;
  isRecurring?: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export enum ViewState {
  TRACKER = 'TRACKER',
  PLANNER = 'PLANNER',
  LIVE = 'LIVE',
  MEDIA = 'MEDIA',
  CHAT = 'CHAT'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isAudio?: boolean;
  audioData?: string; // base64
}

export interface GroundingSource {
  title: string;
  uri: string;
}

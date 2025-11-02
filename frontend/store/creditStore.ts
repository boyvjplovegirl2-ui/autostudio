// FILE: /AutoStudio/frontend/store/creditStore.ts
// DESCRIPTION: Global credit state management

import { create } from 'zustand';

export interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  createdAt: string;
}

export interface CreditStats {
  currentBalance: number;
  totalUsed: number;
  totalPurchased: number;
  plan: string;
  transactions: {
    purchases: number;
    deductions: number;
    refunds: number;
    bonuses: number;
  };
}

export interface CreditCosts {
  video: {
    perMinute: number;
    fiveSeconds: number;
    fifteenSeconds: number;
    thirtySeconds: number;
    sixtySeconds: number;
  };
  reprompt: {
    short: number;
    medium: number;
    long: number;
  };
  thumbnail: number;
  musicAI: number;
  policyScan: number;
}

interface CreditState {
  // State
  balance: number | null;
  transactions: CreditTransaction[];
  stats: CreditStats | null;
  costs: CreditCosts | null;
  isLoading: boolean;

  // Actions
  setBalance: (balance: number) => void;
  setTransactions: (transactions: CreditTransaction[]) => void;
  setStats: (stats: CreditStats) => void;
  setCosts: (costs: CreditCosts) => void;
  updateBalance: (amount: number) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useCreditStore = create<CreditState>((set) => ({
  // Initial state
  balance: null,
  transactions: [],
  stats: null,
  costs: null,
  isLoading: false,

  // Set balance
  setBalance: (balance) => set({ balance }),

  // Set transactions
  setTransactions: (transactions) => set({ transactions }),

  // Set stats
  setStats: (stats) =>
    set({
      stats,
      balance: stats.currentBalance,
    }),

  // Set costs
  setCosts: (costs) => set({ costs }),

  // Update balance (increment/decrement)
  updateBalance: (amount) =>
    set((state) => ({
      balance: state.balance !== null ? state.balance + amount : null,
    })),

  // Set loading
  setLoading: (loading) => set({ isLoading: loading }),

  // Reset store
  reset: () =>
    set({
      balance: null,
      transactions: [],
      stats: null,
      costs: null,
      isLoading: false,
    }),
}));
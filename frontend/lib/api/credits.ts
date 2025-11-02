// FILE: /AutoStudio/frontend/lib/api/credits.ts
// DESCRIPTION: API functions for credit operations

import apiClient from '../api-client';

/**
 * Get current credit balance
 */
export const getBalance = async () => {
  const response = await apiClient.get('/credits/balance');
  return response.data;
};

/**
 * Check if user has enough credits
 */
export const checkCredits = async (requiredAmount: number) => {
  const response = await apiClient.post('/credits/check', { requiredAmount });
  return response.data;
};

/**
 * Get credit transaction history
 */
export const getTransactionHistory = async (
  page: number = 1,
  limit: number = 20,
  type?: string,
) => {
  const response = await apiClient.get('/credits/history', {
    params: { page, limit, type },
  });
  return response.data;
};

/**
 * Get credit statistics
 */
export const getCreditStats = async () => {
  const response = await apiClient.get('/credits/stats');
  return response.data;
};

/**
 * Get credit costs configuration
 */
export const getCreditCosts = async () => {
  const response = await apiClient.get('/credits/costs');
  return response.data;
};

/**
 * Calculate credit cost for operation
 */
export const calculateCreditCost = async (params: {
  operation: 'video' | 'reprompt' | 'thumbnail' | 'music';
  durationSeconds?: number;
  resolution?: string;
}) => {
  const response = await apiClient.post('/credits/calculate-cost', params);
  return response.data;
};

/**
 * Deduct credits (internal)
 */
export const deductCredits = async (
  amount: number,
  reason: string,
  relatedVideoId?: string,
) => {
  const response = await apiClient.post('/credits/deduct', {
    amount,
    reason,
    relatedVideoId,
  });
  return response.data;
};

/**
 * Purchase credits
 */
export const purchaseCredits = async (amount: number, paymentMethod: string) => {
  const response = await apiClient.post('/credits/purchase', {
    amount,
    paymentMethod,
  });
  return response.data;
};
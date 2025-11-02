// FILE: /AutoStudio/frontend/hooks/useCredit.ts
// DESCRIPTION: Custom hook for credit operations

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCreditStore } from '@/store/creditStore';
import * as creditApi from '@/lib/api/credits';
import { toast } from 'sonner';

export const useCredit = () => {
  const queryClient = useQueryClient();
  const {
    balance,
    transactions,
    stats,
    costs,
    setBalance,
    setTransactions,
    setStats,
    setCosts,
    updateBalance,
  } = useCreditStore();

  // Fetch credit balance
  const {
    data: balanceData,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['credit-balance'],
    queryFn: creditApi.getBalance,
    refetchOnWindowFocus: true,
  });

  // Fetch credit statistics
  const {
    data: statsData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['credit-stats'],
    queryFn: creditApi.getCreditStats,
  });

  // Fetch credit costs
  const {
    data: costsData,
    isLoading: isLoadingCosts,
  } = useQuery({
    queryKey: ['credit-costs'],
    queryFn: creditApi.getCreditCosts,
    staleTime: Infinity, // Costs rarely change
  });

  // Fetch transaction history
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['credit-history'],
    queryFn: () => creditApi.getTransactionHistory(1, 50),
  });

  // Update store when data changes
  useEffect(() => {
    if (balanceData) {
      setBalance(balanceData.credits);
    }
  }, [balanceData, setBalance]);

  useEffect(() => {
    if (statsData) {
      setStats(statsData);
    }
  }, [statsData, setStats]);

  useEffect(() => {
    if (costsData) {
      setCosts(costsData);
    }
  }, [costsData, setCosts]);

  useEffect(() => {
    if (historyData) {
      setTransactions(historyData.transactions);
    }
  }, [historyData, setTransactions]);

  // Check credits mutation
  const checkCreditsMutation = useMutation({
    mutationFn: (requiredAmount: number) => creditApi.checkCredits(requiredAmount),
  });

  // Calculate cost mutation
  const calculateCostMutation = useMutation({
    mutationFn: creditApi.calculateCreditCost,
  });

  /**
   * Check if user has enough credits
   */
  const checkCredits = async (requiredAmount: number) => {
    try {
      const result = await checkCreditsMutation.mutateAsync(requiredAmount);
      
      if (!result.hasEnoughCredits) {
        toast.error(
          `Insufficient credits! You need ${requiredAmount} credits but only have ${result.currentBalance}.`,
          {
            action: {
              label: 'Buy Credits',
              onClick: () => {
                // Navigate to purchase page
                window.location.href = '/billing';
              },
            },
          },
        );
      }
      
      return result;
    } catch (error) {
      toast.error('Failed to check credits');
      throw error;
    }
  };

  /**
   * Calculate credit cost for operation
   */
  const calculateCost = async (params: {
    operation: 'video' | 'reprompt' | 'thumbnail' | 'music';
    durationSeconds?: number;
    resolution?: string;
  }) => {
    try {
      const result = await calculateCostMutation.mutateAsync(params);
      return result;
    } catch (error) {
      console.error('Failed to calculate cost:', error);
      throw error;
    }
  };

  /**
   * Refresh all credit data
   */
  const refreshCreditData = async () => {
    await Promise.all([
      refetchBalance(),
      refetchStats(),
      refetchHistory(),
    ]);
  };

  /**
   * Format credit amount
   */
  const formatCredits = (amount: number): string => {
    return amount.toLocaleString();
  };

  /**
   * Get credit color based on balance
   */
  const getCreditColor = (amount: number): string => {
    if (amount >= 100) return 'text-green-600';
    if (amount >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return {
    // State
    balance,
    transactions,
    stats,
    costs,
    
    // Loading states
    isLoading: isLoadingBalance || isLoadingStats || isLoadingCosts,
    isLoadingBalance,
    isLoadingStats,
    isLoadingHistory,
    
    // Actions
    checkCredits,
    calculateCost,
    refreshCreditData,
    
    // Utilities
    formatCredits,
    getCreditColor,
  };
};
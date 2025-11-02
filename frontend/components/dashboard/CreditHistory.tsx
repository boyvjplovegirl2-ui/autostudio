// FILE: /AutoStudio/frontend/components/dashboard/CreditHistory.tsx
// DESCRIPTION: Credit transaction history table

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, RefreshCw, Filter } from 'lucide-react';
import { useCredit } from '@/hooks/useCredit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function CreditHistory() {
  const { transactions, isLoadingHistory, formatCredits } = useCredit();
  const [filter, setFilter] = useState<string>('all');

  const filteredTransactions =
    filter === 'all'
      ? transactions
      : transactions.filter((t) => t.type === filter.toUpperCase());

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE':
      case 'BONUS':
      case 'REFUND':
      case 'REFERRAL_REWARD':
      case 'LEADERBOARD_REWARD':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'DEDUCTION':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatTransactionType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (isLoadingHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your credit transactions</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="deduction">Deductions</SelectItem>
                <SelectItem value="bonus">Bonuses</SelectItem>
                <SelectItem value="refund">Refunds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="mt-1">{getTransactionIcon(transaction.type)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium truncate">{transaction.reason}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{formatTransactionType(transaction.type)}</span>
                        <span>•</span>
                        <span>{format(new Date(transaction.createdAt), 'MMM d, yyyy HH:mm')}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div
                        className={cn(
                          'text-lg font-bold',
                          getTransactionColor(transaction.amount),
                        )}
                      >
                        {transaction.amount > 0 && '+'}
                        {formatCredits(transaction.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Balance: {formatCredits(transaction.balanceAfter)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
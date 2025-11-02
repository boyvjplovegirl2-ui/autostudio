// FILE: /AutoStudio/frontend/components/dashboard/CreditBalance.tsx
// DESCRIPTION: Credit balance display with animations

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Coins, Plus, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useCredit } from '@/hooks/useCredit';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function CreditBalance() {
  const { balance, stats, isLoadingBalance, formatCredits, getCreditColor } = useCredit();
  const [previousBalance, setPreviousBalance] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (balance !== null && previousBalance !== null && balance !== previousBalance) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
    if (balance !== null) {
      setPreviousBalance(balance);
    }
  }, [balance, previousBalance]);

  if (isLoadingBalance) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const balanceValue = balance ?? 0;
  const balanceChange = previousBalance !== null ? balanceValue - previousBalance : 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="w-4 h-4" />
              <span>Available Credits</span>
            </div>
            
            <div
              className={cn(
                'text-3xl font-bold transition-all duration-500',
                getCreditColor(balanceValue),
                isAnimating && 'scale-110',
              )}
            >
              {formatCredits(balanceValue)}
              
              {/* Balance change indicator */}
              {balanceChange !== 0 && (
                <span
                  className={cn(
                    'ml-2 text-sm font-normal inline-flex items-center gap-1',
                    balanceChange > 0 ? 'text-green-600' : 'text-red-600',
                  )}
                >
                  {balanceChange > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(balanceChange)}
                </span>
              )}
            </div>

            {/* Usage stats */}
            {stats && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                <span>Used: {formatCredits(stats.totalUsed)}</span>
                <span>•</span>
                <span>Purchased: {formatCredits(stats.totalPurchased)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/billing">
                <Plus className="w-4 h-4 mr-1" />
                Buy
              </Link>
            </Button>
          </div>
        </div>

        {/* Low credit warning */}
        {balanceValue < 10 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">⚠️</div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-yellow-900 dark:text-yellow-200">
                  Low credit balance
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  You're running low on credits. Purchase more to keep creating!
                </p>
              </div>
              <Button size="sm" variant="default" asChild>
                <Link href="/billing">Top Up</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
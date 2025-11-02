// FILE: /AutoStudio/backend/src/credits/credits.service.ts
// DESCRIPTION: Core credit management business logic

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { CreditTransactionType } from '@prisma/client';
import { DeductCreditDto, AddCreditDto } from './dto/credit.dto';

@Injectable()
export class CreditsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Get user's current credit balance
   */
  async getBalance(userId: string): Promise<{ credits: number; plan: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, plan: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      credits: user.credits,
      plan: user.plan,
    };
  }

  /**
   * Check if user has enough credits
   */
  async hasEnoughCredits(userId: string, requiredAmount: number): Promise<boolean> {
    const balance = await this.getBalance(userId);
    return balance.credits >= requiredAmount;
  }

  /**
   * Deduct credits from user (for video generation, etc.)
   */
  async deductCredits(
    userId: string,
    deductDto: DeductCreditDto,
  ): Promise<{
    success: boolean;
    newBalance: number;
    transactionId: string;
  }> {
    const { amount, reason, relatedVideoId, metadata } = deductDto;

    // Get current balance
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, totalCreditsUsed: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has enough credits
    if (user.credits < amount) {
      throw new BadRequestException(
        `Insufficient credits. You have ${user.credits} credits but need ${amount}`,
      );
    }

    // Deduct credits in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update user credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: { decrement: amount },
          totalCreditsUsed: { increment: amount },
        },
        select: { credits: true },
      });

      // Create transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.DEDUCTION,
          amount: -amount, // Negative for deduction
          balanceBefore: user.credits,
          balanceAfter: updatedUser.credits,
          reason,
          relatedVideoId,
          metadata,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREDIT_DEDUCTED',
          resource: 'credit',
          resourceId: transaction.id,
          description: `Deducted ${amount} credits: ${reason}`,
        },
      });

      return {
        newBalance: updatedUser.credits,
        transactionId: transaction.id,
      };
    });

    return {
      success: true,
      newBalance: result.newBalance,
      transactionId: result.transactionId,
    };
  }

  /**
   * Add credits to user (for purchase, bonus, refund)
   */
  async addCredits(
    userId: string,
    addDto: AddCreditDto,
  ): Promise<{
    success: boolean;
    newBalance: number;
    transactionId: string;
  }> {
    const { amount, type, reason, relatedPaymentId, metadata } = addDto;

    // Get current balance
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, totalCreditsPurchased: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Add credits in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update user credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: { increment: amount },
          totalCreditsPurchased:
            type === CreditTransactionType.PURCHASE
              ? { increment: amount }
              : undefined,
        },
        select: { credits: true },
      });

      // Create transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          type,
          amount, // Positive for addition
          balanceBefore: user.credits,
          balanceAfter: updatedUser.credits,
          reason,
          relatedPaymentId,
          metadata,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREDIT_PURCHASED',
          resource: 'credit',
          resourceId: transaction.id,
          description: `Added ${amount} credits: ${reason}`,
        },
      });

      return {
        newBalance: updatedUser.credits,
        transactionId: transaction.id,
      };
    });

    return {
      success: true,
      newBalance: result.newBalance,
      transactionId: result.transactionId,
    };
  }

  /**
   * Get credit transaction history
   */
  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
    type?: CreditTransactionType,
  ) {
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(type && { type }),
    };

    const [transactions, total] = await Promise.all([
      this.prisma.creditTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          amount: true,
          balanceBefore: true,
          balanceAfter: true,
          reason: true,
          relatedVideoId: true,
          relatedPaymentId: true,
          createdAt: true,
        },
      }),
      this.prisma.creditTransaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Calculate credit cost for video generation
   */
  calculateVideoCreditCost(durationSeconds: number, resolution: string): number {
    const baseCreditsPerMinute = parseInt(
      this.configService.get<string>('CREDIT_VIDEO_PER_MINUTE', '10'),
    );

    // Calculate base cost
    let credits = Math.ceil((durationSeconds / 60) * baseCreditsPerMinute);

    // Resolution multiplier
    const resolutionMultiplier: Record<string, number> = {
      '720p': 1,
      '1080p': 1.5,
      '4K': 3,
    };

    credits = Math.ceil(credits * (resolutionMultiplier[resolution] || 1));

    // Minimum 1 credit
    return Math.max(1, credits);
  }

  /**
   * Calculate credit cost for reprompt
   */
  calculateRepromptCreditCost(sceneDurationSeconds: number): number {
    if (sceneDurationSeconds < 10) {
      return parseInt(this.configService.get<string>('CREDIT_REPROMPT_SHORT', '1'));
    } else if (sceneDurationSeconds <= 30) {
      return parseInt(this.configService.get<string>('CREDIT_REPROMPT_MEDIUM', '2'));
    } else {
      return parseInt(this.configService.get<string>('CREDIT_REPROMPT_LONG', '4'));
    }
  }

  /**
   * Get credit costs configuration
   */
  getCreditCosts() {
    return {
      video: {
        perMinute: parseInt(this.configService.get<string>('CREDIT_VIDEO_PER_MINUTE', '10')),
        fiveSeconds: parseInt(this.configService.get<string>('CREDIT_VIDEO_5S', '1')),
        fifteenSeconds: parseInt(this.configService.get<string>('CREDIT_VIDEO_15S', '3')),
        thirtySeconds: parseInt(this.configService.get<string>('CREDIT_VIDEO_30S', '5')),
        sixtySeconds: parseInt(this.configService.get<string>('CREDIT_VIDEO_60S', '10')),
      },
      reprompt: {
        short: parseInt(this.configService.get<string>('CREDIT_REPROMPT_SHORT', '1')),
        medium: parseInt(this.configService.get<string>('CREDIT_REPROMPT_MEDIUM', '2')),
        long: parseInt(this.configService.get<string>('CREDIT_REPROMPT_LONG', '4')),
      },
      thumbnail: parseInt(this.configService.get<string>('CREDIT_THUMBNAIL', '1')),
      musicAI: parseInt(this.configService.get<string>('CREDIT_MUSIC_AI', '2')),
      policyScan: parseInt(this.configService.get<string>('CREDIT_POLICY_SCAN', '1')),
    };
  }

  /**
   * Zero-Trust Credit Confirmation (for large operations)
   */
  async confirmCreditUsage(
    userId: string,
    estimatedCost: number,
    operation: string,
  ): Promise<{ confirmed: boolean; userBalance: number }> {
    const balance = await this.getBalance(userId);

    // If cost is more than 50 credits, require explicit confirmation
    if (estimatedCost > 50) {
      // In a real implementation, this would:
      // 1. Create a pending confirmation record
      // 2. Send notification to user
      // 3. Wait for user confirmation via WebSocket or polling
      // For now, we just check balance
      
      if (balance.credits < estimatedCost) {
        throw new BadRequestException(
          `This operation requires ${estimatedCost} credits. You only have ${balance.credits} credits.`,
        );
      }
    }

    return {
      confirmed: balance.credits >= estimatedCost,
      userBalance: balance.credits,
    };
  }

  /**
   * Get credit statistics for user
   */
  async getCreditStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        totalCreditsUsed: true,
        totalCreditsPurchased: true,
        plan: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get transactions breakdown
    const [purchases, deductions, refunds, bonuses] = await Promise.all([
      this.prisma.creditTransaction.count({
        where: { userId, type: CreditTransactionType.PURCHASE },
      }),
      this.prisma.creditTransaction.count({
        where: { userId, type: CreditTransactionType.DEDUCTION },
      }),
      this.prisma.creditTransaction.count({
        where: { userId, type: CreditTransactionType.REFUND },
      }),
      this.prisma.creditTransaction.count({
        where: { userId, type: CreditTransactionType.BONUS },
      }),
    ]);

    return {
      currentBalance: user.credits,
      totalUsed: user.totalCreditsUsed,
      totalPurchased: user.totalCreditsPurchased,
      plan: user.plan,
      transactions: {
        purchases,
        deductions,
        refunds,
        bonuses,
      },
    };
  }
}
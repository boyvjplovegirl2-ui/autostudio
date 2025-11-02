// FILE: /AutoStudio/backend/src/credits/dto/credit.dto.ts
// DESCRIPTION: DTOs for credit operations

import { IsInt, IsPositive, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreditTransactionType } from '@prisma/client';

export class DeductCreditDto {
  @ApiProperty({
    example: 10,
    description: 'Amount of credits to deduct',
  })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: 'Video generation - 60 seconds',
    description: 'Reason for credit deduction',
  })
  @IsString()
  reason: string;

  @ApiProperty({
    example: 'video-123',
    description: 'Related video ID (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  relatedVideoId?: string;

  @ApiProperty({
    description: 'Additional metadata (optional)',
    required: false,
  })
  @IsOptional()
  metadata?: any;
}

export class AddCreditDto {
  @ApiProperty({
    example: 100,
    description: 'Amount of credits to add',
  })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: 'PURCHASE',
    enum: CreditTransactionType,
    description: 'Type of credit transaction',
  })
  @IsEnum(CreditTransactionType)
  type: CreditTransactionType;

  @ApiProperty({
    example: 'Purchased 100 credits via Stripe',
    description: 'Reason for credit addition',
  })
  @IsString()
  reason: string;

  @ApiProperty({
    example: 'payment-123',
    description: 'Related payment ID (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  relatedPaymentId?: string;

  @ApiProperty({
    description: 'Additional metadata (optional)',
    required: false,
  })
  @IsOptional()
  metadata?: any;
}

export class PurchaseCreditDto {
  @ApiProperty({
    example: 100,
    description: 'Amount of credits to purchase',
    enum: [50, 100, 250, 500, 1000],
  })
  @IsInt()
  @Min(10, { message: 'Minimum purchase is 10 credits' })
  amount: number;

  @ApiProperty({
    example: 'stripe',
    description: 'Payment method',
    enum: ['stripe', 'momo', 'zalopay', 'vnpay'],
  })
  @IsString()
  paymentMethod: string;
}

export class CheckCreditDto {
  @ApiProperty({
    example: 10,
    description: 'Amount of credits needed',
  })
  @IsInt()
  @IsPositive()
  requiredAmount: number;
}

export class CreditHistoryQueryDto {
  @ApiProperty({
    example: 1,
    description: 'Page number',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    example: 20,
    description: 'Items per page',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    example: 'DEDUCTION',
    enum: CreditTransactionType,
    description: 'Filter by transaction type',
    required: false,
  })
  @IsOptional()
  @IsEnum(CreditTransactionType)
  type?: CreditTransactionType;
}
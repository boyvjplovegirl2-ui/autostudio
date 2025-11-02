// FILE: /AutoStudio/backend/src/credits/credits.controller.ts
// DESCRIPTION: Credit REST API endpoints

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserId } from '../common/decorators/auth.decorators';
import { CreditsService } from './credits.service';
import {
  DeductCreditDto,
  AddCreditDto,
  CheckCreditDto,
  CreditHistoryQueryDto,
} from './dto/credit.dto';

@ApiTags('Credits')
@Controller('credits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CreditsController {
  constructor(private creditsService: CreditsService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get current credit balance' })
  @ApiResponse({ status: 200, description: 'Credit balance retrieved' })
  async getBalance(@GetUserId() userId: string) {
    return this.creditsService.getBalance(userId);
  }

  @Post('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if user has enough credits' })
  @ApiResponse({ status: 200, description: 'Credit check result' })
  async checkCredits(
    @GetUserId() userId: string,
    @Body() checkDto: CheckCreditDto,
  ) {
    const hasEnough = await this.creditsService.hasEnoughCredits(
      userId,
      checkDto.requiredAmount,
    );

    const balance = await this.creditsService.getBalance(userId);

    return {
      hasEnoughCredits: hasEnough,
      currentBalance: balance.credits,
      required: checkDto.requiredAmount,
      deficit: hasEnough ? 0 : checkDto.requiredAmount - balance.credits,
    };
  }

  @Post('deduct')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deduct credits (internal use)' })
  @ApiResponse({ status: 200, description: 'Credits deducted successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient credits' })
  async deductCredits(
    @GetUserId() userId: string,
    @Body() deductDto: DeductCreditDto,
  ) {
    return this.creditsService.deductCredits(userId, deductDto);
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add credits (admin use)' })
  @ApiResponse({ status: 200, description: 'Credits added successfully' })
  async addCredits(
    @GetUserId() userId: string,
    @Body() addDto: AddCreditDto,
  ) {
    return this.creditsService.addCredits(userId, addDto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get credit transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved' })
  async getHistory(
    @GetUserId() userId: string,
    @Query() query: CreditHistoryQueryDto,
  ) {
    return this.creditsService.getTransactionHistory(
      userId,
      query.page,
      query.limit,
      query.type,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get credit statistics' })
  @ApiResponse({ status: 200, description: 'Credit statistics retrieved' })
  async getStats(@GetUserId() userId: string) {
    return this.creditsService.getCreditStats(userId);
  }

  @Get('costs')
  @ApiOperation({ summary: 'Get credit costs configuration' })
  @ApiResponse({ status: 200, description: 'Credit costs retrieved' })
  async getCosts() {
    return this.creditsService.getCreditCosts();
  }

  @Post('calculate-cost')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate credit cost for operation' })
  @ApiResponse({ status: 200, description: 'Cost calculated' })
  async calculateCost(
    @Body()
    body: {
      operation: 'video' | 'reprompt' | 'thumbnail' | 'music';
      durationSeconds?: number;
      resolution?: string;
    },
  ) {
    let cost = 0;

    switch (body.operation) {
      case 'video':
        cost = this.creditsService.calculateVideoCreditCost(
          body.durationSeconds || 60,
          body.resolution || '1080p',
        );
        break;
      case 'reprompt':
        cost = this.creditsService.calculateRepromptCreditCost(
          body.durationSeconds || 10,
        );
        break;
      case 'thumbnail':
        cost = this.creditsService.getCreditCosts().thumbnail;
        break;
      case 'music':
        cost = this.creditsService.getCreditCosts().musicAI;
        break;
    }

    return {
      operation: body.operation,
      estimatedCost: cost,
      parameters: body,
    };
  }
}
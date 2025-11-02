// FILE: /AutoStudio/backend/src/credits/credits.module.ts
// DESCRIPTION: Credit module configuration

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [CreditsController],
  providers: [CreditsService, PrismaService],
  exports: [CreditsService],
})
export class CreditsModule {}
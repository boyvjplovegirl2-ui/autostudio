// FILE: /AutoStudio/backend/src/auth/auth.service.ts
// DESCRIPTION: Core authentication business logic

import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole, SubscriptionPlan } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register new user
   */
  async register(registerDto: RegisterDto) {
    const { email, password, name, referralCode } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.USER,
        plan: SubscriptionPlan.FREE,
        credits: 10, // FREE plan starts with 10 credits
        videosLimit: 1,
      },
    });

    // Handle referral bonus
    if (referralCode) {
      await this.handleReferralBonus(referralCode, user.id);
    }

    // Generate email verification token
    const verificationToken = this.generateToken(user.id, '24h');

    // TODO: Send verification email
    // await this.emailService.sendVerificationEmail(user.email, verificationToken);

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTER',
        resource: 'user',
        resourceId: user.id,
        description: `User registered: ${email}`,
      },
    });

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check email verification
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in',
      );
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        // lastLoginIp: req.ip, // Add this in controller
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'user',
        resourceId: user.id,
        description: `User logged in: ${email}`,
      },
    });

    // Generate tokens
    const accessToken = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        plan: user.plan,
        credits: user.credits,
      },
    };
  }

  /**
   * Google OAuth login
   */
  async googleLogin(googleUser: any) {
    const { googleId, email, name, avatar } = googleUser;

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user from Google
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          avatar,
          googleId,
          emailVerified: new Date(), // Google emails are pre-verified
          role: UserRole.USER,
          plan: SubscriptionPlan.FREE,
          credits: 10,
          videosLimit: 1,
        },
      });

      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTER',
          resource: 'user',
          resourceId: user.id,
          description: `User registered via Google: ${email}`,
        },
      });
    } else {
      // Update Google ID if not set
      if (!user.googleId) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // Generate tokens
    const accessToken = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        plan: user.plan,
        credits: user.credits,
      },
    };
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('Invalid verification token');
      }

      if (user.emailVerified) {
        return { message: 'Email already verified' };
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If an account exists, a reset link has been sent' };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = this.generateToken(user.id, '1h');

    // TODO: Send reset email
    // await this.emailService.sendPasswordResetEmail(email, resetToken);

    return { message: 'If an account exists, a reset link has been sent' };
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('Invalid reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const userId = payload.sub;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.deletedAt) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new access token
      const accessToken = this.generateToken(user.id);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, expiresIn?: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, {
      expiresIn: expiresIn || this.configService.get<string>('JWT_EXPIRES_IN'),
    });
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN'),
    });
  }

  /**
   * Handle referral bonus
   */
  private async handleReferralBonus(referralCode: string, newUserId: string) {
    // TODO: Implement referral logic
    // 1. Find referrer by code
    // 2. Add bonus credits to referrer
    // 3. Add bonus credits to new user
    // 4. Create credit transactions
  }
}
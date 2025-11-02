// FILE: /AutoStudio/backend/src/common/decorators/auth.decorators.ts
// DESCRIPTION: Custom decorators for authentication

import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Decorator to mark routes as public (no authentication required)
 * Usage: @Public()
 */
export const Public = () => SetMetadata('isPublic', true);

/**
 * Decorator to specify required roles
 * Usage: @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

/**
 * Decorator to get current user from request
 * Usage: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

/**
 * Decorator to get user ID from request
 * Usage: @GetUserId() userId: string
 */
export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
);
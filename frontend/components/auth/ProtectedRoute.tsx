// FILE: /AutoStudio/frontend/components/auth/ProtectedRoute.tsx
// DESCRIPTION: Wrapper component to protect routes requiring authentication

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  requiredPlan?: string[];
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPlan,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, setLoading } = useAuthStore();

  useEffect(() => {
    // Initial check
    if (!isLoading && !isAuthenticated) {
      // Save intended destination
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
      return;
    }

    // Role check
    if (requiredRole && user && !requiredRole.includes(user.role)) {
      router.push('/dashboard');
      return;
    }

    // Plan check
    if (requiredPlan && user && !requiredPlan.includes(user.plan)) {
      router.push('/pricing');
      return;
    }

    // Mark as loaded
    setLoading(false);
  }, [isAuthenticated, isLoading, user, requiredRole, requiredPlan, router, pathname, setLoading]);

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Role/Plan mismatch
  if (
    (requiredRole && user && !requiredRole.includes(user.role)) ||
    (requiredPlan && user && !requiredPlan.includes(user.plan))
  ) {
    return null;
  }

  // All checks passed
  return <>{children}</>;
}
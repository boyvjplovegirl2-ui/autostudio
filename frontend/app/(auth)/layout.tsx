// FILE: /AutoStudio/frontend/app/(auth)/layout.tsx
// DESCRIPTION: Layout for authentication pages (login, register)

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (!isLoading && isAuthenticated) {
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, router]);

  // Don't render auth pages if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
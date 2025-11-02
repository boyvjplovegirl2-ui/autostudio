// FILE: /AutoStudio/frontend/hooks/useAuth.ts
// DESCRIPTION: Custom hook for authentication operations

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import * as authApi from '@/lib/api/auth';
import { toast } from 'sonner';

export const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setTokens, logout: logoutStore, user, isAuthenticated } = useAuthStore();

  /**
   * Register new user
   */
  const register = async (data: authApi.RegisterPayload) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);
      
      toast.success('Registration successful! Please check your email to verify your account.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (data: authApi.LoginPayload) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(data);
      
      // Save tokens and user to store
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      
      toast.success(`Welcome back, ${response.user.name || response.user.email}!`);
      
      // Redirect to dashboard
      router.push('/dashboard');
      
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    logoutStore();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  /**
   * Google OAuth login
   */
  const loginWithGoogle = () => {
    const googleAuthUrl = authApi.getGoogleAuthUrl();
    window.location.href = googleAuthUrl;
  };

  /**
   * Verify email
   */
  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.verifyEmail(token);
      toast.success('Email verified successfully! You can now login.');
      router.push('/login');
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Email verification failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Request password reset
   */
  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.forgotPassword(email);
      toast.success('If an account exists, a reset link has been sent to your email.');
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Request failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.resetPassword(token, newPassword);
      toast.success('Password reset successfully! You can now login with your new password.');
      router.push('/login');
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load user profile
   */
  const loadProfile = async () => {
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Failed to load profile:', error);
      throw error;
    }
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    
    // Actions
    register,
    login,
    logout,
    loginWithGoogle,
    verifyEmail,
    forgotPassword,
    resetPassword,
    loadProfile,
  };
};
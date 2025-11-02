// FILE: /AutoStudio/frontend/lib/api/auth.ts
// DESCRIPTION: API functions for authentication

import apiClient from '../api-client';

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  referralCode?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    role: string;
    plan: string;
    credits: number;
  };
}

/**
 * Register new user
 */
export const register = async (data: RegisterPayload) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

/**
 * Get current user profile
 */
export const getProfile = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

/**
 * Verify email
 */
export const verifyEmail = async (token: string) => {
  const response = await apiClient.post('/auth/verify-email', { token });
  return response.data;
};

/**
 * Request password reset
 */
export const forgotPassword = async (email: string) => {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, newPassword: string) => {
  const response = await apiClient.post('/auth/reset-password', {
    token,
    newPassword,
  });
  return response.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string) => {
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  return response.data;
};

/**
 * Google OAuth login URL
 */
export const getGoogleAuthUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return `${apiUrl}/auth/google`;
};
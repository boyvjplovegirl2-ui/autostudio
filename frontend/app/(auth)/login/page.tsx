// FILE: /AutoStudio/frontend/app/(auth)/login/page.tsx
// DESCRIPTION: Login page

import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Login - AutoStudio.AI',
  description: 'Sign in to your AutoStudio account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-12 text-white items-center justify-center">
        <div className="max-w-md space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AutoStudio.AI</h1>
              <p className="text-sm text-white/80">Media-as-a-Service Platform</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              Create stunning videos with AI in minutes
            </h2>
            <p className="text-lg text-white/90">
              Join thousands of creators using AutoStudio to generate professional videos, thumbnails, and audio content.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-white/80">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold">500K+</div>
              <div className="text-sm text-white/80">Videos Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm text-white/80">AI Models</div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-8">
            <p className="text-sm italic mb-3">
              "AutoStudio has completely transformed how I create content. What used to take hours now takes minutes!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20" />
              <div>
                <div className="font-semibold">Sarah Johnson</div>
                <div className="text-xs text-white/70">Content Creator, 2M subscribers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
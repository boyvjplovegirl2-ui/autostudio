// FILE: /AutoStudio/frontend/app/(auth)/register/page.tsx
// DESCRIPTION: Registration page

import RegisterForm from '@/components/auth/RegisterForm';
import { Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Sign Up - AutoStudio.AI',
  description: 'Create your AutoStudio account and start creating',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <RegisterForm />
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 text-white items-center justify-center">
        <div className="max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AutoStudio.AI</h1>
              <p className="text-sm text-white/80">v6.9 Enterprise Platform</p>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Start creating professional videos today
            </h2>
            <p className="text-lg text-white/90">
              Get 10 free credits to explore our AI-powered video creation platform. No credit card required.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Zap className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">AI-Powered</h3>
              <p className="text-sm text-white/80">
                Generate videos in seconds with advanced AI models
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Shield className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">Blockchain Proof</h3>
              <p className="text-sm text-white/80">
                Your creations protected on Polygon blockchain
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <TrendingUp className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">Monetization</h3>
              <p className="text-sm text-white/80">
                Track and optimize revenue with AI predictions
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Sparkles className="w-8 h-8 mb-2" />
              <h3 className="font-semibold mb-1">Multi-Platform</h3>
              <p className="text-sm text-white/80">
                Publish to YouTube, TikTok, Instagram instantly
              </p>
            </div>
          </div>

          {/* What you get */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">What you get with FREE plan:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span className="text-sm">10 free credits to start</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span className="text-sm">Create up to 1 video per month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span className="text-sm">720p video quality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span className="text-sm">Access to all AI models</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span className="text-sm">30-second video length</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
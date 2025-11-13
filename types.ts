// FIX: Create content for types.ts to resolve module and type errors.
export type Page =
  | 'dashboard'
  | 'story-generator'
  | 'prompt-generator'
  | 'image-generator'
  | 'video-generator'
  | 'thumbnail-generator'
  | 'youtube-script-generator'
  | 'short-highlight-generator'
  | 'video-from-image-generator'
  | 'consistent-video-generator'
  | 'auto-generator'
  | 'video-merger'
  | 'history'
  | 'pricing'
  | 'support'
  | 'copyright'
  | 'admin'
  | 'profile'
  | 'social-manager';

export type PlanName = 'Cá nhân' | 'Cá nhân Pro' | 'Team' | 'Doanh nghiệp';

export interface UserSettings {
    theme: 'light' | 'dark' | 'system';
    notifications: {
        email: boolean;
        push: boolean;
        system: boolean;
    };
    performanceMode: boolean;
}

export interface UserDevice {
    id: string;
    deviceName: string; // e.g., "Chrome on Windows"
    ip: string;
    lastLogin: Date;
    isCurrent: boolean;
}


export interface User {
  name: string;
  email: string;
  plan: PlanName | 'Chưa kích hoạt';
  isAdmin: boolean;
  credits: number;
  language?: 'vi' | 'en' | 'jp';
  // New optional fields for profile
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  phone?: string;
  country?: string;
  gender?: 'male' | 'female' | 'other';
  settings?: UserSettings;
}

export interface Plan {
    name: PlanName;
    price: string;
    description: string;
    features: string[];
    isPopular?: boolean;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  genre:string;
  length: string;
  emotion: string;
  createdAt: Date;
  generatedTitle?: string;
  generatedDescription?: string;

  generatedHashtags?: string;
  language?: string;
  generatedMetaPlatform?: string;
}

export type GeneratedItemType = 'prompt' | 'image' | 'video' | 'thumbnail' | 'short-highlight';

export interface GeneratedItem {
  id: string;
  type: GeneratedItemType;
  prompt: string;
  content: string; // URL for image/video, text for prompt
  createdAt: Date;
}

export interface VideoScene {
  id: string;
  prompt: string;
  status: 'new' | 'generating' | 'completed' | 'error';
  generatedVideoUrl?: string;
  operationResult?: any; // To store the result from the long-running operation
  errorMessage?: string;
  duration?: number;
}

export type ImagePromptStatus = 'ready' | 'running' | 'done' | 'error' | 'cancelled';
export interface ImagePrompt {
    id: string;
    prompt: string;
    useInputImage: boolean;
    aspectRatio: AspectRatio;
    seed: string;
    quantity: number;
    status: ImagePromptStatus;
    resultUrl?: string;
    error?: string;
}


export interface AdminUser {
    id: string;
    email: string;
    plan: string;
    credits: number;
    status: 'active' | 'banned';
    createdAt: Date;
    name?: string;
    phone?: string;
    country?: string;
}

export interface Payment {
    id: string;
    userId: string;
    userEmail: string;
    amount: number;
    plan: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
}

export interface Job {
    id: string;
    type: 'video' | 'image' | 'story' | 'prompt';
    status: 'queued' | 'processing' | 'completed' | 'failed';
    error: string | null;
    createdAt: Date;
}

export interface AdminLog {
    id: string;
    timestamp: Date;
    actor: string;
    action: string;
}

export interface YouTubeScript {
  id: string;
  url: string;
  request: string;
  result: string;
  createdAt: Date;
}

export interface AdminAnnouncement {
    id: string;
    content: string;
    createdAt: Date;
    sentBy: string;
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

// --- Social Manager Types ---
export type SocialPlatform = 'Facebook' | 'YouTube' | 'Instagram' | 'TikTok';

export interface SocialAccount {
    id: string;
    platform: SocialPlatform;
    username: string;
    displayName: string;
    avatarUrl: string;
    isConnected: boolean;
    stats: {
        followers: number;
        following: number;
    }
}

export type SocialPostStatus = 'published' | 'scheduled' | 'draft' | 'error';

export interface SocialPost {
    id: string;
    accountId: string;
    platform: SocialPlatform;
    content: string;
    mediaUrl?: string; // URL for image or video
    status: SocialPostStatus;
    publishAt: Date;
    stats: {
        likes: number;
        comments: number;
        shares: number;
        views?: number;
    };
}
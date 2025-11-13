import React, { useState } from 'react';
import { User, SocialAccount, SocialPost } from '../types';
import Card from '../components/ui/Card';

// Import sub-components for Social Manager
import SocialDashboard from '../components/social/SocialDashboard';
import AccountManager from '../components/social/AccountManager';
import PostScheduler from '../components/social/PostScheduler';
import PostHistory from '../components/social/PostHistory';
import { DocumentChartBarIcon, UsersIcon, ClockIcon, QueueListIcon } from '../components/icons/Icons';


// Mock Data
const initialAccounts: SocialAccount[] = [
    { id: 'fb1', platform: 'Facebook', username: 'studioauto.fb', displayName: 'Studio Auto FB Page', avatarUrl: 'https://picsum.photos/seed/fb/40', isConnected: true, stats: { followers: 12500, following: 10 } },
    { id: 'yt1', platform: 'YouTube', username: 'studioautochannel', displayName: 'Studio Auto Official', avatarUrl: 'https://picsum.photos/seed/yt/40', isConnected: true, stats: { followers: 88000, following: 2 } },
    { id: 'ig1', platform: 'Instagram', username: '@studio.auto', displayName: 'Studio Auto', avatarUrl: 'https://picsum.photos/seed/ig/40', isConnected: false, stats: { followers: 4200, following: 500 } },
    { id: 'tk1', platform: 'TikTok', username: '@studioauto.fun', displayName: 'Studio Auto Fun Clips', avatarUrl: 'https://picsum.photos/seed/tk/40', isConnected: false, stats: { followers: 250000, following: 25 } },
];

const initialPosts: SocialPost[] = [
    { id: 'p1', accountId: 'fb1', platform: 'Facebook', content: 'Our new AI video generator is here! Check out Veo 3.1 capabilities.', mediaUrl: 'https://picsum.photos/seed/post1/400/200', status: 'published', publishAt: new Date(Date.now() - 86400000), stats: { likes: 1200, comments: 85, shares: 45 } },
    { id: 'p2', accountId: 'yt1', platform: 'YouTube', content: 'Tutorial: Creating Cinematic Scenes with AI', mediaUrl: 'https://picsum.photos/seed/post2/400/200', status: 'published', publishAt: new Date(Date.now() - 172800000), stats: { likes: 12000, comments: 1100, shares: 0, views: 150000 } },
    { id: 'p3', accountId: 'fb1', platform: 'Facebook', content: 'Behind the scenes of our new short film, created entirely with AI.', mediaUrl: 'https://picsum.photos/seed/post3/400/200', status: 'scheduled', publishAt: new Date(Date.now() + 86400000 * 2), stats: { likes: 0, comments: 0, shares: 0 } },
];

type SocialTab = 'dashboard' | 'accounts' | 'scheduler' | 'history';

interface SocialManagerProps {
    user: User;
}

const SocialManager: React.FC<SocialManagerProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<SocialTab>('dashboard');
    const [accounts, setAccounts] = useState<SocialAccount[]>(initialAccounts);
    const [posts, setPosts] = useState<SocialPost[]>(initialPosts);

    const handleAccountToggle = (accountId: string) => {
        setAccounts(prev => prev.map(acc => 
            acc.id === accountId ? { ...acc, isConnected: !acc.isConnected } : acc
        ));
    };

    const addPost = (post: Omit<SocialPost, 'id' | 'stats'>) => {
        const newPost: SocialPost = {
            ...post,
            id: `post-${Date.now()}`,
            stats: { likes: 0, comments: 0, shares: 0 }
        };
        setPosts(prev => [newPost, ...prev]);
    };
    
    const tabs: { id: SocialTab, label: string, icon: React.ElementType }[] = [
        { id: 'dashboard', label: 'Dashboard', icon: DocumentChartBarIcon },
        { id: 'accounts', label: 'Tài khoản', icon: UsersIcon },
        { id: 'scheduler', label: 'Lên lịch', icon: ClockIcon },
        { id: 'history', label: 'Lịch sử', icon: QueueListIcon },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <SocialDashboard accounts={accounts} posts={posts} />;
            case 'accounts':
                return <AccountManager user={user} accounts={accounts} onToggleConnect={handleAccountToggle} />;
            case 'scheduler':
                return <PostScheduler accounts={accounts.filter(a => a.isConnected)} posts={posts} addPost={addPost} />;
            case 'history':
                return <PostHistory posts={posts.filter(p => p.status === 'published')} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Quản lý Mạng Xã Hội</h2>
                    <p className="text-gray-500 mt-1">Quản lý, đăng bài và theo dõi hiệu suất các kênh truyền thông của bạn tại một nơi.</p>
                </div>
            </div>

            <div className="flex border-b border-light-border dark:border-dark-border tab-button-container">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 font-semibold flex items-center gap-2 ${activeTab === tab.id ? 'active-tab' : 'text-gray-500'}`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="page-fade-in">
                {renderContent()}
            </div>
        </div>
    );
};

export default SocialManager;
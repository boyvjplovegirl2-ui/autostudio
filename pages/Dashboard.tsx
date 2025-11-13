import React from 'react';
import Card from '../components/ui/Card';
import { Page, Story, GeneratedItem, User } from '../types';
import { DocumentTextIcon, SparklesIcon, PhotoIcon, FilmIcon, UsersIcon, ClockIcon, BanknotesIcon, BoltIcon } from '../components/icons/Icons';
import Button from '../components/ui/Button';

interface DashboardProps {
    user: User | null;
    generatedItems: GeneratedItem[];
    stories: Story[];
    setCurrentPage: (page: Page) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <Card className="flex items-center p-4">
        <div className="p-3 rounded-full bg-primary/20 text-primary mr-4">
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
    </Card>
);

const QuickActionButton: React.FC<{ label: string, icon: React.ElementType, onClick: () => void, colorClass: string }> = ({ label, icon: Icon, onClick, colorClass }) => (
     <button onClick={onClick} className="p-4 bg-light-card dark:bg-dark-card rounded-lg flex flex-col items-center justify-center text-center hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors shadow-sm hover:shadow-md border border-light-border dark:border-dark-border">
        <Icon className={`w-8 h-8 ${colorClass} mb-2`} />
        <span className="font-semibold text-sm">{label}</span>
    </button>
);

const Dashboard: React.FC<DashboardProps> = ({ user, generatedItems, stories, setCurrentPage }) => {
    const videoCount = generatedItems.filter(item => item.type === 'video').length;
    const imageCount = generatedItems.filter(item => item.type === 'image').length;
    const promptCount = generatedItems.filter(item => item.type === 'prompt').length;
    const storyCount = stories.length;

    const recentActivity = [...stories, ...generatedItems]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
        
    const itemIcons: Record<string, React.ElementType> = {
        story: DocumentTextIcon,
        prompt: SparklesIcon,
        image: PhotoIcon,
        video: FilmIcon,
        thumbnail: PhotoIcon,
        'short-highlight': FilmIcon,
    };

    return (
        <div className="space-y-8">
             {user && (
                <Card>
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <UsersIcon className="w-7 h-7 text-white" />
                        </div>
                        </div>
                        <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Chào mừng trở lại, {user.name}!</h3>
                        <div className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                            <p><strong className="font-semibold text-gray-800 dark:text-gray-200">Email:</strong> {user.email}</p>
                            <p><strong className="font-semibold text-gray-800 dark:text-gray-200">Gói hiện tại:</strong> <span className="text-secondary font-bold">{user.plan || 'Chưa kích hoạt'}</span></p>
                        </div>
                        </div>
                    </div>
                </Card>
            )}
            
            <div>
                <h3 className="text-2xl font-bold mb-4">Tổng quan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Credits còn lại" value={user?.credits.toLocaleString('vi-VN') ?? 0} icon={BanknotesIcon} />
                    <StatCard title="Câu chuyện" value={storyCount} icon={DocumentTextIcon} />
                    <StatCard title="Ảnh & Video" value={imageCount + videoCount} icon={FilmIcon} />
                    <StatCard title="Prompt Video" value={promptCount} icon={SparklesIcon} />
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-bold mb-4">Tác vụ nhanh</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <QuickActionButton label="Câu chuyện mới" icon={SparklesIcon} onClick={() => setCurrentPage('story-generator')} colorClass="text-purple-500" />
                   <QuickActionButton label="Video mới (Veo)" icon={FilmIcon} onClick={() => setCurrentPage('video-generator')} colorClass="text-blue-500" />
                   <QuickActionButton label="Ảnh mới" icon={PhotoIcon} onClick={() => setCurrentPage('image-generator')} colorClass="text-green-500" />
                   <QuickActionButton label="Nâng cấp gói" icon={BoltIcon} onClick={() => setCurrentPage('pricing')} colorClass="text-yellow-500" />
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-bold mb-4">Hoạt động gần đây</h3>
                <Card>
                    {recentActivity.length > 0 ? (
                        <div className="space-y-2">
                            {recentActivity.map(item => {
                                const isStory = !('type' in item);
                                const itemType = isStory ? 'story' : item.type;
                                const Icon = itemIcons[itemType] || DocumentTextIcon;
                                const title = isStory ? (item as Story).title : (item as GeneratedItem).prompt;

                                return (
                                    <div key={item.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-200">
                                        <Icon className="w-6 h-6 text-primary flex-shrink-0" />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-semibold truncate text-sm">{title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize flex items-center">
                                                {itemType.replace('-', ' ')}
                                                <span className="mx-2">•</span>
                                                <ClockIcon className="w-4 h-4 mr-1" />
                                                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <Button variant="outline" className="w-full !mt-4" onClick={() => setCurrentPage('history')}>
                                Xem tất cả lịch sử
                            </Button>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">Chưa có hoạt động nào.</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;

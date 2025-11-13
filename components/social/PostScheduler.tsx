import React, { useState } from 'react';
import { SocialAccount, SocialPost, SocialPlatform } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import { XMarkIcon, PhotoIcon, FilmIcon } from '../icons/Icons';
import DatePicker from 'react-datepicker';

interface PostSchedulerProps {
    accounts: SocialAccount[];
    posts: SocialPost[];
    addPost: (post: Omit<SocialPost, 'id' | 'stats'>) => void;
}

const ComposerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    accounts: SocialAccount[];
    addPost: (post: Omit<SocialPost, 'id' | 'stats'>) => void;
}> = ({ isOpen, onClose, accounts, addPost }) => {
    const [content, setContent] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
    const [scheduleDate, setScheduleDate] = useState<Date | null>(new Date(Date.now() + 3600000));

    const handleSubmit = () => {
        if (!content || !selectedAccountId) return;
        const account = accounts.find(a => a.id === selectedAccountId);
        if (!account) return;
        
        addPost({
            accountId: selectedAccountId,
            platform: account.platform,
            content,
            status: 'scheduled',
            publishAt: scheduleDate || new Date(),
        });
        onClose();
        setContent('');
        setScheduleDate(new Date(Date.now() + 3600000));
    };
    
    if (!isOpen) return null;

    const accountOptions = accounts.map(acc => ({ value: acc.id, label: `${acc.platform} - ${acc.displayName}`}));

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-2xl relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold mb-4">Soạn bài đăng mới</h2>
                <div className="space-y-4">
                    <Select
                        label="Đăng lên tài khoản"
                        options={accountOptions}
                        value={selectedAccountId}
                        onChange={e => setSelectedAccountId(e.target.value)}
                    />
                    <Textarea
                        label="Nội dung"
                        rows={6}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Bạn đang nghĩ gì?"
                    />
                    <div className="h-40 border-2 border-dashed border-light-border dark:border-dark-border rounded-lg flex items-center justify-center text-gray-500">
                        <PhotoIcon className="w-8 h-8 mr-2" />
                        <FilmIcon className="w-8 h-8" />
                        <span className="ml-2">Kéo thả hoặc chọn Ảnh/Video</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lên lịch vào</label>
                            <DatePicker
                                selected={scheduleDate}
                                onChange={(date: Date) => setScheduleDate(date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="MMMM d, yyyy h:mm aa"
                                className="w-full px-3 py-2 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md shadow-sm"
                            />
                        </div>
                        <Button onClick={handleSubmit} className="self-end">Lên lịch</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const PostScheduler: React.FC<PostSchedulerProps> = ({ accounts, posts, addPost }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const scheduledPosts = posts.filter(p => p.status === 'scheduled').sort((a,b) => a.publishAt.getTime() - b.publishAt.getTime());

    return (
        <div className="space-y-6">
            <ComposerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} accounts={accounts} addPost={addPost} />
            <Card>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Lịch đăng bài</h3>
                    <Button onClick={() => setIsModalOpen(true)} disabled={accounts.length === 0}>
                        + Bài đăng mới
                    </Button>
                </div>
                {accounts.length === 0 && <p className="text-center text-sm text-yellow-600 dark:text-yellow-400 mt-4">Vui lòng kết nối ít nhất một tài khoản để bắt đầu đăng bài.</p>}
            </Card>
            
            <Card>
                <h4 className="font-semibold mb-4">Đã lên lịch ({scheduledPosts.length})</h4>
                <div className="space-y-3">
                    {scheduledPosts.length > 0 ? scheduledPosts.map(post => {
                        const account = accounts.find(a => a.id === post.accountId);
                        return (
                            <div key={post.id} className="p-3 bg-light-bg dark:bg-dark-bg rounded-lg flex items-start gap-4">
                                <div className="text-center flex-shrink-0 w-20">
                                    <p className="font-bold text-lg">{post.publishAt.toLocaleDateString('vi-VN', {day: '2-digit'})}</p>
                                    <p className="text-xs text-gray-500">{post.publishAt.toLocaleDateString('vi-VN', {month: 'short'})} - {post.publishAt.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm line-clamp-2">{post.content}</p>
                                    {account && <p className="text-xs font-semibold text-primary mt-1">{account.platform} - {account.displayName}</p>}
                                </div>
                            </div>
                        )
                    }) : (
                        <p className="text-center text-gray-500 py-8">Chưa có bài đăng nào được lên lịch.</p>
                    )}
                </div>
            </Card>

        </div>
    );
};

export default PostScheduler;
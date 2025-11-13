import React from 'react';
import { User, SocialAccount, SocialPlatform, PlanName } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FacebookF, Youtube, Instagram, TikTok } from '../icons/Icons';

interface AccountManagerProps {
    user: User;
    accounts: SocialAccount[];
    onToggleConnect: (accountId: string) => void;
}

const platformIcons: Record<SocialPlatform, React.ElementType> = {
    Facebook: FacebookF,
    YouTube: Youtube,
    Instagram: Instagram,
    TikTok: TikTok,
};

const platformColors: Record<SocialPlatform, string> = {
    Facebook: 'bg-[#1877F2]',
    YouTube: 'bg-[#FF0000]',
    Instagram: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
    TikTok: 'bg-[#000000]',
};

const planLimits: Record<PlanName | 'Chưa kích hoạt', number> = {
    'Cá nhân': 2,
    'Cá nhân Pro': 5,
    'Team': 10,
    'Doanh nghiệp': 50,
    'Chưa kích hoạt': 1,
};

const AccountManager: React.FC<AccountManagerProps> = ({ user, accounts, onToggleConnect }) => {
    
    const connectedCount = accounts.filter(acc => acc.isConnected).length;
    const accountLimit = planLimits[user.plan];
    
    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Quản lý Tài khoản</h3>
                    <div className="text-right">
                        <p className="font-semibold">Đã kết nối: {connectedCount} / {accountLimit}</p>
                        <p className="text-sm text-gray-500">Gói hiện tại: <span className="font-bold text-secondary">{user.plan}</span></p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accounts.map(account => {
                    const Icon = platformIcons[account.platform];
                    return (
                        <Card key={account.id} className={`p-4 ${!account.isConnected ? 'opacity-60' : ''}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${platformColors[account.platform]}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{account.displayName}</p>
                                        <p className="text-sm text-gray-500">{account.username}</p>
                                    </div>
                                </div>
                                <Button
                                    variant={account.isConnected ? 'danger' : 'primary'}
                                    onClick={() => onToggleConnect(account.id)}
                                    disabled={!account.isConnected && connectedCount >= accountLimit}
                                >
                                    {account.isConnected ? 'Ngắt kết nối' : 'Kết nối'}
                                </Button>
                            </div>
                             {account.isConnected && (
                                <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border flex justify-around text-center">
                                    <div>
                                        <p className="text-xl font-bold">{account.stats.followers.toLocaleString('vi-VN')}</p>
                                        <p className="text-xs text-gray-500 uppercase">Người theo dõi</p>
                                    </div>
                                     <div>
                                        <p className="text-xl font-bold">{account.stats.following.toLocaleString('vi-VN')}</p>
                                        <p className="text-xs text-gray-500 uppercase">Đang theo dõi</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
             {connectedCount >= accountLimit && (
                <p className="text-center text-yellow-600 dark:text-yellow-400 font-semibold">
                    Bạn đã đạt giới hạn tài khoản cho gói hiện tại. Vui lòng nâng cấp để kết nối thêm.
                </p>
            )}
        </div>
    );
};

export default AccountManager;
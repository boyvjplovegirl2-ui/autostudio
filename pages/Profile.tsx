import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import { useTheme } from '../hooks/useTheme';
import { User, UserDevice, UserSettings, SocialAccount, SocialPlatform } from '../types';
import { UserCircleIcon, ShieldCheckIcon, PaintBrushIcon, LinkIcon, ArchiveBoxXMarkIcon, XMarkIcon } from '../components/icons/Icons';
import { FacebookF, Youtube, Instagram, TikTok } from '../components/icons/Icons';


// --- MOCK DATA FOR UI DEMO ---
const mockDevices: UserDevice[] = [
    { id: '1', deviceName: 'Chrome on Windows', ip: '192.168.1.1', lastLogin: new Date(), isCurrent: true },
    { id: '2', deviceName: 'Safari on iPhone', ip: '10.0.0.5', lastLogin: new Date(Date.now() - 86400000), isCurrent: false },
];
const mockSocials: Partial<SocialAccount>[] = [
    { id: 'fb1', platform: 'Facebook', username: 'studioauto.fb', isConnected: true },
    { id: 'yt1', platform: 'YouTube', username: 'studioautochannel', isConnected: true },
    { id: 'ig1', platform: 'Instagram', username: '@studio.auto', isConnected: false },
];


interface ProfileProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

type ProfileTab = 'profile' | 'security' | 'appearance' | 'socials' | 'data';

// --- TAB COMPONENTS ---

const ProfileInformation: React.FC<ProfileProps> = ({ user, setUser }) => {
    const [formData, setFormData] = useState({
        name: user.name || '',
        bio: user.bio || '',
        phone: user.phone || '',
        country: user.country || 'Vietnam',
    });
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
    const [coverPreview, setCoverPreview] = useState<string | null>(user.coverUrl || null);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (status === 'saved') setStatus('idle');
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if(type === 'avatar') setAvatarPreview(reader.result as string);
                else setCoverPreview(reader.result as string);
                if (status === 'saved') setStatus('idle');
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('saving');
        // Simulate API call
        setTimeout(() => {
            setUser(prev => prev ? { 
                ...prev, 
                ...formData,
                avatarUrl: avatarPreview || prev.avatarUrl,
                coverUrl: coverPreview || prev.coverUrl,
            } : null);
            setStatus('saved');
            setTimeout(() => setStatus('idle'), 2000);
        }, 1000);
    };
    
    return (
        <Card>
            <form onSubmit={handleSave} className="space-y-6">
                 {/* Cover Photo */}
                <div className="h-48 bg-gray-200 dark:bg-dark-border rounded-lg relative bg-cover bg-center group" style={{ backgroundImage: `url(${coverPreview || 'https://picsum.photos/seed/cover/1000/250'})` }}>
                    <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
                     <label htmlFor="cover-upload" className="absolute inset-0 flex items-center justify-center text-white bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity rounded-lg">
                        Cập nhật ảnh bìa
                        <input id="cover-upload" type="file" className="hidden" onChange={(e) => handleFileChange(e, 'cover')} />
                    </label>

                     {/* Avatar */}
                    <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                        <div className="w-32 h-32 rounded-full border-4 border-light-card dark:border-dark-card bg-gray-300 dark:bg-dark-border relative group/avatar">
                            <img src={avatarPreview || `https://i.pravatar.cc/150?u=${user.email}`} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                            <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-opacity">
                                Tải lên
                                <input id="avatar-upload" type="file" className="hidden" onChange={(e) => handleFileChange(e, 'avatar')} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="pt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Họ và Tên" name="name" value={formData.name} onChange={handleChange} />
                    <Input label="Email" name="email" value={user.email} disabled />
                    <Input label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} />
                    <Select label="Quốc gia" name="country" options={[{value: 'Vietnam', label: 'Việt Nam'}, {value: 'USA', label: 'Hoa Kỳ'}]} value={formData.country} onChange={handleChange} />
                    <div className="md:col-span-2">
                        <Textarea label="Tiểu sử" name="bio" rows={3} value={formData.bio} onChange={handleChange} placeholder="Giới thiệu ngắn về bạn..." />
                    </div>
                </div>
                <div className="flex justify-end items-center gap-4 pt-4 border-t border-light-border dark:border-dark-border">
                     {status === 'saving' && <p className="text-sm text-gray-500 animate-pulse">Đang lưu...</p>}
                     {status === 'saved' && <p className="text-sm text-green-500 font-semibold">Đã lưu ✓</p>}
                    <Button type="submit" disabled={status === 'saving' || status === 'saved'}>Lưu thay đổi</Button>
                </div>
            </form>
        </Card>
    );
};

const SecuritySettings: React.FC = () => {
    return (
        <div className="space-y-6">
            <Card>
                <h3 className="text-xl font-bold mb-4">Đổi mật khẩu</h3>
                <form className="space-y-4 max-w-sm">
                    <Input label="Mật khẩu hiện tại" type="password" />
                    <Input label="Mật khẩu mới" type="password" />
                    <Input label="Xác nhận mật khẩu mới" type="password" />
                    <Button>Cập nhật mật khẩu</Button>
                </form>
            </Card>
            <Card>
                <h3 className="text-xl font-bold mb-4">Xác thực hai yếu tố (2FA)</h3>
                <div className="flex items-center justify-between p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                    <p>Trạng thái: <span className="font-semibold text-red-500">Chưa kích hoạt</span></p>
                    <Button variant="outline">Kích hoạt 2FA</Button>
                </div>
            </Card>
             <Card>
                <h3 className="text-xl font-bold mb-4">Các thiết bị đã đăng nhập</h3>
                <div className="space-y-2">
                    {mockDevices.map(device => (
                        <div key={device.id} className="flex items-center justify-between p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                            <div>
                                <p className="font-semibold">{device.deviceName} {device.isCurrent && <span className="text-xs text-secondary">(Thiết bị này)</span>}</p>
                                <p className="text-sm text-gray-500">{device.ip} - Lần cuối: {device.lastLogin.toLocaleDateString('vi-VN')}</p>
                            </div>
                            {!device.isCurrent && <Button size="sm" variant="danger">Đăng xuất</Button>}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

const AppearanceSettings: React.FC<{ settings: UserSettings; onSettingsChange: (newSettings: UserSettings) => void; }> = ({ settings, onSettingsChange }) => {
    
    const handleThemeChange = (newTheme: UserSettings['theme']) => {
        onSettingsChange({ ...settings, theme: newTheme });
    };
    
    return (
        <Card>
            <h3 className="text-xl font-bold mb-4">Giao diện</h3>
            <div className="space-y-6">
                <div>
                    <label className="font-semibold block mb-2">Chế độ</label>
                    <div className="flex gap-2">
                        {['light', 'dark', 'system'].map(t => (
                            <Button key={t} variant={settings.theme === t ? 'primary' : 'outline'} onClick={() => handleThemeChange(t as any)}>{t.charAt(0).toUpperCase() + t.slice(1)}</Button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="font-semibold block mb-2">Màu chủ đề (Theme Color)</label>
                     <p className="text-sm text-gray-500 mb-3">Tính năng này đang được phát triển.</p>
                    <div className="flex gap-3">
                       <button className="w-8 h-8 rounded-full bg-primary ring-2 ring-offset-2 ring-primary dark:ring-offset-dark-card" aria-label="Primary theme"></button>
                       <button className="w-8 h-8 rounded-full bg-purple-500 opacity-50 cursor-not-allowed" aria-label="Purple theme" disabled></button>
                       <button className="w-8 h-8 rounded-full bg-pink-500 opacity-50 cursor-not-allowed" aria-label="Pink theme" disabled></button>
                       <button className="w-8 h-8 rounded-full bg-black opacity-50 cursor-not-allowed" aria-label="Black theme" disabled></button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const SocialIntegrations: React.FC = () => {
    const platformIcons: Record<SocialPlatform, React.ElementType> = {
        Facebook: FacebookF,
        YouTube: Youtube,
        Instagram: Instagram,
        TikTok: TikTok,
    };

    return (
        <Card>
            <h3 className="text-xl font-bold mb-4">Tài khoản mạng xã hội đã kết nối</h3>
            <div className="space-y-3">
                {mockSocials.map(social => {
                    const Icon = platformIcons[social.platform!];
                    return (
                        <div key={social.id} className="flex items-center justify-between p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                            <div className="flex items-center gap-3">
                                <Icon className="w-6 h-6" />
                                <p className="font-semibold">{social.platform} - <span className="text-gray-500">{social.username}</span></p>
                            </div>
                            <Button size="sm" variant={social.isConnected ? 'danger' : 'primary'}>
                                {social.isConnected ? 'Ngắt kết nối' : 'Kết nối'}
                            </Button>
                        </div>
                    )
                })}
            </div>
        </Card>
    );
};

const DataAndPrivacy: React.FC = () => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    
    return (
        <>
        {isConfirmingDelete && (
             <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsConfirmingDelete(false)}>
                <Card className="w-full max-w-md relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-red-600">Bạn có chắc chắn?</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 my-3">
                        Hành động này không thể được hoàn tác. Tất cả dữ liệu của bạn, bao gồm các câu chuyện, hình ảnh và video đã tạo sẽ bị xóa vĩnh viễn.
                    </p>
                    <Input label="Vui lòng nhập 'DELETE' để xác nhận" placeholder="DELETE" />
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsConfirmingDelete(false)}>Hủy</Button>
                        <Button variant="danger">Tôi hiểu, Xóa tài khoản</Button>
                    </div>
                </Card>
            </div>
        )}
        <Card className="border-red-500/50">
            <h3 className="text-xl font-bold text-red-500 mb-4">Vùng nguy hiểm</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-red-500/10 rounded-lg">
                    <div>
                        <p className="font-semibold">Xuất dữ liệu</p>
                        <p className="text-sm text-red-700 dark:text-red-300">Tải xuống toàn bộ dữ liệu của bạn.</p>
                    </div>
                    <Button variant="outline">Xuất .zip</Button>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-500/10 rounded-lg">
                    <div>
                        <p className="font-semibold">Xóa tài khoản</p>
                        <p className="text-sm text-red-700 dark:text-red-300">Hành động này không thể hoàn tác.</p>
                    </div>
                    <Button variant="danger" onClick={() => setIsConfirmingDelete(true)}>Xóa tài khoản</Button>
                </div>
            </div>
        </Card>
      </>
    );
};

// --- MAIN PROFILE COMPONENT ---

const Profile: React.FC<ProfileProps> = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  
  // Create a default settings object to avoid crashes if user.settings is undefined
  const userSettings = user.settings || {
    theme: 'system',
    notifications: { email: true, push: true, system: false },
    performanceMode: false
  };

  const handleSettingsChange = (newSettings: UserSettings) => {
      setUser(prev => prev ? { ...prev, settings: newSettings } : null);
  };
  
  const tabs: {id: ProfileTab, label: string, icon: React.ElementType}[] = [
      { id: 'profile', label: 'Hồ sơ', icon: UserCircleIcon },
      { id: 'security', label: 'Bảo mật', icon: ShieldCheckIcon },
      { id: 'appearance', label: 'Giao diện', icon: PaintBrushIcon },
      { id: 'socials', label: 'Mạng xã hội', icon: LinkIcon },
      { id: 'data', label: 'Dữ liệu & Riêng tư', icon: ArchiveBoxXMarkIcon },
  ];
  
  const renderContent = () => {
      switch (activeTab) {
          case 'profile': return <ProfileInformation user={user} setUser={setUser} />;
          case 'security': return <SecuritySettings />;
          case 'appearance': return <AppearanceSettings settings={userSettings} onSettingsChange={handleSettingsChange} />;
          case 'socials': return <SocialIntegrations />;
          case 'data': return <DataAndPrivacy />;
          default: return null;
      }
  };

  return (
    <div className="max-w-6xl mx-auto">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
            <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
                <nav className="space-y-1">
                {tabs.map(tab => (
                    <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border'
                    }`}
                    >
                    <tab.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{tab.label}</span>
                    </button>
                ))}
                </nav>
            </aside>
            <main className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
                <div className="page-fade-in">
                    {renderContent()}
                </div>
            </main>
      </div>
    </div>
  );
};

export default Profile;
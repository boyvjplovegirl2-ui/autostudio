import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { AdminUser, Payment, Job, Story, GeneratedItem, AdminAnnouncement } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { 
    DocumentChartBarIcon, UsersIcon, BanknotesIcon, QueueListIcon, EyeIcon, KeyIcon, CommandLineIcon, FilmIcon, PhotoIcon, BellIcon, SparklesIcon, DocumentTextIcon
} from '../components/icons/Icons';
import EditUserModal from '../components/admin/EditUserModal';

// --- MOCK DATA ---
const mockUsers: AdminUser[] = [
  { id: 'u1', email: 'user1@example.com', plan: 'Cá nhân Pro', credits: 9999, status: 'active', createdAt: new Date() },
  { id: 'u2', email: 'user2@example.com', plan: 'Cá nhân', credits: 50, status: 'active', createdAt: new Date() },
  { id: 'u3', email: 'user3@example.com', plan: 'Team', credits: 0, status: 'banned', createdAt: new Date() },
];
const mockPayments: Payment[] = [
  { id: 'p1', userId: 'u4', userEmail: 'user4@example.com', amount: 399000, plan: 'Cá nhân', status: 'pending', createdAt: new Date() },
  { id: 'p2', userId: 'u5', userEmail: 'user5@example.com', amount: 650000, plan: 'Cá nhân Pro', status: 'completed', createdAt: new Date() },
];
const mockJobs: Job[] = [
  { id: 'j1', type: 'video', status: 'completed', error: null, createdAt: new Date(Date.now() - 10000) },
  { id: 'j2', type: 'image', status: 'failed', error: 'Render timeout', createdAt: new Date(Date.now() - 20000) },
  { id: 'j3', type: 'story', status: 'processing', error: null, createdAt: new Date(Date.now() - 30000) },
];
const mockStories: Story[] = [
    { id: 's1', title: 'Rồng con học phun lửa', content: 'Ngày xửa ngày xưa...', genre: 'Kể chuyện', length: '1000 từ', emotion: 'ấm áp', createdAt: new Date() },
];
const mockGeneratedItems: GeneratedItem[] = [
    { id: 'gi1', type: 'prompt', prompt: 'From story "Rồng con..."', content: 'Scene 1: a baby dragon...', createdAt: new Date() },
    { id: 'gi2', type: 'image', prompt: 'a baby dragon spitting smoke', content: 'https://picsum.photos/seed/i1/200', createdAt: new Date() },
    { id: 'gi3', type: 'video', prompt: 'a baby dragon trying to fly', content: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', createdAt: new Date() },
];
const mockAnnouncements: AdminAnnouncement[] = [
    { id: 'a1', content: 'Khuyến mãi 50% các gói PRO!', createdAt: new Date(), sentBy: 'admin@studio.auto' },
];
const mockLogs: any[] = [
    {id: 'l1', timestamp: new Date(), actor: 'admin@studio.auto', action: 'Banned user user3@example.com'},
    {id: 'l2', timestamp: new Date(), actor: 'system', action: 'API Key for Veo3 updated.'},
];

type AdminTab = 'dashboard' | 'users' | 'payments' | 'jobs' | 'content' | 'settings' | 'logs' | 'announcements';

// --- SUB-COMPONENTS ---

const AdminDashboard: React.FC = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <Card className="flex items-center p-4"><UsersIcon className="w-8 h-8 text-primary mr-4"/><div className="flex flex-col"><span className="text-2xl font-bold">1,234</span><span className="text-gray-500">Người dùng</span></div></Card>
            <Card className="flex items-center p-4"><BanknotesIcon className="w-8 h-8 text-green-500 mr-4"/><div className="flex flex-col"><span className="text-2xl font-bold">56M đ</span><span className="text-gray-500">Doanh thu</span></div></Card>
            <Card className="flex items-center p-4"><DocumentTextIcon className="w-8 h-8 text-yellow-500 mr-4"/><div className="flex flex-col"><span className="text-2xl font-bold">3,456</span><span className="text-gray-500">Stories</span></div></Card>
            <Card className="flex items-center p-4"><SparklesIcon className="w-8 h-8 text-indigo-500 mr-4"/><div className="flex flex-col"><span className="text-2xl font-bold">7,890</span><span className="text-gray-500">Prompts</span></div></Card>
            <Card className="flex items-center p-4"><PhotoIcon className="w-8 h-8 text-purple-500 mr-4"/><div className="flex flex-col"><span className="text-2xl font-bold">12,345</span><span className="text-gray-500">Ảnh</span></div></Card>
            <Card className="flex items-center p-4"><FilmIcon className="w-8 h-8 text-blue-500 mr-4"/><div className="flex flex-col"><span className="text-2xl font-bold">5,678</span><span className="text-gray-500">Videos</span></div></Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><h3 className="font-bold text-lg mb-4">Job Queue Gần Đây</h3><JobManagementTable jobs={mockJobs} /></Card>
            <Card><h3 className="font-bold text-lg mb-4">Thanh toán chờ duyệt</h3><PaymentManagementTable payments={mockPayments} /></Card>
        </div>
    </div>
);

const UserManagementTable: React.FC<{users: AdminUser[]; onEdit: (user: AdminUser) => void; onToggleBan: (userId: string) => void;}> = ({users, onEdit, onToggleBan}) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-light-bg dark:bg-dark-bg"><tr><th className="p-3">Email</th><th className="p-3">Gói</th><th className="p-3">Credits</th><th className="p-3">Trạng thái</th><th className="p-3">Hành động</th></tr></thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.id} className="border-b border-light-border dark:border-dark-border">
                        <td className="p-3 font-medium">{user.email}</td><td className="p-3">{user.plan}</td><td className="p-3">{user.credits}</td>
                        <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`} title={user.status === 'active' ? 'Tài khoản đang hoạt động' : 'Tài khoản đã bị khóa'}>{user.status}</span></td>
                        <td className="p-3 space-x-2"><Button size="sm" variant="outline" onClick={() => onEdit(user)}>Sửa</Button><Button size="sm" variant={user.status === 'active' ? 'danger' : 'secondary'} onClick={() => onToggleBan(user.id)}>{user.status === 'active' ? 'Khóa' : 'Mở khóa'}</Button></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
const PaymentManagementTable: React.FC<{payments: Payment[]}> = ({payments}) => {
    const paymentStatusTooltip: Record<Payment['status'], string> = {
        pending: 'Giao dịch đang chờ xác nhận thủ công.',
        completed: 'Giao dịch đã được xác nhận thành công.',
        failed: 'Giao dịch đã thất bại hoặc bị hủy.',
    };
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-light-bg dark:bg-dark-bg"><tr><th className="p-3">Email</th><th className="p-3">Số tiền</th><th className="p-3">Gói</th><th className="p-3">Trạng thái</th><th className="p-3">Hành động</th></tr></thead>
                <tbody>
                    {payments.map(p => (
                        <tr key={p.id} className="border-b border-light-border dark:border-dark-border">
                            <td className="p-3 font-medium">{p.userEmail}</td><td className="p-3">{p.amount.toLocaleString('vi-VN')}đ</td><td className="p-3">{p.plan}</td>
                            <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${p.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`} title={paymentStatusTooltip[p.status]}>{p.status}</span></td>
                            <td className="p-3">{p.status === 'pending' && <Button size="sm" variant="secondary">Duyệt</Button>}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
};
const JobManagementTable: React.FC<{jobs: Job[]}> = ({jobs}) => {
    const jobStatusTooltip: Record<Job['status'], string> = {
        queued: 'Job đang trong hàng đợi để được thực thi.',
        processing: 'Worker đang xử lý job này.',
        completed: 'Job đã hoàn thành thành công.',
        failed: 'Job đã thất bại. Kiểm tra logs để biết chi tiết.',
    };
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-light-bg dark:bg-dark-bg"><tr><th className="p-3">Loại</th><th className="p-3">Trạng thái</th><th className="p-3">Lỗi</th><th className="p-3">Hành động</th></tr></thead>
                <tbody>
                    {jobs.map(job => (
                        <tr key={job.id} className="border-b border-light-border dark:border-dark-border">
                            <td className="p-3 capitalize">{job.type}</td>
                            <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${job.status === 'completed' ? 'bg-green-100 text-green-800' : job.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`} title={jobStatusTooltip[job.status]}>{job.status}</span></td>
                            <td className="p-3 text-red-500">{job.error || 'N/A'}</td>
                            <td className="p-3 space-x-2">{job.status === 'failed' && <Button size="sm" variant="outline">Thử lại</Button>} <Button size="sm" variant="outline">Xem Log</Button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
};

type ContentType = 'stories' | 'prompts' | 'images' | 'videos';
const ContentManagement: React.FC = () => {
    const [activeContent, setActiveContent] = useState<ContentType>('stories');

    const renderContentTable = () => {
        switch(activeContent) {
            case 'stories': return <div className="overflow-x-auto"><table className="w-full text-sm"><tbody>{mockStories.map(s => <tr key={s.id} className="border-b"><td className="p-2">{s.title}</td><td className="p-2 text-gray-500">{s.content.substring(0,50)}...</td></tr>)}</tbody></table></div>;
            case 'videos': return <div className="grid grid-cols-3 gap-2">{mockGeneratedItems.filter(i=>i.type === 'video').map(v => <video key={v.id} src={v.content} className="w-full aspect-video rounded bg-black" controls />)}</div>;
            case 'images': return <div className="grid grid-cols-4 gap-2">{mockGeneratedItems.filter(i=>i.type === 'image').map(i => <img key={i.id} src={i.content} className="w-full aspect-square rounded" />)}</div>;
            case 'prompts': return <div className="overflow-x-auto"><table className="w-full text-sm"><tbody>{mockGeneratedItems.filter(i=>i.type === 'prompt').map(p => <tr key={p.id} className="border-b"><td className="p-2">{p.content.substring(0,100)}...</td></tr>)}</tbody></table></div>;
        }
    };
    
    return <Card>
        <div className="flex gap-2 mb-4 border-b pb-2">
            {(['stories', 'prompts', 'images', 'videos'] as ContentType[]).map(type => (
                <Button key={type} size="sm" variant={activeContent === type ? 'primary' : 'outline'} onClick={() => setActiveContent(type)} className="capitalize">{type}</Button>
            ))}
        </div>
        {renderContentTable()}
    </Card>;
};

const SettingsManagement: React.FC = () => (
    <div className="space-y-6 max-w-2xl">
        <Card><h3 className="font-bold text-lg mb-4">API Keys & Config</h3><div className="space-y-4"><Input label="GPT Key" type="password" defaultValue="•••••••" /><Input label="Veo3 Key" type="password" defaultValue="•••••••" /><Button>Lưu API Keys</Button></div></Card>
        <Card><h3 className="font-bold text-lg mb-4">Trạng thái hệ thống</h3><div className="flex items-center justify-between"><span>Chế độ bảo trì</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 peer-checked:bg-primary"></div></label></div></Card>
    </div>
);
const LogViewer: React.FC = () => (
    <Card><h3 className="font-bold text-lg mb-4">Logs hệ thống</h3><div className="bg-dark-card text-gray-200 font-mono text-sm p-4 rounded-lg h-96 overflow-y-auto border border-dark-border">{mockLogs.map(log => (<p key={log.id}><span className="text-green-400">{log.timestamp.toISOString()}</span> <span className="text-yellow-400">[{log.actor}]</span>: {log.action}</p>))}</div></Card>
);
const AnnouncementManager: React.FC = () => {
    const [announcements, setAnnouncements] = useState(mockAnnouncements);
    const [newAnnouncement, setNewAnnouncement] = useState('');
    const handleSend = () => {
        if (!newAnnouncement.trim()) return;
        const newAnn: AdminAnnouncement = {id: `a${Date.now()}`, content: newAnnouncement, createdAt: new Date(), sentBy: 'admin@studio.auto'};
        setAnnouncements(prev => [newAnn, ...prev]);
        setNewAnnouncement('');
        alert("Thông báo đã được gửi!");
    }
    return <div className="space-y-6">
        <Card><h3 className="font-bold text-lg mb-4">Gửi thông báo mới</h3><Textarea value={newAnnouncement} onChange={e => setNewAnnouncement(e.target.value)} rows={4} placeholder="Nhập nội dung thông báo cho tất cả người dùng..." /><Button onClick={handleSend} className="mt-2">Gửi thông báo</Button></Card>
        <Card><h3 className="font-bold text-lg mb-4">Lịch sử thông báo</h3><div className="space-y-2">{announcements.map(a => <div key={a.id} className="p-2 bg-light-bg dark:bg-dark-bg rounded-md"><p>{a.content}</p><p className="text-xs text-gray-400">{a.createdAt.toLocaleString('vi-VN')}</p></div>)}</div></Card>
    </div>;
};

// --- MAIN ADMIN COMPONENT ---

const Admin: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [users, setUsers] = useState<AdminUser[]>(mockUsers);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [userSearch, setUserSearch] = useState('');

    const handleEditUserClick = (user: AdminUser) => { setSelectedUser(user); setIsEditModalOpen(true); };
    const handleSaveUser = (updatedUser: AdminUser) => setUsers(p => p.map(u => u.id === updatedUser.id ? updatedUser : u));
    const handleToggleBanUser = (userId: string) => setUsers(p => p.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u));

    const filteredUsers = useMemo(() => users.filter(u => u.email.toLowerCase().includes(userSearch.toLowerCase())), [users, userSearch]);

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: DocumentChartBarIcon }, { id: 'users', label: 'Người dùng', icon: UsersIcon }, { id: 'payments', label: 'Thanh toán', icon: BanknotesIcon },
        { id: 'jobs', label: 'Jobs & Queue', icon: QueueListIcon }, { id: 'content', label: 'Nội dung', icon: EyeIcon }, { id: 'announcements', label: 'Thông báo', icon: BellIcon },
        { id: 'settings', label: 'Cài đặt', icon: KeyIcon }, { id: 'logs', label: 'Logs', icon: CommandLineIcon },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <AdminDashboard />;
            case 'users': return <Card><div className="mb-4"><Input placeholder="Tìm email người dùng..." value={userSearch} onChange={e=>setUserSearch(e.target.value)}/></div><UserManagementTable users={filteredUsers} onEdit={handleEditUserClick} onToggleBan={handleToggleBanUser} /></Card>;
            case 'payments': return <Card><PaymentManagementTable payments={mockPayments} /></Card>;
            case 'jobs': return <Card><JobManagementTable jobs={mockJobs} /></Card>;
            case 'content': return <ContentManagement />;
            case 'settings': return <SettingsManagement />;
            case 'logs': return <LogViewer />;
            case 'announcements': return <AnnouncementManager />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 border-b border-light-border dark:border-dark-border pb-4 tab-button-container">
                {tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id ? 'active-tab !text-primary !border-primary bg-primary/10' : 'text-gray-600 dark:text-gray-300'}`}><tab.icon className="w-5 h-5 mr-2" />{tab.label}</button>))}
            </div>
            <div>{renderContent()}</div>
            <EditUserModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={selectedUser} onSave={handleSaveUser}/>
        </div>
    );
};

export default Admin;
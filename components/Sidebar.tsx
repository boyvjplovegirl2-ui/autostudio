// FIX: Create content for components/Sidebar.tsx to resolve module errors.
import React from 'react';
import { Page } from '../types';
import {
  DocumentChartBarIcon,
  SparklesIcon,
  PhotoIcon,
  FilmIcon,
  QueueListIcon,
  BanknotesIcon,
  CommandLineIcon,
  KeyIcon,
// FIX: Changed UserIcon to UsersIcon as it's the correct exported name.
  UsersIcon,
  EyeIcon,
  ScissorsIcon, 
// FIX: Changed Cog6ToothIcon to Cog8ToothIcon as it's the correct exported name.
  Cog8ToothIcon,
  ShareIcon
} from './icons/Icons';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  userIsAdmin: boolean;
  onLogout: () => void;
}

// FIX: Define an interface for nav items to ensure type safety for the 'page' property.
interface NavItemConfig {
  label: string;
  page: Page;
  icon: React.ElementType;
}

const NavItem: React.FC<{
  label: string;
  page: Page;
  icon: React.ElementType;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}> = ({ label, page, icon: Icon, currentPage, setCurrentPage }) => (
  <li>
    <button
      onClick={() => setCurrentPage(page)}
      className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
        currentPage === page
          ? 'bg-primary text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </button>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, userIsAdmin, onLogout }) => {
    // FIX: Apply the NavItemConfig type to ensure the 'page' property is strongly typed.
    const mainNavItems: NavItemConfig[] = [
        { label: 'Dashboard', page: 'dashboard', icon: DocumentChartBarIcon },
        { label: 'Tạo Câu chuyện', page: 'story-generator', icon: SparklesIcon },
        { label: 'Tạo Prompt Video', page: 'prompt-generator', icon: SparklesIcon },
        { label: 'Tạo Ảnh Whisk', page: 'image-generator', icon: PhotoIcon },
        { label: 'Tạo Ảnh Thumbnail', page: 'thumbnail-generator', icon: PhotoIcon },
        { label: 'Tạo Video (Veo)', page: 'video-generator', icon: FilmIcon },
        { label: 'Video từ Ảnh', page: 'video-from-image-generator', icon: FilmIcon },
        { label: 'Video Đồng nhất', page: 'consistent-video-generator', icon: FilmIcon },
// FIX: Changed Cog6ToothIcon to Cog8ToothIcon to match the exported icon name.
        { label: 'Tạo Tự Động', page: 'auto-generator', icon: Cog8ToothIcon },
        { label: 'Ghép Video', page: 'video-merger', icon: ScissorsIcon },
        { label: 'Quản lý MXH', page: 'social-manager', icon: ShareIcon },
        { label: 'Kịch bản YouTube', page: 'youtube-script-generator', icon: FilmIcon },
        { label: 'Short Highlight', page: 'short-highlight-generator', icon: FilmIcon },
        { label: 'Lịch sử', page: 'history', icon: QueueListIcon },
    ];

    // FIX: Apply the NavItemConfig type to ensure the 'page' property is strongly typed.
    const secondaryNavItems: NavItemConfig[] = [
        { label: 'Gói tài khoản', page: 'pricing', icon: BanknotesIcon },
// FIX: Changed UserIcon to UsersIcon to match the exported icon name.
        { label: 'Hỗ trợ', page: 'support', icon: UsersIcon },
        { label: 'Bản quyền', page: 'copyright', icon: EyeIcon },
    ];
    
  return (
    <aside className="w-64 flex-shrink-0 bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border p-4 hidden md:flex flex-col">
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg"></div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">STUDIO AUTO</h1>
      </div>
      <nav className="flex-1 space-y-2">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sáng tạo</p>
        <ul className="space-y-1">
          {mainNavItems.map(item => <NavItem key={item.page} {...item} currentPage={currentPage} setCurrentPage={setCurrentPage} />)}
        </ul>
        <p className="px-4 pt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tài khoản</p>
        <ul className="space-y-1">
          {secondaryNavItems.map(item => <NavItem key={item.page} {...item} currentPage={currentPage} setCurrentPage={setCurrentPage} />)}
          {userIsAdmin && <NavItem label="Admin" page="admin" icon={KeyIcon} currentPage={currentPage} setCurrentPage={setCurrentPage} />}
        </ul>
      </nav>
      <div>
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
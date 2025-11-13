// FIX: Create content for components/MobileSidebar.tsx to resolve module errors.
import React from 'react';
import { Page } from '../types';
import {
  DocumentChartBarIcon,
  SparklesIcon,
  PhotoIcon,
  FilmIcon,
  QueueListIcon,
  BanknotesIcon,
// FIX: Changed UserIcon to UsersIcon as it's the correct exported name.
  UsersIcon,
  KeyIcon,
  EyeIcon,
  ScissorsIcon,
// FIX: Changed Cog6ToothIcon to Cog8ToothIcon as it's the correct exported name.
  Cog8ToothIcon,
  ShareIcon,
} from './icons/Icons';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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
  onClick: () => void;
}> = ({ label, page, icon: Icon, currentPage, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
        currentPage === page
          ? 'bg-primary text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="w-6 h-6 mr-4" />
      {label}
    </button>
  </li>
);

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  currentPage,
  setCurrentPage,
  userIsAdmin,
  onLogout,
}) => {
  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    onClose();
  };
  
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
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border p-4 flex flex-col z-40 transition-transform md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg"></div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">STUDIO AUTO</h1>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sáng tạo</p>
          <ul className="space-y-1">
            {/* FIX: Removed 'as Page' cast, which is no longer needed due to strong typing. */}
            {mainNavItems.map(item => <NavItem key={item.page} {...item} currentPage={currentPage} onClick={() => handleNavClick(item.page)} />)}
          </ul>
          <p className="px-4 pt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tài khoản</p>
          <ul className="space-y-1">
            {/* FIX: Removed 'as Page' cast, which is no longer needed due to strong typing. */}
            {secondaryNavItems.map(item => <NavItem key={item.page} {...item} currentPage={currentPage} onClick={() => handleNavClick(item.page)} />)}
            {userIsAdmin && <NavItem label="Admin" page="admin" icon={KeyIcon} currentPage={currentPage} onClick={() => handleNavClick('admin')} />}
          </ul>
        </nav>
        <div>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
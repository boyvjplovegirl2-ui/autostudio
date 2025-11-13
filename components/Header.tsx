import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { 
    SunIcon, MoonIcon, Bars3Icon, MagnifyingGlassIcon, UserCircleIcon, 
    Cog8ToothIcon, ArrowLeftStartOnRectangleIcon, GlobeAltIcon, ChevronDownIcon 
} from './icons/Icons';
import { User, Page } from '../types';

interface HeaderProps {
  user: User;
  title: string;
  onMenuClick: () => void;
  onSearchClick: () => void;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
}

const LanguageSwitcher: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState({ code: 'vi', name: 'VIE', flag: '🇻🇳' });
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const languages = [
        { code: 'vi', name: 'VIE', flag: '🇻🇳' },
        { code: 'en', name: 'ENG', flag: '🇬🇧' },
        { code: 'jp', name: 'JPN', flag: '🇯🇵' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                <GlobeAltIcon className="w-6 h-6" />
                <span className="text-sm font-semibold">{selectedLang.flag} {selectedLang.name}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-md shadow-lg z-20">
                    {languages.map(lang => (
                        <button 
                            key={lang.code}
                            onClick={() => {
                                setSelectedLang(lang);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                           <span>{lang.flag}</span>
                           <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


const UserMenu: React.FC<{ user: User; onLogout: () => void; setCurrentPage: (page: Page) => void; }> = ({ user, onLogout, setCurrentPage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const handleNavigation = (page: Page) => {
        setCurrentPage(page);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center justify-center">
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                    <span className="font-bold text-white text-lg">{user.name.charAt(0).toUpperCase()}</span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-md shadow-lg z-20">
                    <div className="px-4 py-3 border-b border-light-border dark:border-dark-border">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                        <button onClick={() => handleNavigation('profile')} className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                           <UserCircleIcon className="w-5 h-5 mr-2" /> Hồ sơ
                        </button>
                        <button onClick={() => handleNavigation('profile')} className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                           <Cog8ToothIcon className="w-5 h-5 mr-2" /> Cài đặt
                        </button>
                    </div>
                    <div className="py-1 border-t border-light-border dark:border-dark-border">
                        <button onClick={onLogout} className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                            <ArrowLeftStartOnRectangleIcon className="w-5 h-5 mr-2" /> Đăng xuất
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ user, title, onMenuClick, onSearchClick, setCurrentPage, onLogout }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-20 flex-shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
      <div className="flex items-center space-x-2">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Open menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">{title}</h2>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={onSearchClick}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Search"
          title="Tìm kiếm ý tưởng"
        >
          <MagnifyingGlassIcon className="w-6 h-6" />
        </button>
        
        <LanguageSwitcher />

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
        >
          {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>
        
        <UserMenu user={user} onLogout={onLogout} setCurrentPage={setCurrentPage} />
      </div>
    </header>
  );
};

export default Header;
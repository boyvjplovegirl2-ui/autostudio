import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './hooks/useTheme';
import { Page, User, Story, GeneratedItem, YouTubeScript, PlanName } from './types';

// Import Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import StoryGenerator from './pages/StoryGenerator';
import PromptGenerator from './pages/PromptGenerator';
import ImageGenerator from './pages/ImageGenerator';
import VideoGenerator from './pages/VideoGenerator';
import ThumbnailGenerator from './pages/ThumbnailGenerator';
import YouTubeScriptGenerator from './pages/YouTubeScriptGenerator';
import ShortHighlightGenerator from './pages/ShortHighlightGenerator';
import History from './pages/History';
import Pricing from './pages/Pricing';
import Support from './pages/Support';
import CopyrightPage from './pages/CopyrightPage';
import Admin from './pages/Admin';
import VideoFromImageGenerator from './pages/VideoFromImageGenerator';
import ConsistentVideoGenerator from './pages/ConsistentVideoGenerator';
import AutoGenerator from './pages/AutoGenerator';
import VideoMerger from './pages/VideoMerger';
import Profile from './pages/Profile';
import SocialManager from './pages/SocialManager';


// Import Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileSidebar from './components/MobileSidebar';
import SearchModal from './components/SearchModal';

// Custom hook for localStorage state
function useLocalStorageState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}


const App: React.FC = () => {
  const [user, setUser] = useLocalStorageState<User | null>('studio-auto-user', null);
  const [currentPage, setCurrentPage] = useLocalStorageState<Page>('studio-auto-page', 'dashboard');
  
  // App-wide data state
  const [stories, setStories] = useLocalStorageState<Story[]>('studio-auto-stories', []);
  const [generatedItems, setGeneratedItems] = useLocalStorageState<GeneratedItem[]>('studio-auto-generated-items', []);
  const [youtubeScripts, setYoutubeScripts] = useLocalStorageState<YouTubeScript[]>('studio-auto-youtube-scripts', []);

  // Story passed from StoryGenerator to PromptGenerator
  const [selectedStoryForPrompt, setSelectedStoryForPrompt] = useState<Story | null>(null);

  // UI State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // --- Data Management Callbacks ---
  const addStory = (story: Story) => setStories(prev => [...prev, story]);
  const updateStory = (updatedStory: Story) => setStories(prev => prev.map(s => s.id === updatedStory.id ? updatedStory : s));
  const deleteStory = (id: string) => setStories(prev => prev.filter(s => s.id !== id));
  const addGeneratedItem = (item: GeneratedItem) => setGeneratedItems(prev => [...prev, item]);
  const addYouTubeScript = (script: YouTubeScript) => setYoutubeScripts(prev => [...prev, script]);
  const deleteYouTubeScript = (id: string) => setYoutubeScripts(prev => prev.filter(s => s.id !== id));
  
  const clearAllHistory = () => {
    setStories([]);
    setGeneratedItems([]);
    setYoutubeScripts([]);
  };

  const updateUserPlan = (planName: PlanName) => {
    if (user) {
        setUser({ ...user, plan: planName });
    }
  };

  const handleLogin = (loggedInUser: User) => setUser(loggedInUser);
  const handleSignup = (newUser: User) => setUser(newUser);
  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
    // Clear all app-related local storage on logout
    Object.keys(window.localStorage).forEach(key => {
        if (key.startsWith('studio-auto-')) {
            window.localStorage.removeItem(key);
        }
    });
  };

  const navigateToPromptGenerator = (story: Story) => {
    setSelectedStoryForPrompt(story);
    setCurrentPage('prompt-generator');
  };

  const pageTitles: Record<Page, string> = {
      dashboard: 'Dashboard',
      'story-generator': 'Tạo Câu chuyện',
      'prompt-generator': 'Tạo Prompt Video',
      'image-generator': 'Tạo Ảnh Whisk (Nano Banana) Pro',
      'video-generator': 'Tạo video bằng Veo3/Veo 3.1 / Text to Videos',
      'thumbnail-generator': 'Tạo Ảnh Thumbnail',
      'youtube-script-generator': 'Kịch bản YouTube',
      'short-highlight-generator': 'Short Highlight',
      'video-from-image-generator': 'Tạo video từ ảnh (Beta)',
      'consistent-video-generator': 'Tạo video Đồng nhất bằng Ảnh/Khung hình',
      'auto-generator': 'Tạo Tự Động',
      'video-merger': 'Ghép Video',
      'social-manager': 'Quản lý Mạng Xã Hội',
      history: 'Lịch sử Tạo',
      pricing: 'Gói tài khoản',
      support: 'Hỗ trợ',
      copyright: 'Bản quyền',
      admin: 'Admin Panel',
      profile: 'Quản lý Hồ sơ',
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard user={user} generatedItems={generatedItems} stories={stories} setCurrentPage={setCurrentPage} />;
      case 'story-generator': return <StoryGenerator addStory={addStory} stories={stories} updateStory={updateStory} navigateToPromptGenerator={navigateToPromptGenerator} deleteStory={deleteStory} />;
      case 'prompt-generator': return <PromptGenerator selectedStory={selectedStoryForPrompt} stories={stories} addGeneratedItem={addGeneratedItem} generatedItems={generatedItems} />;
      case 'image-generator': return <ImageGenerator stories={stories} addGeneratedItem={addGeneratedItem} />;
      case 'video-generator': return <VideoGenerator user={user!} addGeneratedItem={addGeneratedItem} generatedItems={generatedItems} />;
      case 'thumbnail-generator': return <ThumbnailGenerator stories={stories} addGeneratedItem={addGeneratedItem} />;
      case 'youtube-script-generator': return <YouTubeScriptGenerator youtubeScripts={youtubeScripts} addYouTubeScript={addYouTubeScript} deleteYouTubeScript={deleteYouTubeScript} />;
      case 'short-highlight-generator': return <ShortHighlightGenerator addGeneratedItem={addGeneratedItem} generatedVideos={generatedItems.filter(i => i.type === 'video')} />;
      case 'video-from-image-generator': return <VideoFromImageGenerator stories={stories} addGeneratedItem={addGeneratedItem} />;
      case 'consistent-video-generator': return <ConsistentVideoGenerator stories={stories} addGeneratedItem={addGeneratedItem} />;
      case 'auto-generator': return <AutoGenerator />;
      case 'video-merger': return <VideoMerger generatedItems={generatedItems} />;
      case 'social-manager': return <SocialManager user={user!} />;
      case 'history': return <History stories={stories} generatedItems={generatedItems} clearAllHistory={clearAllHistory} />;
      case 'pricing': return <Pricing updateUserPlan={updateUserPlan} />;
      case 'support': return <Support />;
      case 'copyright': return <CopyrightPage />;
      case 'admin': return <Admin />;
      case 'profile': return <Profile user={user!} setUser={setUser} />;
      default: return <Dashboard user={user} generatedItems={generatedItems} stories={stories} setCurrentPage={setCurrentPage}/>;
    }
  };

  if (!user) {
    return <ThemeProvider><Auth onLogin={handleLogin} onSignup={handleSignup} /></ThemeProvider>;
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-gray-100">
        <Sidebar 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          userIsAdmin={user.isAdmin}
          onLogout={handleLogout}
        />
        <MobileSidebar 
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          userIsAdmin={user.isAdmin}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            user={user}
            title={pageTitles[currentPage]}
            onMenuClick={() => setIsMobileSidebarOpen(true)}
            onSearchClick={() => setIsSearchModalOpen(true)}
            setCurrentPage={setCurrentPage}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 page-fade-in">
            {renderPage()}
          </main>
        </div>
        <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
      </div>
    </ThemeProvider>
  );
};

export default App;
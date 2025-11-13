import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Loader from '../components/ui/Loader';
import Input from '../components/ui/Input';
import { generateFullThumbnail } from '../services/geminiService';
import { GeneratedItem, Story } from '../types';
import { SparklesIcon, TrashIcon, QueueListIcon } from '../components/icons/Icons';

interface ThumbnailGeneratorProps {
  stories: Story[];
  addGeneratedItem: (item: GeneratedItem) => void;
}

const ThumbnailGenerator: React.FC<ThumbnailGeneratorProps> = ({ stories, addGeneratedItem }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [createMode, setCreateMode] = useState<'story' | 'manual'>('story');

  // Input state
  const [selectedStoryId, setSelectedStoryId] = useState('');
  const [manualPrompt, setManualPrompt] = useState('');
  const [thumbnailTitle, setThumbnailTitle] = useState('');
  const [platform, setPlatform] = useState<'YouTube' | 'Facebook' | 'TikTok'>('YouTube');
  
  // Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<GeneratedItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('studio-auto-thumbnail-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveHistory = (newHistory: GeneratedItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('studio-auto-thumbnail-history', JSON.stringify(newHistory));
  };

  const addToHistory = (item: GeneratedItem) => {
    const newHistory = [item, ...history];
    saveHistory(newHistory);
    addGeneratedItem(item); // Also add to global history if needed
  };

  const deleteFromHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    saveHistory(newHistory);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const sourcePrompt = createMode === 'story'
      ? stories.find(s => s.id === selectedStoryId)?.content
      : manualPrompt;

    if (!sourcePrompt || !thumbnailTitle) {
      setError('Vui lòng chọn câu chuyện/nhập prompt và điền tiêu đề thumbnail.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const fullPrompt = `Chủ đề: ${sourcePrompt.substring(0, 500)}...`;
      const imageUrl = await generateFullThumbnail(fullPrompt, thumbnailTitle, platform);
      setGeneratedImageUrl(imageUrl);
      addToHistory({
        id: new Date().toISOString(),
        type: 'thumbnail',
        prompt: `[${thumbnailTitle}] from ${createMode}`,
        content: imageUrl,
        createdAt: new Date(),
      });
    } catch (err) {
      setError('Không thể tạo thumbnail. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const storyOptions = stories.length > 0
    ? [{ value: '', label: '-- Chọn một câu chuyện --' }, ...stories.map(s => ({ value: s.id, label: s.title }))]
    : [{ value: '', label: 'Chưa có câu chuyện nào' }];

  const renderCreate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="flex border-b border-light-border dark:border-dark-border">
            <button type="button" onClick={() => setCreateMode('story')} className={`px-4 py-2 font-semibold ${createMode === 'story' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Tạo theo câu chuyện</button>
            <button type="button" onClick={() => setCreateMode('manual')} className={`px-4 py-2 font-semibold ${createMode === 'manual' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Tạo thủ công</button>
          </div>

          {createMode === 'story' ? (
            <Select label="Chọn câu chuyện" options={storyOptions} value={selectedStoryId} onChange={e => setSelectedStoryId(e.target.value)} />
          ) : (
            <Textarea label="Prompt tạo ảnh" placeholder="VD: một phi hành gia đang cưỡi một con rồng vũ trụ, phong cách điện ảnh..." rows={4} value={manualPrompt} onChange={e => setManualPrompt(e.target.value)} />
          )}

          <Input label="Tiêu đề trên Thumbnail" placeholder="VD: HÀNH TRÌNH VÀO VŨ TRỤ" value={thumbnailTitle} onChange={e => setThumbnailTitle(e.target.value)} required />
          <Select label="Tối ưu cho nền tảng" value={platform} onChange={e => setPlatform(e.target.value as any)} options={[{value: 'YouTube', label: 'YouTube (16:9)'}, {value: 'Facebook', label: 'Facebook Post (1:1)'}, {value: 'TikTok', label: 'TikTok Story (9:16)'}]} />
          
          <p className="text-xs text-center text-gray-500 pt-1">
            💡 AI sẽ tự động tạo thumbnail hoàn chỉnh (ảnh, bố cục, màu sắc, font chữ) dựa trên prompt và tiêu đề bạn cung cấp.
          </p>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <Button type="submit" isLoading={isLoading} size="lg" className="w-full !mt-8">
            <SparklesIcon className="w-5 h-5 mr-2" />
            {isLoading ? 'Đang tạo tự động...' : 'Tạo Thumbnail'}
          </Button>
        </form>
      </Card>
      <Card className="flex flex-col items-center justify-center">
        <h3 className="text-xl font-bold mb-4">Kết quả</h3>
        <div className="w-full aspect-video bg-gray-100 dark:bg-dark-bg rounded-lg flex items-center justify-center">
          {isLoading && <Loader message="AI đang thiết kế..." />}
          {!isLoading && generatedImageUrl && <img src={generatedImageUrl} alt="Generated Thumbnail" className="w-full h-full object-contain" />}
          {!isLoading && !generatedImageUrl && <p className="text-gray-500">Thumbnail sẽ xuất hiện ở đây.</p>}
        </div>
        {generatedImageUrl && (
          <a href={generatedImageUrl} download={`thumbnail-${Date.now()}.jpg`}>
            <Button variant="secondary" className="w-full mt-4">Tải xuống</Button>
          </a>
        )}
      </Card>
    </div>
  );
  
  const renderHistory = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {history.length === 0 ? (
        <p className="col-span-full text-center text-gray-500 py-8">Lịch sử trống.</p>
      ) : (
        history.map(item => (
          <Card key={item.id} className="p-0 overflow-hidden group">
            <img src={item.content} alt={item.prompt} className="w-full aspect-video object-cover" />
            <div className="p-3">
              <p className="text-xs text-gray-500 truncate">{item.prompt}</p>
              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href={item.content} download={`thumbnail-${item.id}.jpg`} className="flex-1">
                  <Button size="sm" variant="secondary" className="w-full">Tải</Button>
                </a>
                <Button size="sm" variant="danger" onClick={() => deleteFromHistory(item.id)}>
                  <TrashIcon className="w-4 h-4"/>
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
       <div className="flex border-b border-light-border dark:border-dark-border tab-button-container">
        <button onClick={() => setActiveTab('create')} className={`px-4 font-semibold flex items-center gap-2 ${activeTab === 'create' ? 'active-tab' : 'text-gray-500'}`}>
            <SparklesIcon className="w-5 h-5" />
            <span>Tạo Mới</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`px-4 font-semibold flex items-center gap-2 ${activeTab === 'history' ? 'active-tab' : 'text-gray-500'}`}>
            <QueueListIcon className="w-5 h-5" />
            <span>Lịch sử ({history.length})</span>
        </button>
      </div>

      {activeTab === 'create' ? renderCreate() : renderHistory()}
    </div>
  );
};

export default ThumbnailGenerator;
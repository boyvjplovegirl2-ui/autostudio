import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { Story, GeneratedItem, GeneratedItemType } from '../types';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { DocumentTextIcon, FilmIcon, PhotoIcon, SparklesIcon, QueueListIcon } from '../components/icons/Icons';

interface HistoryProps {
  stories: Story[];
  generatedItems: GeneratedItem[];
  clearAllHistory: () => void;
}

type ItemType = 'story' | GeneratedItemType;
type HistoryTab = 'story' | 'thumbnail' | 'video' | 'prompt';

const itemIcons: Record<ItemType, React.ElementType> = {
  story: DocumentTextIcon,
  prompt: SparklesIcon,
  image: PhotoIcon,
  video: FilmIcon,
  thumbnail: PhotoIcon,
  'short-highlight': FilmIcon,
};

const HistoryItemCard: React.FC<{ item: any; isSelected: boolean; onSelect: (id: string, checked: boolean) => void; }> = ({ item, isSelected, onSelect }) => {
  const isMedia = ['image', 'video', 'thumbnail', 'short-highlight'].includes(item.itemType);

  return (
    <Card className="flex flex-col">
        <div className="flex items-center gap-2">
            <input type="checkbox" checked={isSelected} onChange={e => onSelect(item.id, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{item.title}</p>
                <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('vi-VN')}</p>
            </div>
        </div>
        {isMedia && (
            <div className="w-full aspect-video flex-shrink-0 bg-dark-bg rounded-md my-2">
                {item.itemType === 'image' || item.itemType === 'thumbnail' ? (
                    <img src={item.content} alt={item.prompt} className="w-full h-full object-cover rounded-md" />
                ) : (
                    <video src={item.content} controls className="w-full h-full object-cover rounded-md" />
                )}
            </div>
        )}
        {!isMedia && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 my-2 bg-light-bg dark:bg-dark-bg p-2 rounded-md">
                {item.description}
            </p>
        )}
    </Card>
  );
};


const History: React.FC<HistoryProps> = ({ stories, generatedItems, clearAllHistory }) => {
  const [activeTab, setActiveTab] = useState<HistoryTab>('story');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const allItems = useMemo(() => {
    return [
      ...stories.map(s => ({ ...s, itemType: 'story' as const, date: s.createdAt, title: s.generatedTitle || s.title, description: s.generatedDescription || s.content })),
      ...generatedItems.map(i => ({ ...i, itemType: i.type, date: i.createdAt, title: i.prompt, description: i.type === 'prompt' ? i.content : i.prompt }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [stories, generatedItems]);

  const getFilteredItems = (type: HistoryTab) => {
    const byType = allItems.filter(item => {
        if (type === 'video') {
            return item.itemType === 'video' || item.itemType === 'short-highlight';
        }
        return item.itemType === type;
    });
    if (!searchQuery) return byType;
    return byType.filter(item => (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()));
  };
  
  const currentItems = getFilteredItems(activeTab);
  const counts = {
      story: allItems.filter(i => i.itemType === 'story').length,
      thumbnail: allItems.filter(i => i.itemType === 'thumbnail').length,
      video: allItems.filter(i => i.itemType === 'video' || i.itemType === 'short-highlight').length,
      prompt: allItems.filter(i => i.itemType === 'prompt').length,
  };

  const tabs: { id: HistoryTab; label: string; icon: React.ElementType; }[] = [
    { id: 'story', label: 'Câu chuyện', icon: DocumentTextIcon },
    { id: 'thumbnail', label: 'Thumbnail', icon: PhotoIcon },
    { id: 'video', label: 'Videos', icon: FilmIcon },
    { id: 'prompt', label: 'Prompts Video', icon: SparklesIcon },
  ];
  
  const handleSelect = (id: string, isChecked: boolean) => {
    setSelectedItems(prev => {
        const newSet = new Set(prev);
        if (isChecked) newSet.add(id);
        else newSet.delete(id);
        return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedItems(new Set(currentItems.map(item => item.id)));
    } else {
        setSelectedItems(new Set());
    }
  };
  
  const handleDeleteSelected = () => {
      alert(`Chức năng xóa hàng loạt đang được phát triển. Sẽ xóa ${selectedItems.size} mục.`);
      // In a real app, you would call APIs to delete these items.
      // This is a placeholder for the UI demonstration.
      setSelectedItems(new Set());
  };


  return (
    <div className="space-y-6">
      <div className="flex border-b border-light-border dark:border-dark-border tab-button-container">
        {tabs.map(tab => {
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSelectedItems(new Set()); }}
                    className={`px-4 font-semibold flex items-center gap-2 ${activeTab === tab.id ? 'active-tab' : 'text-gray-500'}`}
                >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    <span className="bg-gray-200 dark:bg-dark-border text-xs font-bold px-2 py-0.5 rounded-full">{counts[tab.id]}</span>
                </button>
            )
        })}
      </div>
      
      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <input type="checkbox" id="select-all" onChange={handleSelectAll} checked={selectedItems.size === currentItems.length && currentItems.length > 0} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="select-all" className="font-medium text-sm">Chọn tất cả ({selectedItems.size} / {currentItems.length})</label>
                <Button size="sm" variant="danger" disabled={selectedItems.size === 0} onClick={handleDeleteSelected}>Xóa mục đã chọn</Button>
                <Button size="sm" variant="outline" disabled={selectedItems.size === 0}>Tải xuống</Button>
            </div>
            <div className="w-full sm:w-64">
                <Input placeholder="Tìm kiếm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
        </div>
      </Card>

      <div>
        {currentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentItems.map(item => <HistoryItemCard key={item.id} item={item} isSelected={selectedItems.has(item.id)} onSelect={handleSelect} />)}
          </div>
        ) : (
          <Card>
            <p className="text-center text-gray-500 py-12">
              {searchQuery ? 'Không tìm thấy kết quả phù hợp.' : 'Không có mục nào trong lịch sử cho loại này.'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;
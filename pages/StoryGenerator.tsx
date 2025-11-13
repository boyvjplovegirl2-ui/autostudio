import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Loader from '../components/ui/Loader';
import { generateStory, generateStoryMeta } from '../services/geminiService';
import { Story } from '../types';
import { SpeakerWaveIcon, SpeakerXMarkIcon, ClipboardDocumentIcon, TrashIcon, PencilSquareIcon, SparklesIcon, QueueListIcon } from '../components/icons/Icons';

interface StoryGeneratorProps {
  addStory: (story: Story) => void;
  stories: Story[];
  updateStory: (story: Story) => void;
  navigateToPromptGenerator: (story: Story) => void;
  deleteStory: (id: string) => void;
}

const lengthOptions = [
  '1000 từ ~1.5 phút đọc', '2000 từ ~3 phút đọc', '3500 từ ~5 phút đọc',
  '7000 từ ~10 phút đọc', '10000 từ ~15 phút đọc', '20000 từ ~30 phút đọc', 'Tùy chỉnh...',
];

const styleOptions = [
    // Genres
    'Kể chuyện', 'Hành động/Chiến đấu', 'Tình cảm/Lãng mạn', 'Hài hước/Vui nhộn', 'Kinh dị/Horror',
    'Bí ẩn/Trinh thám', 'Fantasy/Thần thoại', 'Khoa học viễn tưởng', 'Drama/Chính kịch', 
    'Phiêu lưu/Thám hiểm', 'Đời thường/Slice of Life', 'Lịch sử/Dã sử', 'Miền Tây (Western)',
    
    // Tones
    'Truyền cảm hứng', 'Bi kịch', 'Gây cấn (Suspense)', 'Nhẹ nhàng/Thư giãn', 'Nghiêm túc/Học thuật',
    
    // Formats
    'Phim ngắn', 'Trailer phim', 'Phim tài liệu', 'Quảng cáo/Marketing', 'Video giáo dục', 
    'Hướng dẫn/Tutorial', 'Tin tức/Phóng sự', 'Vlog đời sống', 'Review sản phẩm',
    
    // Visual Styles
    'Hoạt hình 2D', 'Hoạt hình 3D', 'Anime', 'Cyberpunk', 'Steampunk', 'Phim Noir', 'Vintage/Cổ điển',
    
    // Content Types
    'Thể thao', 'Du lịch', 'Thời trang', 'Ẩm thực', 'Công nghệ', 'Âm nhạc', 'Game',
    
    // Special
    'Phát triển dựa trên nội dung gốc', 'Tùy chỉnh...'
];


const MetaGenerator: React.FC<{
  stories: Story[];
  updateStory: (story: Story) => void;
}> = ({ stories, updateStory }) => {
  const [selectedStoryId, setSelectedStoryId] = useState<string>('');
  const [platform, setPlatform] = useState<string>('YouTube');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ title: string; description: string; hashtags: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const storyOptions = stories.length > 0
    ? [{ value: '', label: '-- Chọn một câu chuyện để tạo TĐ/MT --' }, ...stories.map(s => ({ value: s.id, label: s.title }))]
    : [{ value: '', label: 'Chưa có câu chuyện nào, hãy tạo một câu chuyện trước.' }];
    
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoryId) {
        setError("Vui lòng chọn một câu chuyện.");
        return;
    }
    const selectedStory = stories.find(s => s.id === selectedStoryId);
    if (!selectedStory) return;

    setIsLoading(true);
    setGeneratedContent(null);
    setError(null);

    try {
        const meta = await generateStoryMeta(selectedStory.content, platform);
        setGeneratedContent(meta);
        
        const updatedStory: Story = {
            ...selectedStory,
            generatedTitle: meta.title,
            generatedDescription: meta.description,
            generatedHashtags: meta.hashtags.join(' '),
            generatedMetaPlatform: platform,
        };
        updateStory(updatedStory);

    } catch (err) {
        setError('Không thể tạo tiêu đề/mô tả. Vui lòng thử lại.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold">Chọn câu chuyện</h3>
            <Select
                id="story-select"
                options={storyOptions}
                value={selectedStoryId}
                onChange={e => { setSelectedStoryId(e.target.value); setError(null); }}
                disabled={stories.length === 0}
            />
            
            <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tối ưu SEO cho nền tảng</label>
                <div className="flex flex-wrap gap-2">
                    {['YouTube', 'Facebook', 'TikTok', 'Blog/Website'].map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => setPlatform(opt)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${platform === opt ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-dark-bg border-gray-200 dark:border-dark-border hover:border-primary dark:hover:border-primary text-gray-700 dark:text-gray-300'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" isLoading={isLoading} size="lg" className="w-full !mt-8" disabled={stories.length === 0 || isLoading}>
                {isLoading ? 'Đang tạo...' : 'Tạo Tiêu đề, Mô tả & Hashtag'}
            </Button>
        </form>
      </Card>
      <Card>
        <h2 className="text-xl font-bold mb-4">Kết quả</h2>
        <div className="space-y-4">
            {isLoading && <Loader message="AI đang sáng tạo nội dung..." />}
            {generatedContent ? (
                <>
                    <div>
                        <Input label="Tiêu đề" value={generatedContent.title} readOnly />
                    </div>
                    <div>
                        <Textarea label="Mô tả" value={generatedContent.description} rows={5} readOnly />
                    </div>
                    <div>
                        <Input label="Hashtags" value={generatedContent.hashtags.join(' ')} readOnly />
                    </div>
                </>
            ) : (
                !isLoading && <p className="text-gray-500 text-center py-10">Nội dung tạo ra sẽ xuất hiện ở đây.</p>
            )}
        </div>
      </Card>
    </div>
  );
};

interface StoryHistoryProps {
  stories: Story[];
  onCopy: (content: string) => void;
  onEdit: (story: Story) => void;
  onDelete: (id: string) => void;
}

const StoryHistory: React.FC<StoryHistoryProps> = ({ stories, onCopy, onEdit, onDelete }) => {
    if (stories.length === 0) {
        return <Card><p className="text-center text-gray-500 py-8">Chưa có câu chuyện nào trong lịch sử.</p></Card>
    }

    return (
        <div className="space-y-4">
            {stories.slice().reverse().map(story => (
                <Card key={story.id}>
                    <h3 className="font-bold text-lg">{story.generatedTitle || story.title}</h3>
                    <p className="text-xs text-gray-400 mb-2">{new Date(story.createdAt).toLocaleString('vi-VN')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{story.generatedDescription || story.content}</p>
                    {story.generatedHashtags && <p className="text-sm text-primary font-medium">{story.generatedHashtags}</p>}
                    <details className="mt-3 text-sm">
                        <summary className="cursor-pointer text-primary hover:underline">Xem toàn bộ câu chuyện</summary>
                        <p className="mt-2 prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{story.content}</p>
                    </details>
                    <div className="border-t border-light-border dark:border-dark-border mt-4 pt-3 flex justify-end items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => onCopy(story.content)} className="flex items-center gap-1.5">
                            <ClipboardDocumentIcon className="w-4 h-4" />
                            Copy
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onEdit(story)} className="flex items-center gap-1.5">
                            <PencilSquareIcon className="w-4 h-4" />
                            Sửa
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => onDelete(story.id)} className="flex items-center gap-1.5">
                            <TrashIcon className="w-4 h-4" />
                            Xóa
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
};


const StoryGenerator: React.FC<StoryGeneratorProps> = ({ addStory, stories, updateStory, navigateToPromptGenerator, deleteStory }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'meta' | 'history'>('generate');
  
  // States for story generation tab
  const [idea, setIdea] = useState('');
  const [selectedLength, setSelectedLength] = useState('2000 từ ~3 phút đọc');
  const [customLength, setCustomLength] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Kể chuyện');
  const [customStyle, setCustomStyle] = useState('');
  const [language, setLanguage] = useState('Vietnamese');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<Story | null>(null);

  // State for Text-to-Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Cleanup speechSynthesis on component unmount
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (!generatedStory?.content) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(generatedStory.content);
      utterance.lang = language === 'Vietnamese' ? 'vi-VN' : 'en-US';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false); // Handle potential errors
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    const finalStyle = selectedStyle === 'Tùy chỉnh...' ? customStyle : selectedStyle;
    if (selectedStyle === 'Tùy chỉnh...' && !customStyle.trim()) return;
    
    const finalLength = selectedLength === 'Tùy chỉnh...' ? `${customLength} từ` : selectedLength;
    if (selectedLength === 'Tùy chỉnh...' && !customLength.trim()) return;

    setIsLoading(true);
    setGeneratedStory(null);
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }

    try {
      const content = await generateStory(idea, finalStyle, finalLength, '', language);
      const newStory: Story = {
        id: new Date().toISOString(),
        title: `Câu chuyện về "${idea.substring(0, 30)}..."`,
        content,
        genre: finalStyle,
        length: finalLength,
        emotion: '',
        createdAt: new Date(),
        language: language,
      };
      setGeneratedStory(newStory);
      addStory(newStory);
    } catch (error) {
      console.error("Failed to generate story", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMockStory = () => {
    const mockIdea = "một chú rồng con học cách phun lửa";
    const mockContent = `Ngày xửa ngày xưa, trong một hang động ấm cúng trên đỉnh núi Mây, có một chú rồng con tên là Fido. Fido khác biệt với các bạn rồng khác. Trong khi bạn bè của cậu đã có thể khè ra những ngọn lửa rực rỡ, Fido chỉ có thể... phụt ra những làn khói nhỏ màu xám.

"Fido, con phải tập trung hơn!" mẹ cậu dặn. Nhưng dù Fido có hít một hơi thật sâu, gồng mình và cố gắng hết sức, kết quả vẫn chỉ là một tiếng 'xì' và một cụm khói lơ đãng bay lên.

Một ngày nọ, khi đang buồn bã ngồi bên bờ suối, Fido thấy một chú chim sẻ đang run rẩy vì lạnh. Thương cảm, Fido liền tiến lại gần và nhẹ nhàng phà một làn khói ấm áp về phía chú chim. Bất ngờ thay, từ trong làn khói ấy, một đốm lửa nhỏ tí xíu nhưng sáng rực bỗng lóe lên, sưởi ấm cho chú chim.

Fido nhận ra rằng, ngọn lửa của cậu không đến từ sự gắng gượng, mà đến từ lòng tốt và sự quan tâm. Từ hôm đó, Fido trở thành chú rồng có ngọn lửa ấm áp và dịu dàng nhất, một ngọn lửa của tình bạn.`;
    
    const newStory: Story = {
      id: new Date().toISOString(),
      title: `Câu chuyện về "${mockIdea}" (Mock)`,
      content: mockContent,
      genre: 'Kể chuyện',
      length: '~1.5 phút đọc',
      emotion: 'ấm áp',
      createdAt: new Date(),
      language: 'Vietnamese',
    };
    setGeneratedStory(newStory);
    addStory(newStory);
  };

  const handleCopyStory = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      alert('Đã sao chép nội dung câu chuyện!');
    }, () => {
      alert('Sao chép thất bại.');
    });
  };

  const handleEditStory = (story: Story) => {
    const ideaFromTitle = story.title.replace('Câu chuyện về "', '').replace('"...', '').replace(' (Mock)', '');
    setIdea(ideaFromTitle);
    setLanguage(story.language || 'Vietnamese');

    if (lengthOptions.includes(story.length)) {
        setSelectedLength(story.length);
        setCustomLength('');
    } else {
        setSelectedLength('Tùy chỉnh...');
        setCustomLength(story.length.replace(/ từ.*/, ''));
    }

    if (styleOptions.includes(story.genre)) {
        setSelectedStyle(story.genre);
        setCustomStyle('');
    } else {
        setSelectedStyle('Tùy chỉnh...');
        setCustomStyle(story.genre);
    }
    
    setGeneratedStory(null);
    setActiveTab('generate');
  };

  const handleDeleteStory = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu chuyện này không?')) {
      deleteStory(id);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <form onSubmit={handleStorySubmit} className="space-y-6">
                <h2 className="text-xl font-bold">Tạo Câu Chuyện (GPT)</h2>
                <Textarea label="Ý tưởng, chủ đề, hoặc mô tả" id="idea" rows={5} value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="VD: Một phi hành gia bị lạc trên sao Hỏa và tìm thấy một di tích cổ..." required title="Nhập ý tưởng chính hoặc mô tả sơ lược về câu chuyện bạn muốn tạo." />
                
                <Select
                    label="Ngôn ngữ"
                    id="language"
                    options={[{value: 'Vietnamese', label: 'Tiếng Việt'}, {value: 'English', label: 'English'}]}
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    title="Chọn ngôn ngữ đầu ra cho câu chuyện."
                />

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Độ dài</h3>
                  <div className="flex flex-wrap gap-2" title="Chọn độ dài ước tính cho câu chuyện của bạn.">
                    {lengthOptions.map(option => (
                      <button key={option} type="button" onClick={() => setSelectedLength(option)} className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${selectedLength === option ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-dark-bg border-gray-200 dark:border-dark-border hover:border-primary dark:hover:border-primary text-gray-700 dark:text-gray-300'}`}>{option}</button>
                    ))}
                  </div>
                   {selectedLength === 'Tùy chỉnh...' && (
                    <div className="mt-4"><Input type="number" value={customLength} onChange={(e) => setCustomLength(e.target.value)} placeholder="Nhập số từ mong muốn (VD: 500)" aria-label="Custom length input" /></div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Phong cách</h3>
                  <div className="flex flex-wrap gap-2" title="Chọn phong cách hoặc thể loại cho câu chuyện.">
                    {styleOptions.map(option => (
                      <button key={option} type="button" onClick={() => setSelectedStyle(option)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedStyle === option ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{option}</button>
                    ))}
                  </div>
                  {selectedStyle === 'Tùy chỉnh...' && (
                    <div className="mt-4"><Input value={customStyle} onChange={(e) => setCustomStyle(e.target.value)} placeholder="Nhập phong cách của bạn" aria-label="Custom style input" /></div>
                  )}
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Button type="submit" isLoading={isLoading} size="lg" className="w-full" title="Bắt đầu quá trình tạo câu chuyện dựa trên các tùy chọn của bạn.">{isLoading ? 'Đang viết...' : 'Tạo câu chuyện'}</Button>
                  <Button type="button" variant="outline" size="lg" onClick={handleMockStory} title="Tạo nhanh một câu chuyện mẫu để thử nghiệm.">Tạo Mock</Button>
                </div>
              </form>
            </Card>
            <Card>
              <h2 className="text-xl font-bold mb-4">Kết quả</h2>
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none h-[400px] overflow-y-auto p-4 bg-gray-100 dark:bg-dark-bg rounded-md">
                {isLoading && <p>AI đang sáng tác, vui lòng chờ trong giây lát...</p>}
                {generatedStory ? <p style={{ whiteSpace: 'pre-wrap' }}>{generatedStory.content}</p> : !isLoading && <p className="text-gray-500">Câu chuyện của bạn sẽ xuất hiện ở đây.</p>}
              </div>
              {generatedStory && (
                <div className="mt-4 flex space-x-2">
                  <Button variant="secondary" onClick={() => navigateToPromptGenerator(generatedStory)} title="Gửi câu chuyện này đến trang Tạo Prompt Video.">Gửi sang tạo Prompt Video</Button>
                  <Button variant="outline" onClick={handleToggleSpeech} title="Nghe AI đọc to câu chuyện này.">
                    {isSpeaking ? <SpeakerXMarkIcon className="w-5 h-5 mr-2" /> : <SpeakerWaveIcon className="w-5 h-5 mr-2" />}
                    {isSpeaking ? 'Dừng đọc' : 'Đọc truyện'}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        );
      case 'meta':
        return <MetaGenerator stories={stories} updateStory={updateStory} />;
      case 'history':
        return <StoryHistory stories={stories} onCopy={handleCopyStory} onEdit={handleEditStory} onDelete={handleDeleteStory} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý Câu chuyện</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Tạo câu chuyện mới, hoặc tạo tiêu đề và mô tả cho các câu chuyện đã có.</p>
      </div>
      
      <div className="flex border-b border-light-border dark:border-dark-border tab-button-container">
        <button onClick={() => setActiveTab('generate')} className={`px-4 font-semibold flex items-center gap-2 ${activeTab === 'generate' ? 'active-tab' : 'text-gray-500'}`}>
            <SparklesIcon className="w-5 h-5" />
            <span>Tạo Câu chuyện</span>
        </button>
        <button onClick={() => setActiveTab('meta')} className={`px-4 font-semibold flex items-center gap-2 ${activeTab === 'meta' ? 'active-tab' : 'text-gray-500'}`}>
            <PencilSquareIcon className="w-5 h-5" />
            <span>Tạo Tiêu đề/Mô tả</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`px-4 font-semibold flex items-center gap-2 ${activeTab === 'history' ? 'active-tab' : 'text-gray-500'}`}>
            <QueueListIcon className="w-5 h-5" />
            <span>Lịch sử</span>
        </button>
      </div>
      
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default StoryGenerator;
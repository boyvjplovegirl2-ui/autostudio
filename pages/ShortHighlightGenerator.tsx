import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Textarea from '../components/ui/Textarea';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { generateShortHighlight } from '../services/geminiService';
import { GeneratedItem } from '../types';
import { FilmIcon } from '../components/icons/Icons';

interface ShortHighlightGeneratorProps {
  addGeneratedItem: (item: GeneratedItem) => void;
  generatedVideos: GeneratedItem[];
}

type SourceTab = 'upload' | 'link' | 'generated';

const ShortHighlightGenerator: React.FC<ShortHighlightGeneratorProps> = ({ addGeneratedItem, generatedVideos }) => {
  const [activeSourceTab, setActiveSourceTab] = useState<SourceTab>('upload');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState('');
  const [selectedGeneratedVideo, setSelectedGeneratedVideo] = useState<GeneratedItem | null>(null);
  const [prompt, setPrompt] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleMock = () => {
    setPrompt("Lấy những cảnh hài hước nhất.");
    setVideoLink("https://www.youtube.com/watch?v=mock_video");
    setActiveSourceTab('link');
    setIsLoading(true);
    setTimeout(() => {
        const mockUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
        setResultUrl(mockUrl);
        addGeneratedItem({
            id: new Date().toISOString(),
            type: 'short-highlight',
            prompt: `[Mock] Highlight from link`,
            content: mockUrl,
            createdAt: new Date(),
        });
        setIsLoading(false);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let source: any;
    let sourceDescription: string;

    switch(activeSourceTab) {
        case 'upload':
            if (!videoFile) {
                setError("Vui lòng chọn một file video để tải lên.");
                return;
            }
            source = { type: 'upload', fileName: videoFile.name };
            sourceDescription = `Highlight from uploaded file: ${videoFile.name}`;
            break;
        case 'link':
            if (!videoLink.trim()) {
                setError("Vui lòng nhập một đường link video.");
                return;
            }
            source = { type: 'link', url: videoLink };
            sourceDescription = `Highlight from link: ${videoLink}`;
            break;
        case 'generated':
            if (!selectedGeneratedVideo) {
                setError("Vui lòng chọn một video đã tạo.");
                return;
            }
            source = { type: 'generated', videoUrl: selectedGeneratedVideo.content };
            sourceDescription = `Highlight from generated video: ${selectedGeneratedVideo.prompt}`;
            break;
        default:
            setError("Nguồn video không hợp lệ.");
            return;
    }
    
    if (!prompt.trim()) {
        setError("Vui lòng nhập prompt để hướng dẫn AI.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setResultUrl(null);

    try {
        const videoUrl = await generateShortHighlight(source, prompt);
        setResultUrl(videoUrl);
        addGeneratedItem({
            id: new Date().toISOString(),
            type: 'short-highlight',
            prompt: `[${prompt}] - ${sourceDescription}`,
            content: videoUrl,
            createdAt: new Date(),
        });
    } catch(err: any) {
        setError(err.message || "Đã xảy ra lỗi khi tạo highlight.");
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const renderSourceInput = () => {
    switch(activeSourceTab) {
      case 'upload':
        return (
          <div className="p-4 border-2 border-dashed border-light-border dark:border-dark-border rounded-lg text-center">
            <Input
              id="video-upload"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="text-sm"
            />
            {videoFile && <p className="text-xs mt-2 text-gray-500">Đã chọn: {videoFile.name}</p>}
          </div>
        );
      case 'link':
        return (
          <Input
            id="video-link"
            type="url"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            placeholder="Dán link YouTube, Facebook, TikTok..."
          />
        );
      case 'generated':
        return (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {generatedVideos.length > 0 ? generatedVideos.map(video => (
              <button
                key={video.id}
                type="button"
                onClick={() => setSelectedGeneratedVideo(video)}
                className={`w-full text-left p-2 rounded-lg border-2 flex items-center space-x-3 transition-colors ${selectedGeneratedVideo?.id === video.id ? 'border-primary bg-primary/10' : 'border-light-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border'}`}
              >
                <video src={video.content} className="w-16 h-9 object-cover rounded bg-dark-bg"></video>
                <p className="text-xs font-medium truncate flex-1">{video.prompt}</p>
              </button>
            )) : <p className="text-sm text-gray-500 text-center">Chưa có video nào được tạo.</p>}
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-xl font-bold">Tạo Short Highlight (AI)</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">1. Chọn nguồn video</label>
            <div className="flex border-b border-light-border dark:border-dark-border mb-4">
              <button type="button" onClick={() => setActiveSourceTab('upload')} className={`px-4 py-2 font-semibold ${activeSourceTab === 'upload' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Tải lên</button>
              <button type="button" onClick={() => setActiveSourceTab('link')} className={`px-4 py-2 font-semibold ${activeSourceTab === 'link' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Link</button>
              <button type="button" onClick={() => setActiveSourceTab('generated')} className={`px-4 py-2 font-semibold ${activeSourceTab === 'generated' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Video đã tạo</button>
            </div>
            {renderSourceInput()}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">2. Hướng dẫn AI bằng Prompt</label>
            <Textarea
              id="highlight-prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="VD: Tạo một video ngắn 30 giây về những khoảnh khắc hài hước nhất.
VD: Lấy những cảnh hành động kịch tính nhất trong video."
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <div className="flex items-center space-x-2 pt-2">
            <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
                {isLoading ? 'AI đang phân tích...' : 'Tạo Highlight'}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={handleMock}>
                Tạo Mock
            </Button>
          </div>
        </form>
      </Card>
      
      <Card className="flex flex-col">
        <h2 className="text-xl font-bold mb-4">Kết quả</h2>
        <div className="aspect-video w-full bg-dark-bg rounded-lg flex items-center justify-center">
          {isLoading && <Loader message="AI đang tìm những cảnh hay nhất..." />}
          {resultUrl && !isLoading && <video src={resultUrl} controls autoPlay loop className="w-full h-full rounded-lg" />}
          {!isLoading && !resultUrl && (
            <div className="text-center text-gray-500">
              <FilmIcon className="w-12 h-12 mx-auto mb-2" />
              <p>Video highlight sẽ xuất hiện ở đây.</p>
            </div>
          )}
        </div>
        {resultUrl && !isLoading && (
            <a href={resultUrl} download={`highlight-${Date.now()}.mp4`}>
                <Button variant="secondary" className="w-full mt-4">Tải xuống</Button>
            </a>
        )}
      </Card>
    </div>
  );
};

export default ShortHighlightGenerator;

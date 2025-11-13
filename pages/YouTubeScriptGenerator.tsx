import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { generateFromYouTubeURL } from '../services/geminiService';
import { YouTubeScript } from '../types';
import { ClipboardDocumentIcon, TrashIcon, PencilSquareIcon, SparklesIcon, QueueListIcon } from '../components/icons/Icons';

interface YouTubeScriptGeneratorProps {
  youtubeScripts: YouTubeScript[];
  addYouTubeScript: (script: YouTubeScript) => void;
  deleteYouTubeScript: (id: string) => void;
}

const predefinedRequests = [
    'Lấy kịch bản đầy đủ của video.',
    'Tóm tắt video thành 5 gạch đầu dòng chính.',
    'Viết lại dưới dạng kịch bản cho video.',
    'Chuyển kịch bản thành một bài thuyết trình.',
    'Tạo ý tưởng video dựa trên kịch bản.',
    'Viết lại thành dạng tin tức',
    'Viết lại kịch bản thành một bài blog.',
    'Chuyển kịch bản sang phong cách hài hước.',
    'Chuyển kịch bản sang phong cách kinh dị.',
    'Chuyển kịch bản sang phong cách hành động.',
    'Tạo tiêu đề hấp dẫn cho video.',
    'Tạo mô tả video thu hút người xem.',
    'Tạo các thẻ (tags) phù hợp cho video.',
    'Viết lời kêu gọi hành động (CTA) cho video.',
    'Tạo phụ đề cho video.',
    'Tạo kịch bản cho video tiếp theo dựa trên nội dung này.',
    'Phân tích cảm xúc của kịch bản.',
    'Dựa trên video này, đề xuất các chủ đề video liên quan.',
    'Phân tích các ý chính của video.',
];


const YouTubeScriptGenerator: React.FC<YouTubeScriptGeneratorProps> = ({ youtubeScripts, addYouTubeScript, deleteYouTubeScript }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  
  const [url, setUrl] = useState('');
  const [request, setRequest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !request.trim()) {
        setError('Vui lòng nhập URL và yêu cầu.');
        return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedResult('');
    try {
      const result = await generateFromYouTubeURL(url, request);
      setGeneratedResult(result);
      addYouTubeScript({
        id: new Date().toISOString(),
        url,
        request,
        result,
        createdAt: new Date(),
      });
    } catch (err) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockScript = () => {
    const mockUrl = "https://www.youtube.com/watch?v=mock";
    const mockRequest = "Tóm tắt video thành 5 gạch đầu dòng chính.";
    const mockResult = `Đây là bản tóm tắt mock cho video:\n\n- **Điểm 1:** Giới thiệu về chủ đề chính, nhấn mạnh tầm quan trọng của nó trong bối cảnh hiện tại.\n- **Điểm 2:** Phân tích sâu hơn về khía cạnh A, đưa ra các ví dụ cụ thể và dữ liệu minh họa.\n- **Điểm 3:** Chuyển sang khía cạnh B, so sánh và đối chiếu với khía cạnh A để làm rõ vấn đề.\n- **Điểm 4:** Đề cập đến những thách thức và cơ hội, cung cấp góc nhìn đa chiều cho người xem.\n- **Điểm 5:** Tổng kết lại các điểm chính và đưa ra lời kêu gọi hành động, khuyến khích khán giả tương tác.`;

    setUrl(mockUrl);
    setRequest(mockRequest);
    setGeneratedResult(mockResult);
    addYouTubeScript({
        id: new Date().toISOString(),
        url: mockUrl,
        request: mockRequest,
        result: mockResult,
        createdAt: new Date(),
    });
  }
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optionally, show a toast notification for feedback
  };

  const handleEdit = (script: YouTubeScript) => {
    setUrl(script.url);
    setRequest(script.request);
    setGeneratedResult('');
    setActiveTab('generate');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'generate':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="URL Video YouTube"
                  id="youtube-url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                <Textarea
                  label="Yêu cầu (Hãy nhập các yêu cầu, ví dụ: thời gian cho câu chuyện mới)"
                  id="youtube-request"
                  rows={4}
                  value={request}
                  onChange={e => setRequest(e.target.value)}
                  placeholder="Lấy kịch bản đầy đủ của video."
                  required
                />
                <div>
                  <div className="flex flex-wrap gap-2">
                    {predefinedRequests.map(preReq => (
                      <button
                        key={preReq}
                        type="button"
                        onClick={() => setRequest(preReq)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-300 hover:bg-primary/20 dark:hover:bg-primary/30"
                      >
                        {preReq}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                
                <div className="flex items-center space-x-2 pt-4">
                  <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
                    {isLoading ? 'Đang xử lý...' : 'Lấy kịch bản'}
                  </Button>
                  <Button type="button" variant="outline" size="lg" onClick={handleMockScript}>Tạo Mock</Button>
                </div>

              </form>
            </Card>
            <Card>
              <h2 className="text-xl font-bold mb-4">Kết quả</h2>
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none h-[500px] overflow-y-auto p-4 bg-gray-100 dark:bg-dark-bg rounded-md relative">
                {isLoading && <Loader message="AI đang phân tích video..." />}
                {generatedResult ? (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{generatedResult}</p>
                 ) : !isLoading && (
                    <p className="text-gray-500">Kết quả sẽ xuất hiện ở đây.</p>
                 )}
                 {generatedResult && !isLoading && (
                    <button onClick={() => handleCopy(generatedResult)} className="absolute top-2 right-2 p-1.5 rounded-md bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-black transition-colors">
                        <ClipboardDocumentIcon className="w-5 h-5" />
                    </button>
                 )}
              </div>
            </Card>
          </div>
        );
      case 'history':
        return (
          <div className="space-y-4">
            {youtubeScripts.length === 0 ? (
              <Card><p className="text-center text-gray-500 py-8">Chưa có mục nào trong lịch sử.</p></Card>
            ) : (
              youtubeScripts.slice().reverse().map(script => (
                <Card key={script.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-gray-400">Từ URL: <a href={script.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{script.url}</a></p>
                      <p className="font-semibold mt-1">Yêu cầu: {script.request}</p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-primary hover:underline">Xem kết quả</summary>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mt-2 whitespace-pre-wrap">{script.result}</p>
                      </details>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                        <button onClick={() => handleCopy(script.result)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-dark-border transition-colors" aria-label="Copy result">
                            <ClipboardDocumentIcon className="w-5 h-5" />
                        </button>
                         <button onClick={() => handleEdit(script)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-dark-border transition-colors" aria-label="Edit item">
                            <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => deleteYouTubeScript(script.id)} className="p-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors" aria-label="Delete item">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Lấy kịch bản YouTube</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Nhập URL video YouTube để lấy kịch bản, tóm tắt, hoặc thực hiện các yêu cầu khác.</p>
      </div>
      
      <div className="flex border-b border-light-border dark:border-dark-border tab-button-container">
        <button onClick={() => setActiveTab('generate')} className={`px-4 font-semibold flex items-center gap-2 ${activeTab === 'generate' ? 'active-tab' : 'text-gray-500'}`}>
            <SparklesIcon className="w-5 h-5" />
            <span>Tạo Mới</span>
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

export default YouTubeScriptGenerator;
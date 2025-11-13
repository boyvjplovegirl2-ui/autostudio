import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Card from '../components/ui/Card';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { generateVideo } from '../services/geminiService';
import { GeneratedItem, VideoScene, User } from '../types';
import { XMarkIcon, SparklesIcon, FilmIcon, EyeIcon } from '../components/icons/Icons';
import VideoPreviewModal from '../components/VideoPreviewModal';


declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

interface VideoGeneratorProps {
  user: User;
  addGeneratedItem: (item: GeneratedItem) => void;
  generatedItems: GeneratedItem[];
}

interface PromptItem {
  id: string;
  prompt: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  resultUrl?: string;
  error?: string;
}

const statusConfig: Record<PromptItem['status'], { text: string; color: string; tooltip: string; }> = {
    pending: { text: 'Chờ chạy', color: 'text-yellow-500', tooltip: 'Prompt đang trong hàng đợi xử lý.' },
    running: { text: 'Đang chạy', color: 'text-blue-500', tooltip: 'AI đang tạo video. Quá trình này có thể mất vài phút.' },
    completed: { text: 'Hoàn thành', color: 'text-green-500', tooltip: 'Video đã được tạo thành công.' },
    error: { text: 'Lỗi', color: 'text-red-500', tooltip: 'Đã xảy ra lỗi. Di chuột để xem chi tiết.' },
};


const VideoGenerator: React.FC<VideoGeneratorProps> = ({ user, addGeneratedItem, generatedItems }) => {
    const [prompts, setPrompts] = useState<PromptItem[]>([]);
    const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(new Set());
    
    // Global settings
    const [model, setModel] = useState('Veo 3.1');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [threads, setThreads] = useState(4);

    const [hasApiKey, setHasApiKey] = useState(false);
    const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const checkApiKey = useCallback(async () => {
        setIsCheckingApiKey(true);
        if (window.aistudio) {
            try {
                const result = await window.aistudio.hasSelectedApiKey();
                setHasApiKey(result);
            } catch (e) { console.error("Error checking API key:", e); setHasApiKey(false); }
        } else {
            console.warn("window.aistudio is not available.");
            setHasApiKey(true); // Default to true for local dev
        }
        setIsCheckingApiKey(false);
    }, []);

    useEffect(() => { checkApiKey(); }, [checkApiKey]);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setHasApiKey(true);
            setGlobalError(null);
        }
    };
    
    const addPrompt = () => {
        const newPrompt: PromptItem = { id: `prompt-${Date.now()}`, prompt: '', status: 'pending' };
        setPrompts(p => [...p, newPrompt]);
    };

    const handleMockData = () => {
        const mockPrompts: PromptItem[] = [
            { id: 'mock-vid-1', prompt: 'A cinematic shot of a lone astronaut walking on a desolate Mars landscape, red dust swirling around their feet.', status: 'completed', resultUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' },
            { id: 'mock-vid-2', prompt: 'An underwater scene of a bioluminescent jellyfish pulsing with vibrant colors in the deep ocean.', status: 'completed', resultUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
            { id: 'mock-vid-3', prompt: 'A time-lapse of a bustling city street from day to night, showcasing the flow of traffic and people.', status: 'pending' },
            { id: 'mock-vid-4', prompt: 'A magical enchanted forest with glowing mushrooms and whimsical creatures.', status: 'error', error: 'Render failed: Asset not found.' }
        ];
        setPrompts(mockPrompts);
    };

    const updatePrompt = (id: string, newValues: Partial<PromptItem>) => {
        setPrompts(prev => prev.map(p => p.id === id ? { ...p, ...newValues } : p));
    };

    const runSinglePrompt = async (promptItem: PromptItem) => {
        if (!promptItem.prompt.trim()) {
            updatePrompt(promptItem.id, { status: 'error', error: 'Prompt is empty' });
            return;
        }

        updatePrompt(promptItem.id, { status: 'running', error: undefined });

        try {
            const result = await generateVideo({
                prompt: promptItem.prompt,
                aspectRatio: aspectRatio,
                resolution: '720p', // Hardcoded for simplicity based on UI
            });
            const apiKey = process.env.API_KEY || '';
            const finalVideoUrl = `${result.videoUrl}&key=${apiKey}`;
            updatePrompt(promptItem.id, { status: 'completed', resultUrl: finalVideoUrl });
            addGeneratedItem({
              id: new Date().toISOString(), type: 'video', prompt: promptItem.prompt,
              content: finalVideoUrl, createdAt: new Date(),
            });
        } catch (err: any) {
            const errorMessage = err.message || 'Unknown error';
            if (errorMessage.includes("Requested entity was not found.")) {
                setGlobalError("API Key không hợp lệ. Vui lòng chọn lại key.");
                setHasApiKey(false);
                updatePrompt(promptItem.id, { status: 'error', error: "Invalid API Key" });
            } else {
                updatePrompt(promptItem.id, { status: 'error', error: errorMessage });
            }
        }
    };
    
    const handleRunAll = async () => {
        for (const p of prompts) {
            await runSinglePrompt(p);
        }
    };
    
    const handleSelect = (id: string, isChecked: boolean) => {
        setSelectedPrompts(prev => {
            const newSet = new Set(prev);
            isChecked ? newSet.add(id) : newSet.delete(id);
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedPrompts(e.target.checked ? new Set(prompts.map(p => p.id)) : new Set());
    };
    
    const deletePrompts = (ids: Set<string>) => {
        setPrompts(prev => prev.filter(p => !ids.has(p.id)));
        setSelectedPrompts(new Set());
    };

    const summary = prompts.reduce((acc, p) => {
        if (p.status === 'completed') acc.completed++;
        else if (p.status === 'error') acc.failed++;
        else if (p.status === 'running') acc.running++;
        else acc.waiting++;
        return acc;
    }, { completed: 0, failed: 0, running: 0, waiting: 0 });

    if (isCheckingApiKey) return <Loader message="Đang kiểm tra API Key..." />;

    return (
        <div className="space-y-6">
            <Card>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
                    <Select label="Model" value={model} onChange={e => setModel(e.target.value)} options={[{value: 'Veo 3.1', label: 'Veo 3.1'}]} />
                    <Select label="Tỷ lệ" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as any)} options={[{value: '16:9', label: '16:9 Ngang'}, {value: '9:16', label: '9:16 Dọc'}]} />
                    <Input label="Luồng (4-8)" type="number" min="4" max="8" value={threads} onChange={e => setThreads(Number(e.target.value))} />
                    <Select label="Tải prompt từ Lịch sử" options={[{value: '', label: '-- Chọn để thay thế --'}]} />
                    <Button variant='outline'>Thêm Prompt TXT/json</Button>
                    <Button onClick={handleMockData} variant="outline">Tạo Mock</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center mt-4">
                    <Button onClick={handleRunAll} className="w-full">Chạy tất cả</Button>
                    <Button variant="outline" className="w-full">Chạy lại chưa xong</Button>
                    <Button variant="outline" className="w-full">Chạy lại 1 lỗi</Button>
                </div>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
                    <div className="flex items-center gap-2">
                         <input type="checkbox" onChange={handleSelectAll} checked={selectedPrompts.size === prompts.length && prompts.length > 0} />
                         <Button size="sm" variant="danger" onClick={() => deletePrompts(selectedPrompts)}>Xóa tất cả Prompt ({selectedPrompts.size})</Button>
                         <label className="flex items-center text-sm"><input type="checkbox" className="mr-1"/> Hiển thị Prompt Lỗi</label>
                    </div>
                     <div className="text-sm font-semibold">
                         <span>Tổng: <span className="text-blue-500">{prompts.length}</span></span>
                         <span className="ml-2">Đang chờ: <span className="text-yellow-500">{summary.waiting + summary.running}</span></span>
                         <span className="ml-2">Hoàn thành: <span className="text-green-500">{summary.completed}</span></span>
                         <span className="ml-2">Thất bại: <span className="text-red-500">{summary.failed}</span></span>
                     </div>
                </div>
                
                {prompts.map((p, index) => (
                    <Card key={p.id} className="relative flex flex-col">
                        <div className="flex items-start gap-4 flex-grow">
                            <input type="checkbox" checked={selectedPrompts.has(p.id)} onChange={e => handleSelect(p.id, e.target.checked)} className="mt-1"/>
                            <div className="flex-1">
                                <label className="font-semibold">Prompt #{index + 1}</label>
                                <Textarea className="mt-1 min-h-[80px]" value={p.prompt} onChange={e => updatePrompt(p.id, {prompt: e.target.value})} />
                            </div>
                            <div className="w-48 h-28 bg-dark-bg rounded-md flex items-center justify-center">
                                {p.status === 'running' && <Loader />}
                                {p.status === 'completed' && p.resultUrl && <video src={p.resultUrl} controls className="w-full h-full object-cover rounded-md" />}
                                {p.status === 'error' && <div className="text-center p-2"><XMarkIcon className="w-8 h-8 text-red-500 mx-auto" /><p className="text-xs text-red-400 mt-1">Lỗi Render</p></div>}
                                {p.status === 'pending' && <div className="text-center"><FilmIcon className="w-8 h-8 text-gray-500 mx-auto" /><p className="text-xs text-gray-400 mt-1">Sẵn sàng</p></div>}
                            </div>
                        </div>
                         <div className="mt-3 pt-3 border-t border-light-border dark:border-dark-border">
                            <span 
                                className={`text-sm font-semibold ${statusConfig[p.status].color}`}
                                title={p.status === 'error' ? `Lỗi: ${p.error}` : statusConfig[p.status].tooltip}
                            >
                                Trạng thái: {statusConfig[p.status].text}
                            </span>
                        </div>
                    </Card>
                ))}

                <Button onClick={addPrompt} variant="outline" className="w-full">+ Thêm Prompt mới</Button>
                 {!hasApiKey && (
                    <div className="p-3 text-center bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-400 dark:border-yellow-600 rounded-lg">
                        <p className="font-semibold text-yellow-800 dark:text-yellow-200">Cần có API Key để tạo video Veo.</p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">Việc tạo video sẽ tốn phí. Xem <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline">chi tiết</a>.</p>
                        <Button onClick={handleSelectKey} className="mt-2" size="sm">Chọn API Key</Button>
                    </div>
                )}
                 {globalError && <p className="text-red-500 text-center font-semibold">{globalError}</p>}
            </div>

        </div>
    );
};

export default VideoGenerator;
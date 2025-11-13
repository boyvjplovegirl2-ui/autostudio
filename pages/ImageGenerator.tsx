import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { generateImage } from '../services/geminiService';
import { GeneratedItem, Story, ImagePrompt, ImagePromptStatus, AspectRatio } from '../types';
import { TrashIcon, Squares2X2Icon, Bars3Icon, PhotoIcon, EyeIcon } from '../components/icons/Icons';

interface ImageGeneratorProps {
    stories: Story[];
    addGeneratedItem: (item: GeneratedItem) => void;
}

const statusConfig: Record<ImagePromptStatus, { text: string; color: string; tooltip: string; }> = {
    ready: { text: 'Sẵn sàng', color: 'text-gray-500', tooltip: 'Prompt đã sẵn sàng để chạy.' },
    running: { text: 'Đang chạy...', color: 'text-blue-500', tooltip: 'AI đang tạo ảnh, vui lòng chờ.' },
    done: { text: 'Hoàn thành', color: 'text-green-500', tooltip: 'Ảnh đã được tạo thành công.' },
    error: { text: 'Lỗi', color: 'text-red-500', tooltip: 'Đã xảy ra lỗi trong quá trình tạo ảnh.' },
    cancelled: { text: 'Đã hủy', color: 'text-yellow-500', tooltip: 'Quá trình tạo ảnh đã bị hủy.' },
};

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ stories, addGeneratedItem }) => {
    const [prompts, setPrompts] = useState<ImagePrompt[]>([]);
    
    // Global settings
    const [globalAspectRatio, setGlobalAspectRatio] = useState<AspectRatio>('16:9');
    const [globalSeed, setGlobalSeed] = useState(() => Math.floor(Math.random() * 1000000).toString());
    const [globalQuantity, setGlobalQuantity] = useState(1); // Set to 1 as model generates one image
    const [useInputImage, setUseInputImage] = useState(false);
    const [autoSave, setAutoSave] = useState(false);

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(new Set());

    const addManualPrompt = () => {
        const newPrompt: ImagePrompt = {
            id: `prompt-${Date.now()}`,
            prompt: '',
            useInputImage,
            aspectRatio: globalAspectRatio,
            seed: globalSeed,
            quantity: globalQuantity,
            status: 'ready',
        };
        setPrompts(prev => [...prev, newPrompt]);
    };

    const handleMockData = () => {
        const mockPrompts: ImagePrompt[] = [
            { id: 'mock-1', prompt: 'A hyper-realistic cat wearing a tiny wizard hat, studio lighting', useInputImage: false, aspectRatio: '1:1', seed: '12345', quantity: 1, status: 'done', resultUrl: 'https://picsum.photos/seed/cat-wizard/512' },
            { id: 'mock-2', prompt: 'An epic fantasy landscape with floating islands and waterfalls, anime style', useInputImage: false, aspectRatio: '16:9', seed: '67890', quantity: 1, status: 'done', resultUrl: 'https://picsum.photos/seed/fantasy-world/512' },
            { id: 'mock-3', prompt: 'A sleek cyberpunk city at night, Blade Runner aesthetic, rain-slicked streets', useInputImage: false, aspectRatio: '16:9', seed: '13579', quantity: 1, status: 'ready' },
        ];
        setPrompts(mockPrompts);
    };

    const updatePrompt = (id: string, newValues: Partial<ImagePrompt>) => {
        setPrompts(prev => prev.map(p => p.id === id ? { ...p, ...newValues } : p));
    };

    const runPrompts = async (promptIds: string[]) => {
        for (const id of promptIds) {
            const promptToRun = prompts.find(p => p.id === id);
            if (promptToRun && promptToRun.prompt.trim()) {
                updatePrompt(id, { status: 'running', error: undefined });
                try {
                    // Nano Banana doesn't use seed or quantity directly
                    const resultUrl = await generateImage(`${promptToRun.prompt}, aspect ratio ${promptToRun.aspectRatio}`);
                    updatePrompt(id, { status: 'done', resultUrl });
                    if(autoSave) {
                        addGeneratedItem({
                            id: new Date().toISOString(),
                            type: 'image',
                            prompt: promptToRun.prompt,
                            content: resultUrl,
                            createdAt: new Date(),
                        });
                    }
                } catch (error) {
                    console.error("Image generation failed:", error);
                    updatePrompt(id, { status: 'error', error: (error as Error).message });
                }
            }
        }
    };
    
    const handleRunSelected = () => {
        runPrompts(Array.from(selectedPrompts));
    };
    
    const handleRunAll = () => {
        runPrompts(prompts.map(p => p.id));
    };

    const deletePrompts = (promptIds: string[]) => {
        setPrompts(prev => prev.filter(p => !promptIds.includes(p.id)));
        setSelectedPrompts(prev => {
            const newSet = new Set(prev);
            promptIds.forEach(id => newSet.delete(id));
            return newSet;
        });
    };
    
    const handleSelect = (id: string, isChecked: boolean) => {
        setSelectedPrompts(prev => {
            const newSet = new Set(prev);
            if (isChecked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedPrompts(new Set(prompts.map(p => p.id)));
        } else {
            setSelectedPrompts(new Set());
        }
    };

    const summary = prompts.reduce((acc, p) => {
        acc[p.status]++;
        return acc;
    }, { ready: 0, running: 0, done: 0, error: 0, cancelled: 0 });

    return (
        <div className="space-y-6">
            <Card>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                    <Select label="Tải Prompt" options={[{value: 'story', label: 'Từ Câu Chuyện'}]} />
                    <Button variant='outline'>Thêm Prompt từ Txt</Button>
                    <div className="flex items-center">
                        <input type="checkbox" id="use-input-image" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-2" checked={useInputImage} onChange={e => setUseInputImage(e.target.checked)} />
                        <label htmlFor="use-input-image" className="text-sm font-medium">Dùng ảnh input</label>
                    </div>
                    <Select label="Tỷ lệ (Chung)" value={globalAspectRatio} onChange={e => setGlobalAspectRatio(e.target.value as AspectRatio)} options={[{value: '16:9', label: '16:9 Ngang'}, {value: '9:16', label: '9:16 Dọc'}, {value: '1:1', label: '1:1 Vuông'}, {value: '4:3', label: '4:3'}, {value: '3:4', label: '3:4'}]} />
                    <Input label="Seed (Chung)" value={globalSeed} onChange={e => setGlobalSeed(e.target.value)} />
                    <Input label="Số lượng" type="number" min="1" max="1" value={globalQuantity} onChange={e => setGlobalQuantity(Number(e.target.value))} disabled title="Model hiện tại chỉ hỗ trợ 1 ảnh mỗi lần tạo." />
                </div>
                 <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-center mt-4">
                    <div className="flex items-center">
                        <input type="checkbox" id="auto-save" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-2" checked={autoSave} onChange={e => setAutoSave(e.target.checked)} />
                        <label htmlFor="auto-save" className="text-sm font-medium">Tự động lưu</label>
                    </div>
                     <Input type="text" value="Chưa chọn..." disabled className="bg-gray-200 dark:bg-dark-bg" />
                     <Button variant="outline" className="h-10">Folder</Button>
                    <Button onClick={handleMockData} variant='outline' size="lg" className="w-full h-10">Tạo Mock</Button>
                    <Button onClick={handleRunAll} size="lg" className="w-full bg-gray-600 hover:bg-gray-700 h-10">Chạy Tất Cả ({prompts.length})</Button>
                </div>
            </Card>

            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" onChange={handleSelectAll} checked={selectedPrompts.size === prompts.length && prompts.length > 0} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label className="text-sm font-medium">Tất cả</label>
                        <Button size="sm" onClick={handleRunSelected} disabled={selectedPrompts.size === 0}>Chạy ({selectedPrompts.size})</Button>
                        <Button size="sm" variant="danger" onClick={() => deletePrompts(Array.from(selectedPrompts))} disabled={selectedPrompts.size === 0}>Xóa ({selectedPrompts.size})</Button>
                        <Button size="sm" variant="outline" onClick={addManualPrompt}>+ Thêm Prompt thủ công</Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span>Tổng: <strong className="text-blue-500">{prompts.length}</strong></span>
                        <span>Chạy: <strong className="text-blue-500">{summary.running}</strong></span>
                        <span>Xong: <strong className="text-green-500">{summary.done}</strong></span>
                        <span>Lỗi: <strong className="text-red-500">{summary.error}</strong></span>
                        <span>Hủy: <strong className="text-yellow-500">{summary.cancelled}</strong></span>
                        <div className="flex items-center border border-light-border dark:border-dark-border rounded-md">
                            <button onClick={() => setViewMode('list')} className={`p-1.5 ${viewMode === 'list' ? 'bg-primary text-white' : ''}`}><Bars3Icon className="w-5 h-5"/></button>
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 ${viewMode === 'grid' ? 'bg-primary text-white' : ''}`}><Squares2X2Icon className="w-5 h-5"/></button>
                        </div>
                    </div>
                </div>

                {prompts.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Chưa có prompt nào. Hãy thêm một prompt để bắt đầu.</p>
                ) : (
                    <div className={`grid gap-4 ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                        {prompts.map(p => (
                             <Card key={p.id} className="flex flex-col p-3">
                                <div className="flex items-start gap-2 mb-2">
                                     <input type="checkbox" checked={selectedPrompts.has(p.id)} onChange={(e) => handleSelect(p.id, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"/>
                                    <Textarea value={p.prompt} onChange={e => updatePrompt(p.id, { prompt: e.target.value })} rows={3} className="text-xs flex-grow" />
                                </div>
                                 <div className="flex-grow aspect-square bg-dark-bg rounded-md flex items-center justify-center my-2 relative group">
                                     {p.status === 'running' && <Loader />}
                                     {p.status === 'done' && p.resultUrl && (
                                        <>
                                            <img src={p.resultUrl} className="w-full h-full object-cover rounded-md" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <a href={p.resultUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 text-white rounded-full hover:bg-white/40">
                                                    <EyeIcon className="w-6 h-6" />
                                                </a>
                                            </div>
                                        </>
                                     )}
                                     {p.status === 'error' && <p className="text-red-500 text-xs text-center p-2">{p.error}</p>}
                                     {(p.status === 'ready' || p.status === 'cancelled') && <PhotoIcon className="w-10 h-10 text-gray-500" />}
                                 </div>
                                <div className="text-xs mt-auto">
                                    <span 
                                      className={`font-semibold ${statusConfig[p.status].color}`}
                                      title={statusConfig[p.status].tooltip}
                                    >
                                      {statusConfig[p.status].text}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ImageGenerator;
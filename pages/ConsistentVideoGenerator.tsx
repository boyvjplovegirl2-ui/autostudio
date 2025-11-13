import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { GeneratedItem, Story, AspectRatio } from '../types';
import { PhotoIcon } from '../components/icons/Icons';

interface ConsistentVideoGeneratorProps {
    stories: Story[];
    addGeneratedItem: (item: GeneratedItem) => void;
}

const ConsistentVideoGenerator: React.FC<ConsistentVideoGeneratorProps> = ({ stories, addGeneratedItem }) => {
    const [useEndImage, setUseEndImage] = useState(false);
    const [prompts, setPrompts] = useState<string[]>(['']);
    const [mockImage, setMockImage] = useState<string | null>(null);
    
    // Settings
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [threads, setThreads] = useState(4);
    const [autoSave, setAutoSave] = useState(false);
    
    const addPromptField = () => {
        setPrompts(p => [...p, '']);
    };
    
    // Mock functionality
    const handleRun = () => {
        alert("Bắt đầu chạy tạo video đồng nhất (mocked)...");
    };

    const handleMockData = () => {
        setPrompts(["A character is walking through a neon-lit alleyway.", "The character looks up at a futuristic skyscraper."]);
        setMockImage('https://picsum.photos/seed/cvg/300/200');
        setUseEndImage(false);
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
                    <Select label="Tỷ lệ" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)} options={[{value: '16:9', label: '16:9 Ngang'}, {value: '9:16', label: '9:16 Dọc'}]} />
                    <Input label="Luồng (4-8)" type="number" min="4" max="8" value={threads} onChange={e => setThreads(Number(e.target.value))} />
                    <Select label="Thêm prompt từ Story" options={[{value: '', label: 'Chọn Story'}]} />
                    <Button variant="outline">Từ file TXT</Button>
                    <Button onClick={handleMockData} variant="outline">Tạo Mock</Button>
                    <Button onClick={handleRun} className="w-full bg-gray-600 hover:bg-gray-700">Chạy tất cả ({prompts.length})</Button>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 items-center mt-4">
                    <div className="flex items-center">
                        <input type="checkbox" id="use-end-image" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-2" checked={useEndImage} onChange={e => setUseEndImage(e.target.checked)} />
                        <label htmlFor="use-end-image" className="text-sm font-medium">Sử dụng ảnh cuối</label>
                    </div>
                     <div className="flex items-center">
                        <input type="checkbox" id="auto-save-cv" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-2" checked={autoSave} onChange={e => setAutoSave(e.target.checked)} />
                        <label htmlFor="auto-save-cv" className="text-sm font-medium">Tự động lưu</label>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                         <input type="checkbox" className="h-4 w-4" />
                         <Button size="sm" variant="danger">Xóa tất cả ({prompts.length})</Button>
                         <Button size="sm" variant="outline" onClick={addPromptField}>+ Thêm Prompt</Button>
                    </div>
                </div>
                <div className="space-y-4">
                    {prompts.map((p, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 border border-light-border dark:border-dark-border rounded-lg">
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium">Ảnh bắt đầu và kết thúc</label>
                                <div className="flex gap-2 mt-1">
                                    <div className="flex-1 aspect-video bg-light-bg dark:bg-dark-bg rounded-md flex items-center justify-center text-gray-400 cursor-pointer">
                                        {mockImage && index === 0 ? <img src={mockImage} className="w-full h-full object-cover rounded-md" /> : <PhotoIcon className="w-8 h-8" />}
                                    </div>
                                    {useEndImage && <div className="flex-1 aspect-video bg-light-bg dark:bg-dark-bg rounded-md flex items-center justify-center text-gray-400 cursor-pointer"><PhotoIcon className="w-8 h-8" /></div>}
                                </div>
                            </div>
                            <Input value={p} onChange={e => setPrompts(prompts.map((val, i) => i === index ? e.target.value : val))} placeholder={`Thêm prompt tại đây...`} />
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default ConsistentVideoGenerator;

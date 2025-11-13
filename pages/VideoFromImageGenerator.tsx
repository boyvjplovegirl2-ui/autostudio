import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { GeneratedItem, Story, AspectRatio } from '../types';
import { PhotoIcon, TrashIcon } from '../components/icons/Icons';
import { fileToBase64 } from '../utils/fileUtils';

interface VideoFromImageGeneratorProps {
    stories: Story[];
    addGeneratedItem: (item: GeneratedItem) => void;
}

const ImageSlot: React.FC<{ onFileSelect: (file: File) => void; onClear: () => void; file: File | null; previewUrl?: string; }> = ({ onFileSelect, file, onClear, previewUrl }) => {
    const [preview, setPreview] = useState<string | null>(previewUrl || null);

    React.useEffect(() => {
        if (previewUrl) {
            setPreview(previewUrl);
            return;
        }
        if (!file) {
            setPreview(null);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
    }, [file, previewUrl]);

    return (
        <div className="relative aspect-square border-2 border-dashed border-light-border dark:border-dark-border rounded-lg flex items-center justify-center">
            {preview ? (
                <>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                    <button onClick={onClear} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </>
            ) : (
                <label className="cursor-pointer text-center text-gray-500">
                    <PhotoIcon className="w-8 h-8 mx-auto" />
                    <span className="text-xs mt-1 block">+ Thêm ảnh</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && onFileSelect(e.target.files[0])} />
                </label>
            )}
        </div>
    );
};

const VideoFromImageGenerator: React.FC<VideoFromImageGeneratorProps> = ({ stories, addGeneratedItem }) => {
    const [images, setImages] = useState<(File | null)[]>(Array(6).fill(null));
    const [mockImageUrls, setMockImageUrls] = useState<string[]>([]);
    const [prompts, setPrompts] = useState<string[]>(['']);
    
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [threads, setThreads] = useState(4);
    const [autoSave, setAutoSave] = useState(false);

    const handleFileChange = (index: number, file: File) => {
        setMockImageUrls([]);
        setImages(prev => prev.map((f, i) => (i === index ? file : f)));
    };
    
    const handleClearImage = (index: number) => {
        setMockImageUrls(prev => prev.map((url, i) => i === index ? '' : url));
        setImages(prev => prev.map((f, i) => (i === index ? null : f)));
    };

    const addPromptField = () => {
        setPrompts(p => [...p, '']);
    };
    
    // Mock functionality
    const handleRun = () => {
        alert("Bắt đầu chạy tạo video từ ảnh (mocked)...");
    };

    const handleMockData = () => {
        setPrompts([
            "A fast-paced zoom-in on the first image.",
            "A slow pan from the first image to the second.",
            "A transition where the second image morphs into the third."
        ]);
        setMockImageUrls([
            'https://picsum.photos/seed/vfi1/300',
            'https://picsum.photos/seed/vfi2/300',
            'https://picsum.photos/seed/vfi3/300'
        ]);
        setImages(Array(6).fill(null));
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold mb-2">Chế độ ảnh</h3>
                        <div className="flex gap-2 mb-4">
                            <Button>Dùng chung</Button>
                            <Button variant="outline">Dùng riêng</Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {Array(6).fill(null).map((_, index) => (
                                <ImageSlot key={index} file={images[index]} previewUrl={mockImageUrls[index]} onFileSelect={(f) => handleFileChange(index, f)} onClear={() => handleClearImage(index)} />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                         <h3 className="font-semibold mb-2">Cài đặt</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <Select label="Tỷ lệ" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)} options={[{value: '16:9', label: '16:9 Ngang'}, {value: '9:16', label: '9:16 Dọc'}]} />
                            <Input label="Luồng (4-8)" type="number" min="4" max="8" value={threads} onChange={e => setThreads(Number(e.target.value))} />
                         </div>
                         <Select label="Tải prompt từ Story" options={[{value: '', label: '-- Chọn Story --'}]} />
                         <Button variant="outline" className="w-full">Nhập từ TXT</Button>
                         <div className="flex items-center">
                            <input type="checkbox" id="auto-save-vfi" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-2" checked={autoSave} onChange={e => setAutoSave(e.target.checked)} />
                            <label htmlFor="auto-save-vfi" className="text-sm font-medium">Tự động lưu</label>
                        </div>
                         <Button onClick={handleMockData} variant="outline" size="lg" className="w-full">Tạo Mock</Button>
                         <Button onClick={handleRun} size="lg" className="w-full bg-gray-600 hover:bg-gray-700">Chạy tất cả</Button>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Prompts</h3>
                    <div>
                        <span className="text-sm mr-4">Sẵn sàng: <strong>{prompts.length}</strong></span>
                        <Button size="sm" variant="danger">Xóa tất cả</Button>
                    </div>
                </div>
                <div className="space-y-2">
                    {prompts.map((p, index) => (
                        <Input key={index} value={p} onChange={e => setPrompts(prompts.map((val, i) => i === index ? e.target.value : val))} placeholder={`Thêm prompt tại đây...`} />
                    ))}
                </div>
                <Button onClick={addPromptField} variant="outline" className="w-full mt-4">+ Thêm Prompt</Button>
            </Card>
        </div>
    );
};

export default VideoFromImageGenerator;

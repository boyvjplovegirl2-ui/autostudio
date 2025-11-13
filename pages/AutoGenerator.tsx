import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { Cog8ToothIcon, XMarkIcon } from '../components/icons/Icons';

interface Idea {
    id: string;
    text: string;
    status: 'Sẵn sàng' | 'Đang chạy' | 'Hoàn thành' | 'Lỗi';
}

const statusTooltips: Record<Idea['status'], string> = {
    'Sẵn sàng': 'Ý tưởng đã sẵn sàng để bắt đầu quy trình tạo tự động.',
    'Đang chạy': 'AI đang thực hiện quy trình: tạo story -> tạo prompt -> tạo video.',
    'Hoàn thành': 'Tất cả các bước đã hoàn thành. Video cuối cùng đã sẵn sàng.',
    'Lỗi': 'Đã xảy ra lỗi ở một trong các bước của quy trình.',
};

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-2xl relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold mb-6 text-center">Cài đặt quy trình tự động</h2>

                <div className="space-y-6">
                    {/* Story Settings */}
                    <div className="border-b border-light-border dark:border-dark-border pb-4">
                        <h3 className="font-semibold text-lg mb-3">1. Cài đặt Câu chuyện</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select label="Phong cách" options={[{value: 'story', label: 'Kể chuyện'}]} />
                            <Select label="Độ dài (ước tính)" options={[{value: '1000', label: '1000 từ (~1.5 phút)'}]} />
                        </div>
                    </div>

                    {/* Prompt Settings */}
                    <div className="border-b border-light-border dark:border-dark-border pb-4">
                        <h3 className="font-semibold text-lg mb-3">2. Cài đặt Prompt Video</h3>
                        <div className="mb-4">
                             <label className="block text-sm font-medium mb-1">Style (chọn nhiều)</label>
                             <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="primary">Siêu thực</Button>
                                <Button size="sm" variant="outline">Phim</Button>
                                <Button size="sm" variant="outline">Hoạt hình Disney</Button>
                                <Button size="sm" variant="outline">Anime</Button>
                                <Button size="sm" variant="outline">Truyện tranh</Button>
                             </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Select label="Thể loại" options={[{value: 'funny', label: 'Hài hước/Vui nhộn'}]} />
                             <Select label="Loại Prompt" options={[{value: 'detailed', label: 'Chi tiết (8 giây / prompt)'}]} />
                        </div>
                    </div>
                    
                    {/* Video Settings */}
                    <div>
                        <h3 className="font-semibold text-lg mb-3">3. Cài đặt Tạo Video</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select label="Model" options={[{value: 'veo3.1', label: 'Veo 3.1 (Ổn định)'}]} />
                            <Select label="Tỷ lệ" options={[{value: '16:9', label: '16:9 Ngang'}]} />
                            <Select label="Số luồng (4-8)" options={[{value: '4', label: '4'}]} />
                        </div>
                        <div className="flex items-center mt-4">
                             <input type="checkbox" id="auto-save-auto" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-2" />
                             <label htmlFor="auto-save-auto" className="text-sm font-medium">Tự động lưu</label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button onClick={onClose}>Đóng</Button>
                </div>
            </Card>
        </div>
    );
};


const AutoGenerator: React.FC = () => {
    const [ideas, setIdeas] = useState<Idea[]>([{ id: `idea-1`, text: '', status: 'Sẵn sàng' }]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const addIdea = () => {
        const newIdea: Idea = {
            id: `idea-${Date.now()}`,
            text: '',
            status: 'Sẵn sàng'
        };
        setIdeas(prev => [...prev, newIdea]);
    };
    
    const updateIdeaText = (id: string, text: string) => {
        setIdeas(prev => prev.map(idea => idea.id === id ? { ...idea, text } : idea));
    };

    const removeIdea = (id: string) => {
        setIdeas(prev => prev.filter(idea => idea.id !== id));
    };
    
    // Mock functionality
    const handleRunAll = () => {
        alert("Bắt đầu chạy tất cả ý tưởng (mocked)...");
    };

    return (
        <div className="space-y-6">
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Tạo Tự Động</h2>
                    <p className="text-gray-500">Nhập một hoặc nhiều ý tưởng, cấu hình và để AI lo phần còn lại.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsSettingsOpen(true)}>
                        <Cog8ToothIcon className="w-5 h-5 mr-2" />
                        Cài đặt
                    </Button>
                    <Button onClick={handleRunAll}>
                        Chạy tất cả ý tưởng
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {ideas.map((idea, index) => (
                    <Card key={idea.id}>
                        <div className="flex items-start gap-4">
                            <span className="font-bold text-lg text-gray-400">#{index + 1}</span>
                            <div className="flex-1">
                                <Textarea 
                                    value={idea.text}
                                    onChange={e => updateIdeaText(idea.id, e.target.value)}
                                    placeholder="Một con mèo và một con chó trở thành bạn thân và cùng nhau phiêu lưu..."
                                    rows={3}
                                />
                            </div>
                            <div className="text-right">
                                <p 
                                  className="text-sm font-semibold"
                                  title={statusTooltips[idea.status]}
                                >
                                  {idea.status}
                                </p>
                                <button onClick={() => removeIdea(idea.id)} className="text-xs text-red-500 hover:underline">Xóa ý tưởng</button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Button onClick={addIdea} variant="outline" className="w-full">
                + Thêm ý tưởng
            </Button>
        </div>
    );
};

export default AutoGenerator;
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Input from '../components/ui/Input';
import { generatePromptsFromStory } from '../services/geminiService';
import { Story, GeneratedItem } from '../types';
import { SparklesIcon, QueueListIcon } from '../components/icons/Icons';
import Loader from '../components/ui/Loader';

interface PromptGeneratorProps {
  selectedStory: Story | null;
  stories: Story[];
  addGeneratedItem: (item: GeneratedItem) => void;
  generatedItems: GeneratedItem[];
}

// Data for UI options
const stylesAndGenres = {
    'Phong cách': ['Siêu thực', 'Phim', 'Hoạt hình Disney', 'Anime', 'Pixar', 'Truyện tranh', 'Noir', 'Cyberpunk', 'Màu nước', 'Low-poly 3D', 'Hoạt hình Cartoon 2D', 'Hoạt hình Cartoon 3D', 'Pixel Art', 'Isometric', 'Paper Cutout', 'Claymation', 'Doodle Video'],
    'Thể loại': ['Hành động/Chiến đấu', 'Tình cảm/Lãng mạn', 'Hài hước/Vui nhộn', 'Kinh dị/Horror', 'Bí ẩn/Trinh thám', 'Fantasy/Thần thoại', 'Khoa học viễn tưởng', 'Drama/Chính kịch', 'Phiêu lưu/Thám hiểm', 'Đời thường/Slice of Life', 'Trailer phim']
};
const cameraSettings = {
    'Ống kính': ['Ống kính góc rộng', 'Ống kính tele', 'Ống kính macro', 'Ống kính mắt cá', 'Ống kính anamorphic', 'Góc nhìn thứ nhất (FPV)', 'Drone shot'],
    'Góc máy & Chuyển động': ['Cận cảnh (Close-up)', 'Trung cảnh (Medium shot)', 'Toàn cảnh (Wide shot)', 'Góc thấp (Low angle)', 'Ngang tầm mắt (Eye level)', 'Góc cao (High angle)', 'Dolly in chậm', 'Tĩnh (Static)', 'Lia máy nhẹ nhàng (Slow pan)', 'Theo dõi nhân vật (Tracking shot)'],
    'Ánh sáng': ['Ánh sáng tự nhiên', 'Ánh sáng 3 điểm', 'High-key', 'Low-key', 'Rembrandt', 'Giờ vàng (Golden hour)', 'Neon', 'Ánh sáng ma mị (Eerie)']
};

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ selectedStory, stories, addGeneratedItem, generatedItems }) => {
    const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
    
    // Input state
    const [selectedStoryId, setSelectedStoryId] = useState(selectedStory?.id || '');
    
    // AI Behavior Settings
    const [characterConsistency, setCharacterConsistency] = useState(true);
    const [seamlessScenes, setSeamlessScenes] = useState(true);

    // Style Settings
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    
    // General Settings
    const [promptSpeed, setPromptSpeed] = useState('Nhanh (Khuyến dùng)');
    const [videoLength, setVideoLength] = useState('1 phút (~8 prompts)');
    const [voiceLanguage, setVoiceLanguage] = useState('Tiếng Việt');

    // Camera Settings
    const [selectedLens, setSelectedLens] = useState<string[]>([]);
    const [selectedAngles, setSelectedAngles] = useState<string[]>([]);
    const [selectedLighting, setSelectedLighting] = useState<string[]>([]);
    const [useJson, setUseJson] = useState(false);

    // Output state
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPrompts, setGeneratedPrompts] = useState('');

    const promptHistory = useMemo(() => generatedItems.filter(item => item.type === 'prompt').reverse(), [generatedItems]);
    const storyOptions = stories.length > 0 ? [{ value: '', label: '-- Chọn một câu chuyện --' }, ...stories.map(s => ({ value: s.id, label: s.title }))] : [{ value: '', label: 'Chưa có câu chuyện nào' }];

    useEffect(() => {
      if (selectedStory) {
        setSelectedStoryId(selectedStory.id);
      }
    }, [selectedStory]);

    const handleToggleOption = (setter: React.Dispatch<React.SetStateAction<string[]>>, option: string) => {
        setter(prev => prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = stories.find(s => s.id === selectedStoryId)?.content;
        if (!content) return;

        setIsLoading(true);
        setGeneratedPrompts('');
        
        const settings = {
            characterConsistency, seamlessScenes, selectedStyles, selectedGenres,
            promptSpeed, videoLength, voiceLanguage, selectedLens,
            selectedAngles, selectedLighting, useJson,
        };

        try {
            const prompts = await generatePromptsFromStory(content, settings);
            setGeneratedPrompts(prompts);
            addGeneratedItem({
                id: new Date().toISOString(),
                type: 'prompt',
                prompt: `Prompts for story: ${stories.find(s => s.id === selectedStoryId)?.title}`,
                content: prompts,
                createdAt: new Date(),
            });
        } catch (error) {
            console.error("Failed to generate prompts", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderCreateTab = () => (
         <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                     <h3 className="text-xl font-bold mb-4">Câu chuyện Nguồn</h3>
                     <Select
                        options={storyOptions}
                        value={selectedStoryId}
                        onChange={e => setSelectedStoryId(e.target.value)}
                        disabled={stories.length === 0}
                    />
                    <Textarea
                        value={stories.find(s => s.id === selectedStoryId)?.content || ''}
                        readOnly
                        rows={10}
                        className="mt-2 bg-gray-100 dark:bg-dark-bg"
                        placeholder="Nội dung câu chuyện sẽ hiện ở đây khi bạn chọn..."
                    />
                </Card>
                 <Card>
                    <h3 className="text-xl font-bold mb-4">Kết quả Prompt</h3>
                     {isLoading ? <Loader message="AI đang tạo prompt video..." /> : <Textarea value={generatedPrompts} readOnly rows={15} placeholder="Các prompt video sẽ được tạo ở đây..." />}
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                 <Card>
                    <h3 className="font-semibold mb-3">Hành vi AI</h3>
                    <div className="space-y-2">
                        <label className="flex items-center"><input type="checkbox" className="h-4 w-4 rounded mr-2" checked={characterConsistency} onChange={e => setCharacterConsistency(e.target.checked)} /> Giữ sự nhất quán của nhân vật</label>
                        <label className="flex items-center"><input type="checkbox" className="h-4 w-4 rounded mr-2" checked={seamlessScenes} onChange={e => setSeamlessScenes(e.target.checked)} /> Liên kết các cảnh liền mạch</label>
                    </div>
                </Card>
                <Card>
                     <h3 className="font-semibold mb-3">Phong cách & Thể loại</h3>
                     {Object.entries(stylesAndGenres).map(([category, options]) => (
                         <div key={category} className="mb-3">
                             <h4 className="font-medium text-sm mb-1">{category}</h4>
                             <div className="flex flex-wrap gap-1.5">
                                 {/* FIX: Pass the state setter setSelectedGenres instead of the state value selectedGenres. */}
                                 {options.map(opt => <Button key={opt} size="sm" type="button" variant={ (category === 'Phong cách' ? selectedStyles : selectedGenres).includes(opt) ? 'primary' : 'outline'} onClick={() => handleToggleOption(category === 'Phong cách' ? setSelectedStyles : setSelectedGenres, opt)}>{opt}</Button>)}
                             </div>
                         </div>
                     ))}
                </Card>
                <Card>
                     <h3 className="font-semibold mb-3">Cài đặt Camera</h3>
                     {Object.entries(cameraSettings).map(([category, options]) => (
                         <div key={category} className="mb-3">
                             <h4 className="font-medium text-sm mb-1">{category}</h4>
                             <div className="flex flex-wrap gap-1.5">
                                 {/* FIX: Pass state setters (setSelectedLens, setSelectedAngles, setSelectedLighting) instead of state values. */}
                                 {options.map(opt => <Button key={opt} size="sm" type="button" variant={(category === 'Ống kính' ? selectedLens : category === 'Góc máy & Chuyển động' ? selectedAngles : selectedLighting).includes(opt) ? 'primary' : 'outline'} onClick={() => handleToggleOption(category === 'Ống kính' ? setSelectedLens : category === 'Góc máy & Chuyển động' ? setSelectedAngles : setSelectedLighting, opt)}>{opt}</Button>)}
                             </div>
                         </div>
                     ))}
                </Card>
                 <Card>
                    <h3 className="font-semibold mb-3">Cài đặt Chung</h3>
                    <div className="space-y-4">
                        <Select label="Tốc độ Prompt" options={[{value: 'Nhanh (Khuyến dùng)', label: 'Nhanh (Khuyến dùng)'}, {value: 'Chi tiết (8s/prompt)', label: 'Chi tiết (8s/prompt)'}]} value={promptSpeed} onChange={e => setPromptSpeed(e.target.value)} />
                        <Select label="Thời lượng Video" options={[{value: '1 phút (~8 prompts)', label: '1 phút (~8 prompts)'}, {value: '2 phút (~15 prompts)', label: '2 phút (~15 prompts)'}]} value={videoLength} onChange={e => setVideoLength(e.target.value)} />
                        <Select label="Ngôn ngữ Prompt" options={[{value: 'Tiếng Việt', label: 'Tiếng Việt'}, {value: 'Tiếng Anh', label: 'Tiếng Anh'}]} value={voiceLanguage} onChange={e => setVoiceLanguage(e.target.value)} />
                        <label className="flex items-center"><input type="checkbox" className="h-4 w-4 rounded mr-2" checked={useJson} onChange={e => setUseJson(e.target.checked)} /> Xuất ra định dạng JSON</label>
                    </div>
                </Card>
                <Button type="submit" size="lg" className="w-full" isLoading={isLoading} disabled={!selectedStoryId || isLoading}>Tạo Prompts</Button>
            </div>
        </form>
    );
    
    const renderHistoryTab = () => (
         <div className="space-y-4">
            {promptHistory.length > 0 ? promptHistory.map(item => (
                <Card key={item.id}>
                    <p className="font-semibold truncate">{item.prompt}</p>
                    <p className="text-xs text-gray-500 mb-2">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                    <Textarea value={item.content} readOnly rows={5} />
                </Card>
            )) : <Card><p className="text-center text-gray-500 py-8">Lịch sử trống.</p></Card>}
        </div>
    );

    return (
        <div className="space-y-6">
             <div className="flex border-b border-light-border dark:border-dark-border tab-button-container">
                <button onClick={() => setActiveTab('create')} className={`px-4 font-semibold flex items-center gap-2 ${activeTab === 'create' ? 'active-tab' : 'text-gray-500'}`}>
                    <SparklesIcon className="w-5 h-5" />
                    <span>Tạo mới</span>
                </button>
                <button onClick={() => setActiveTab('history')} className={`px-4 font-semibold flex items-center gap-2 ${activeTab === 'history' ? 'active-tab' : 'text-gray-500'}`}>
                    <QueueListIcon className="w-5 h-5" />
                    <span>Lịch sử</span>
                </button>
            </div>
            {activeTab === 'create' ? renderCreateTab() : renderHistoryTab()}
        </div>
    );
};

export default PromptGenerator;
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { GeneratedItem } from '../types';
import { FilmIcon, XMarkIcon } from '../components/icons/Icons';

interface VideoMergerProps {
  generatedItems: GeneratedItem[];
}

interface VideoToMerge {
  id: string;
  name: string;
  url: string;
  source: 'local' | 'history';
}

const VideoMerger: React.FC<VideoMergerProps> = ({ generatedItems }) => {
    const [activeTab, setActiveTab] = useState<'local' | 'history'>('local');
    const [mergeList, setMergeList] = useState<VideoToMerge[]>([]);
    const [mergeMode, setMergeMode] = useState<'all' | 'group'>('all');

    const videoHistory = generatedItems.filter(item => item.type === 'video' || item.type === 'short-highlight');

    const addToMergeList = (video: VideoToMerge) => {
        if (!mergeList.some(v => v.id === video.id)) {
            setMergeList(prev => [...prev, video]);
        }
    };
    
    const removeFromMergeList = (id: string) => {
        setMergeList(prev => prev.filter(v => v.id !== id));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(file => {
                const newVideo: VideoToMerge = {
                    id: `local-${file.name}-${Date.now()}`,
                    name: file.name,
                    url: URL.createObjectURL(file),
                    source: 'local',
                };
                addToMergeList(newVideo);
            });
        }
    };

    const handleMockData = () => {
        const mockVideos: VideoToMerge[] = videoHistory.slice(0, 3).map(v => ({
            id: v.id,
            name: v.prompt,
            url: v.content,
            source: 'history'
        }));
        setMergeList(mockVideos);
    };

    const handleMerge = () => {
        if (mergeList.length < 2) {
            alert("Cần ít nhất 2 video để ghép.");
            return;
        }
        alert(`Bắt đầu ghép ${mergeList.length} video (mocked)...`);
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Button onClick={handleMockData} variant="outline">Tạo Mock</Button>
                    </div>
                     <div className="flex items-center gap-4">
                        <span className="font-semibold">Chế độ ghép:</span>
                        <label className="flex items-center"><input type="radio" name="merge-mode" checked={mergeMode === 'all'} onChange={() => setMergeMode('all')} className="mr-1" /> Ghép tất cả</label>
                        <label className="flex items-center"><input type="radio" name="merge-mode" checked={mergeMode === 'group'} onChange={() => setMergeMode('group')} className="mr-1" /> Ghép theo nhóm</label>
                    </div>
                    <Button onClick={handleMerge} className="bg-gray-600 hover:bg-gray-700">Ghép {mergeList.length} video</Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                     <div className="flex border-b border-light-border dark:border-dark-border mb-4">
                        <button onClick={() => setActiveTab('local')} className={`px-4 py-2 font-semibold ${activeTab === 'local' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Thêm từ máy tính</button>
                        <button onClick={() => setActiveTab('history')} className={`px-4 py-2 font-semibold ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Thêm từ Lịch sử</button>
                    </div>
                    {activeTab === 'local' && (
                        <div className="p-4 border-2 border-dashed border-light-border dark:border-dark-border rounded-lg text-center">
                            <label className="cursor-pointer">
                                <span className="font-semibold text-primary">+ Thêm Video từ máy tính...</span>
                                <input type="file" multiple accept="video/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                    )}
                     {activeTab === 'history' && (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {videoHistory.length > 0 ? videoHistory.map(v => (
                                <div key={v.id} className="flex items-center gap-2 p-2 border border-light-border dark:border-dark-border rounded-md">
                                    <video src={v.content} className="w-16 h-9 object-cover rounded bg-dark-bg"></video>
                                    <p className="text-xs font-medium flex-1 truncate">{v.prompt}</p>
                                    <Button size="sm" variant="outline" onClick={() => addToMergeList({id: v.id, name: v.prompt, url: v.content, source: 'history'})}>Thêm</Button>
                                </div>
                            )) : <p className="text-center text-gray-500 py-8">Lịch sử video trống.</p>}
                        </div>
                    )}
                </Card>
                 <Card>
                     <h3 className="font-semibold text-lg mb-4">Danh sách sẽ ghép ({mergeList.length} video)</h3>
                     <div className="space-y-2 max-h-96 overflow-y-auto">
                        {mergeList.length > 0 ? mergeList.map(v => (
                             <div key={v.id} className="flex items-center gap-2 p-2 bg-light-bg dark:bg-dark-bg rounded-md">
                                <FilmIcon className="w-5 h-5 text-primary" />
                                <p className="text-sm font-medium flex-1 truncate">{v.name}</p>
                                <button onClick={() => removeFromMergeList(v.id)} className="p-1 hover:text-red-500"><XMarkIcon className="w-4 h-4" /></button>
                            </div>
                        )) : <p className="text-center text-gray-500 py-8">Chưa chọn video nào.</p>}
                     </div>
                 </Card>
            </div>
        </div>
    );
};

export default VideoMerger;

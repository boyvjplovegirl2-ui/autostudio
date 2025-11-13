import React, { useEffect, useRef, useState } from 'react';
import { XMarkIcon } from './icons/Icons';

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
}

const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({ isOpen, onClose, videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(true);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.loop = isLooping;
    }
  }, [isLooping, isOpen]);

  if (!isOpen || !videoUrl) return null;

  const playbackRates = [0.5, 1, 1.5, 2];

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="bg-dark-card rounded-lg shadow-xl w-full max-w-4xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 text-white bg-dark-card rounded-full p-1.5 z-20 hover:bg-primary transition-colors"
          aria-label="Close preview"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <div className="aspect-video">
            <video ref={videoRef} src={videoUrl} controls={false} autoPlay loop={isLooping} className="w-full h-full rounded-t-lg bg-black" />
        </div>
        <div className="p-2 flex items-center justify-between bg-dark-bg rounded-b-lg">
            <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-gray-400">Tốc độ:</span>
                {playbackRates.map(rate => (
                    <button 
                        key={rate}
                        onClick={() => setPlaybackRate(rate)}
                        className={`px-2.5 py-1 text-xs rounded transition-colors ${playbackRate === rate ? 'bg-primary text-white' : 'bg-dark-border text-gray-300 hover:bg-gray-600'}`}
                    >{rate}x</button>
                ))}
            </div>
            <button 
                onClick={() => setIsLooping(!isLooping)}
                className={`px-3 py-1 text-xs rounded flex items-center transition-colors ${isLooping ? 'bg-primary text-white' : 'bg-dark-border text-gray-300 hover:bg-gray-600'}`}
            >
                {isLooping ? '✓ Lặp lại' : 'Lặp lại'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPreviewModal;

import React, { useState } from 'react';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import Loader from './ui/Loader';
import { XMarkIcon } from './icons/Icons';
import { searchForInspiration } from '../services/geminiService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; sources: any[] } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const searchResult = await searchForInspiration(query);
      setResult(searchResult);
    } catch (err) {
      setError('Đã xảy ra lỗi trong quá trình tìm kiếm. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <Card 
        className="w-full max-w-2xl relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white" aria-label="Close search modal">
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        <h2 className="text-xl font-bold mb-4">Tìm kiếm ý tưởng & cảm hứng</h2>
        
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="VD: Ý tưởng video về du hành thời gian..."
            className="flex-grow"
            aria-label="Search for inspiration"
          />
          <Button type="submit" isLoading={isLoading}>Tìm kiếm</Button>
        </form>
        
        <div className="mt-6 max-h-[60vh] overflow-y-auto p-1">
          {isLoading && <Loader message="AI đang tìm kiếm..." />}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {result && (
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm">{result.text}</pre>
              {result.sources && result.sources.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-base">Nguồn tham khảo:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {result.sources.map((source, index) => (
                      source.web && source.web.uri && <li key={index}>
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {source.web.title || source.web.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SearchModal;

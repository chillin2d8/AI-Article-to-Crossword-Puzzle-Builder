

import React, { useState, useEffect, useCallback, useRef } from 'react';
// FIX: Replaced AnalysisData with ComprehensiveAnalysisData to match updated types.
import { ComprehensiveAnalysisData, ImageSearchResult, ImageSelection, UserTier } from '../types';
import { searchUnsplashImages } from '../services/unsplashService';
import { searchPexelsImages } from '../services/pexelsService';
import { USER_TIERS } from '../config';
import { containsProfanity } from '../services/contentService';

interface ImageSelectorProps {
    // FIX: Replaced AnalysisData with ComprehensiveAnalysisData.
    analysisData: ComprehensiveAnalysisData;
    onComplete: (selections: ImageSelection) => void;
    onBack: () => void;
    tier: UserTier;
}

type SearchSource = 'unsplash' | 'pexels';
type LoadingState = 'idle' | 'loading' | 'error' | 'success';

const ImagePanel: React.FC<{
    title: string;
    initialSearchQuery: string;
    onSelection: (url: string) => void;
    tier: UserTier;
    defaultSource?: SearchSource;
}> = React.memo(({ title, initialSearchQuery, onSelection, tier, defaultSource = 'pexels' }) => {
    const tierConfig = USER_TIERS[tier];
    const [loadingState, setLoadingState] = useState<LoadingState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
    const [source, setSource] = useState<SearchSource>(defaultSource);
    const [results, setResults] = useState<ImageSearchResult[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSearch = useCallback(async () => {
        if (containsProfanity(searchTerm)) {
            setError("Search query contains inappropriate language.");
            setLoadingState('error');
            setResults([]); // Clear any previous results
            return;
        }

        if (!searchTerm.trim()) return;
        setLoadingState('loading');
        setError(null);
        try {
            const searchFn = source === 'unsplash' ? searchUnsplashImages : searchPexelsImages;
            const searchResults = await searchFn(searchTerm, 1);
            setResults(searchResults);
            setLoadingState('success');
        } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : 'Search failed.';
            setError(message);
            setLoadingState('error');
        }
    }, [searchTerm, source]);
    
    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        onSelection(imageUrl);
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUri = reader.result as string;
                handleImageClick(dataUri); // Select the uploaded image
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        handleSearch();
    }, [handleSearch]);

    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-3">{title}</h3>
            <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <input 
                        type="search"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        className="flex-grow p-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-200 disabled:cursor-not-allowed"
                        placeholder="Search for an image..."
                        disabled={!tierConfig.permissions.canEditSearch}
                    />
                     <button onClick={handleSearch} disabled={loadingState === 'loading'} className="px-3 py-1 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700 text-sm disabled:bg-slate-400">Search</button>
                </div>
                {tierConfig.permissions.canUploadImage && (
                    <div className="text-center">
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />
                         <button onClick={() => fileInputRef.current?.click()} className="text-xs text-indigo-600 hover:underline font-semibold">
                            Or Upload Your Own
                        </button>
                    </div>
                )}
                 <div className="flex items-center justify-center gap-4 text-xs text-slate-600">
                    <label className="cursor-pointer"><input type="radio" name={`source-${title}`} value="pexels" checked={source === 'pexels'} onChange={() => setSource('pexels')} /> Pexels</label>
                    <label className="cursor-pointer"><input type="radio" name={`source-${title}`} value="unsplash" checked={source === 'unsplash'} onChange={() => setSource('unsplash')} /> Unsplash</label>
                </div>
                <div className="flex-grow grid grid-cols-2 gap-2 min-h-[150px]">
                    {loadingState === 'loading' && <p className="col-span-2 text-center self-center">Searching...</p>}
                    {loadingState === 'error' && <p className="col-span-2 text-center text-red-500 self-center">{error}</p>}
                    {loadingState === 'success' && results.length === 0 && !selectedImage?.startsWith('data:') && <p className="col-span-2 text-center self-center">No results found.</p>}
                    
                    {/* Display uploaded image if selected */}
                    {selectedImage && selectedImage.startsWith('data:') && (
                         <div className={`relative cursor-pointer group aspect-video rounded-md overflow-hidden ring-2 ring-indigo-500`} onClick={() => handleImageClick(selectedImage)}>
                            <img src={selectedImage} alt="Uploaded content" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                <p className="text-white text-lg font-bold">✓ Selected</p>
                            </div>
                        </div>
                    )}

                    {results.map(img => (
                         <div key={img.id} className={`relative cursor-pointer group aspect-video rounded-md overflow-hidden ring-2 ${selectedImage === img.url_full ? 'ring-indigo-500' : 'ring-transparent'}`} onClick={() => handleImageClick(img.url_full)}>
                            <img src={img.url_small} alt={img.description} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                {selectedImage !== img.url_full && <p className="text-white text-lg font-bold opacity-0 group-hover:opacity-100">Select</p>}
                                {selectedImage === img.url_full && <p className="text-white text-lg font-bold">✓ Selected</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});


export const ImageSelector: React.FC<ImageSelectorProps> = React.memo(({ analysisData, onComplete, onBack, tier }) => {
    const [selections, setSelections] = useState<ImageSelection>({ one: null, two: null });

    const handleSelection = (imageNumber: 'one' | 'two', url: string) => {
        setSelections(prev => ({ ...prev, [imageNumber]: url }));
    };

    const isComplete = selections.one && selections.two;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Step 2: Choose Your Images</h2>
                <p className="text-slate-600 mt-1">Select an image for your summary and puzzle pages.</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-bold text-slate-700">Summary for Context</h3>
                <p className="text-sm text-slate-600 mt-1 text-justify max-h-24 overflow-y-auto">{analysisData.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <ImagePanel 
                    title="Summary Image"
                    initialSearchQuery={analysisData.search_query!}
                    onSelection={(url) => handleSelection('one', url)}
                    tier={tier}
                    defaultSource="pexels"
                />
                 <ImagePanel 
                    title="Puzzle Image"
// FIX: The property 'puzzle_search_query' does not exist on 'ComprehensiveAnalysisData'. The AI only provides a single 'search_query', which will be used for both image panels.
                    initialSearchQuery={analysisData.search_query!}
                    onSelection={(url) => handleSelection('two', url)}
                    tier={tier}
                    defaultSource="unsplash"
                />
            </div>

            <div className="flex justify-between items-center pt-6 border-t">
                <button onClick={onBack} className="px-6 py-2 border border-slate-300 text-slate-700 font-semibold rounded-full hover:bg-slate-100 transition-colors text-sm">
                    Back
                </button>
                <button 
                    onClick={() => onComplete(selections)} 
                    disabled={!isComplete}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                    Finalize Activity Sheet
                </button>
            </div>
        </div>
    );
});

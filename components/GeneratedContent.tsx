
import React from 'react';
import type { GeneratedData } from '../types';
import { Crossword } from './Crossword';

interface GeneratedContentProps {
  data: GeneratedData;
  onDownloadPdf: () => void;
  showSolutions: boolean;
  onToggleSolutions: () => void;
  isGenerating: boolean;
  onRegenerateImage: (imageType: 'summary' | 'crossword') => void;
}

export const GeneratedContent: React.FC<GeneratedContentProps> = ({ data, onDownloadPdf, showSolutions, onToggleSolutions, isGenerating, onRegenerateImage }) => {
  const acrossClues = data.gridData.placedWords
    .filter(w => w.direction === 'across')
    .sort((a, b) => a.number - b.number);
  const downClues = data.gridData.placedWords
    .filter(w => w.direction === 'down')
    .sort((a, b) => a.number - b.number);
    
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">{data.title} - Activity Sheet</h2>
        <div className="flex items-center justify-start sm:justify-end gap-2 flex-wrap">
            <button
                onClick={() => onRegenerateImage('summary')}
                disabled={isGenerating}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-full hover:bg-slate-100 transition-colors text-xs disabled:bg-slate-100 disabled:cursor-not-allowed"
                title="Regenerate Summary Image"
            >
                🎨 Regen. Summary
            </button>
            <button
                onClick={() => onRegenerateImage('crossword')}
                disabled={isGenerating}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-full hover:bg-slate-100 transition-colors text-xs disabled:bg-slate-100 disabled:cursor-not-allowed"
                title="Regenerate Crossword Image"
            >
                🎨 Regen. Crossword
            </button>
            <button 
                onClick={onToggleSolutions}
                disabled={isGenerating}
                className="px-6 py-2 border border-slate-300 text-slate-700 font-semibold rounded-full hover:bg-slate-100 transition-colors text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
                {showSolutions ? 'Hide Solutions' : 'Show Solutions'}
            </button>
            <button
                onClick={onDownloadPdf}
                disabled={isGenerating}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-sm"
            >
                {isGenerating ? 'Generating...' : 'Download PDF'}
            </button>
        </div>
      </div>
      
      <div className="border-t border-b border-slate-200 py-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">6th Grade Summary</h3>
        <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-3 rounded-lg">
            <div className="text-center">
                <div className="text-sm text-slate-500">Original Article</div>
                <div className="font-bold text-slate-700">{data.originalWordCount} words</div>
                <div className="text-xs text-slate-600">{data.originalGradeLevel} Reading Level</div>
            </div>
            <div className="text-center border-l border-slate-200">
                <div className="text-sm text-slate-500">Generated Summary</div>
                <div className="font-bold text-slate-700">{data.summaryWordCount} words</div>
                <div className="text-xs text-slate-600">{data.summaryGradeLevel} Reading Level</div>
            </div>
        </div>
        <div className="mt-4 flow-root">
            <div className="md:w-2/5 md:float-right md:ml-6 mb-4">
                <img src={data.imageUrlTwo} alt="Comic style representation of the article" className="rounded-xl shadow-lg border-4 border-white w-full" />
            </div>
            <p className="text-slate-700 leading-relaxed text-sm text-justify">{data.summary_6th_grade}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Crossword Puzzle</h3>
         <div className="w-full max-w-lg mx-auto mb-6">
            <img src={data.imageUrlOne} alt="Generated representation of the article" className="rounded-xl shadow-lg border-4 border-white" />
        </div>
        <div className="flex justify-center">
            <Crossword gridData={data.gridData} showSolutions={showSolutions} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 max-w-4xl mx-auto">
            <div>
              <h3 className="font-bold text-lg mb-2 text-slate-700">Across</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {acrossClues.map(word => (
                  <li key={`across-${word.number}`} className="p-1">
                    <span className="font-bold">{word.number}.</span> {word.clue}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 text-slate-700">Down</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {downClues.map(word => (
                  <li key={`down-${word.number}`} className="p-1">
                    <span className="font-bold">{word.number}.</span> {word.clue}
                  </li>
                ))}
              </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

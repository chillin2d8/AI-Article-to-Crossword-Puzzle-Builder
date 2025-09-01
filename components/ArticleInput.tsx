
import React from 'react';
import { UI_CONFIG } from '../config';

interface ArticleInputProps {
  articleText: string;
  setArticleText: (text: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  gradeLevel: string;
  setGradeLevel: (level: string) => void;
  wordCount: number;
  setWordCount: (count: number) => void;
}

export const ArticleInput: React.FC<ArticleInputProps> = ({ 
    articleText, setArticleText, onGenerate, isLoading, 
    gradeLevel, setGradeLevel, wordCount, setWordCount,
}) => {
  
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <label htmlFor="article-input" className="text-lg font-semibold text-slate-700">
          Paste your article text or a URL below:
        </label>
        <textarea
          id="article-input"
          value={articleText}
          onChange={(e) => setArticleText(e.target.value)}
          placeholder="Enter text or a URL to generate a summary, illustrations, and a crossword puzzle..."
          className="mt-2 w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-y bg-white text-slate-900"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-lg font-semibold text-slate-700">Generation Options</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="grade-level" className="block text-sm font-medium text-slate-700 mb-1">Reading Level</label>
            <select
              id="grade-level"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              disabled={isLoading}
              className="w-full p-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100"
            >
              {UI_CONFIG.GRADE_LEVELS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
           <div>
            <label htmlFor="word-count" className="block text-sm font-medium text-slate-700 mb-1">Crossword Words</label>
            <select
              id="word-count"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              disabled={isLoading}
              className="w-full p-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100"
            >
              {UI_CONFIG.WORD_COUNTS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
    </div>
      
      <div className="flex flex-col items-center space-y-4 pt-2">
        <button
            onClick={onGenerate}
            disabled={isLoading || !articleText.trim()}
            className="self-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100"
        >
            {isLoading ? 'Generating...' : 'Generate Activity'}
        </button>
      </div>
    </div>
  );
};

import React from 'react';

interface ArticleInputProps {
  articleText: string;
  setArticleText: (text: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const ArticleInput: React.FC<ArticleInputProps> = ({ articleText, setArticleText, onGenerate, isLoading }) => {
  return (
    <div className="flex flex-col space-y-4">
      <label htmlFor="article-input" className="text-lg font-semibold text-slate-700">
        Paste your article text or a URL below:
      </label>
      <textarea
        id="article-input"
        value={articleText}
        onChange={(e) => setArticleText(e.target.value)}
        placeholder="Enter text or a URL to generate a summary, image, and crossword puzzle..."
        className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-y bg-white text-slate-900"
        disabled={isLoading}
      />
      <button
        onClick={onGenerate}
        disabled={isLoading || !articleText.trim()}
        className="self-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? 'Generating...' : 'Generate Activity'}
      </button>
    </div>
  );
};
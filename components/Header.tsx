
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          AI Article-to-Crossword Generator
        </h1>
        <p className="text-slate-500 mt-1">
          Turn any text into an engaging learning activity.
        </p>
      </div>
    </header>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { WordScrambleData } from '../types';

interface ScrambleListProps {
  wordScrambleData: WordScrambleData;
  showSolutions: boolean;
}

export const WordScramble: React.FC<ScrambleListProps> = ({ wordScrambleData, showSolutions }) => {
  const { wordList } = wordScrambleData;
  // State for user's unscrambled word guesses.
  const [guesses, setGuesses] = useState<Record<number, string>>({});
  // State for user's number matches for clues.
  const [clueMatches, setClueMatches] = useState<Record<number, string>>({});

  // Memoize a shuffled list of clues that also stores the original index.
  const randomizedClues = useMemo(() => {
    const wordsWithOriginalIndex = wordList.map((word, index) => ({ ...word, originalIndex: index }));
    return [...wordsWithOriginalIndex].sort(() => Math.random() - 0.5);
  }, [wordList]);

  // Reset states when a new set of words is provided.
  useEffect(() => {
    setGuesses({});
    setClueMatches({});
  }, [wordList]);

  const handleGuessChange = (index: number, value: string) => {
    setGuesses(prev => ({
      ...prev,
      [index]: value.toUpperCase(),
    }));
  };
  
  const handleClueMatchChange = (clueIndex: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, ''); // Allow only numbers
    setClueMatches(prev => ({
        ...prev,
        [clueIndex]: numericValue,
    }));
  };

  return (
    <div className="bg-slate-50 p-6 rounded-md border border-slate-200 flex flex-col">
      {/* Part 1: Numbered list of scrambled words with input fields */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-slate-800 mb-3 border-b border-slate-300 pb-2">
          Unscramble the Words
        </h4>
        <ol className="space-y-4">
          {wordList.map((word, index) => {
            const userGuess = guesses[index] || '';
            const isCorrect = userGuess === word.word;

            let inputClass = "bg-white border-slate-300 focus:ring-indigo-500 focus:border-indigo-500";
            if (userGuess.length > 0) {
              if (isCorrect) {
                inputClass = "bg-green-100 border-green-500 text-green-800 ring-green-500 focus:ring-green-500 focus:border-green-500";
              }
            }
             if (showSolutions) {
                inputClass = "bg-blue-100 border-blue-500 text-blue-800";
            }

            return (
              <li key={index} className="grid grid-cols-[auto_1fr_2fr] items-center gap-4">
                <span className="text-slate-500 font-semibold">{index + 1}.</span>
                <span className="font-mono text-lg font-bold tracking-widest text-indigo-600">
                  {word.scrambled_word}
                </span>
                <input
                  type="text"
                  value={showSolutions ? word.word : userGuess}
                  onChange={(e) => handleGuessChange(index, e.target.value)}
                  disabled={showSolutions}
                  aria-label={`Enter unscrambled word for ${word.scrambled_word}`}
                  className={`w-full p-2 font-mono tracking-wider text-lg text-slate-900 border-2 rounded-md transition-colors duration-200 ${inputClass}`}
                  maxLength={word.word.length}
                />
              </li>
            );
          })}
        </ol>
      </div>

      {/* Part 2: Randomized clue bank with number matching */}
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-slate-800 mb-2 border-b border-slate-300 pb-2">
          Match the Clue
        </h4>
        <p className="text-sm text-slate-500 mb-4">Write the number of the scrambled word next to its matching clue.</p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-slate-700">
          {randomizedClues.map((clue, clueIndex) => {
            const userMatch = clueMatches[clueIndex] || '';
            const correctNumber = clue.originalIndex + 1;
            const isCorrect = parseInt(userMatch, 10) === correctNumber;

            let inputClass = "bg-white border-slate-300 focus:ring-indigo-500 focus:border-indigo-500";
            if (userMatch.length > 0) {
              if (isCorrect) {
                inputClass = "bg-green-100 border-green-500 text-green-800 ring-green-500 focus:ring-green-500 focus:border-green-500";
              } else {
                inputClass = "bg-red-100 border-red-500 text-red-800 ring-red-500 focus:ring-red-500 focus:border-red-500";
              }
            }
            if (showSolutions) {
              inputClass = "bg-blue-100 border-blue-500 text-blue-800";
            }

            return (
              <li key={clueIndex} className="flex items-center gap-3">
                <input
                  type="text"
                  value={showSolutions ? correctNumber : userMatch}
                  onChange={(e) => handleClueMatchChange(clueIndex, e.target.value)}
                  disabled={showSolutions}
                  aria-label={`Enter number for clue: ${clue.clue_text}`}
                  className={`w-12 text-center p-2 font-mono text-lg text-slate-900 border-2 rounded-md transition-colors duration-200 ${inputClass}`}
                  maxLength={2}
                />
                <span className="flex-1 break-words">
                  <span className="text-slate-500 text-xs italic capitalize">({clue.clue_type})</span> {clue.clue_text}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
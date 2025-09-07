import React from 'react';
import { WordSearchData, PlacedWordSearchWord } from '../types';

interface WordSearchProps {
    wordSearchData: WordSearchData;
    showSolutions?: boolean;
}

const CELL_SIZE_REM = 2; // Size of each cell in rem units

const isCellInSolution = (row: number, col: number, placedWords: PlacedWordSearchWord[]): boolean => {
    for (const word of placedWords) {
        for (let i = 0; i < word.word.length; i++) {
            let r = word.row;
            let c = word.col;
            
            // This needs to map the direction name to a vector
            if (word.direction === 'horizontal') c += i;
            else if (word.direction === 'vertical') r += i;
            else if (word.direction === 'diagonal-down') { r += i; c += i; }
            else if (word.direction === 'diagonal-up') { r -= i; c += i; }
            else if (word.direction === 'horizontal-reverse') c -= i;
            else if (word.direction === 'vertical-reverse') r -= i;
            else if (word.direction === 'diagonal-down-reverse') { r -= i; c -= i; }
            else if (word.direction === 'diagonal-up-reverse') { r += i; c -= i; }
            
            if (r === row && c === col) {
                return true;
            }
        }
    }
    return false;
};

export const WordSearch: React.FC<WordSearchProps> = React.memo(({ wordSearchData, showSolutions = false }) => {
    const { grid, placedWords } = wordSearchData;

    if (!grid || grid.length === 0) {
        return <p className="text-center text-slate-500">No word search puzzle could be generated.</p>;
    }
    
    const gridStyle: React.CSSProperties = {
        gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`,
        width: `${grid.length * CELL_SIZE_REM}rem`,
        maxWidth: '100%',
        aspectRatio: '1 / 1',
    };

    const cellStyle: React.CSSProperties = {
        fontSize: `${CELL_SIZE_REM * 0.5}rem`,
    };

    return (
        <div
            className="grid bg-slate-100 border-2 border-slate-700 shadow-md"
            style={gridStyle}
        >
            {grid.map((row, r) =>
                row.map((cell, c) => {
                    const isSolutionCell = showSolutions && isCellInSolution(r, c, placedWords);
                    return (
                        <div
                            key={`${r}-${c}`}
                            className={`flex items-center justify-center border border-slate-300 ${isSolutionCell ? 'bg-yellow-300' : 'bg-white'}`}
                            style={{ aspectRatio: '1 / 1' }}
                        >
                            <span className={`font-mono font-bold ${isSolutionCell ? 'text-red-600' : 'text-slate-800'}`} style={cellStyle}>
                                {cell}
                            </span>
                        </div>
                    );
                })
            )}
        </div>
    );
});
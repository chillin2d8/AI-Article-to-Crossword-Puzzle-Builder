

import React, { useState, useEffect, useRef } from 'react';
import type { GridData, PlacedWord } from '../types';

interface CrosswordProps {
  gridData: GridData;
  showSolutions?: boolean;
}

export const Crossword: React.FC<CrosswordProps> = React.memo(({ gridData, showSolutions = false }) => {
  const { grid, placedWords, rows, cols } = gridData;
  const [userGrid, setUserGrid] = useState<string[][]>(() =>
    Array(rows).fill(null).map(() => Array(cols).fill(''))
  );
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [activeWord, setActiveWord] = useState<PlacedWord | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  useEffect(() => {
    // Initialize refs array
    inputRefs.current = Array(rows).fill(null).map(() => Array(cols).fill(null));
  }, [rows, cols]);

  useEffect(() => {
    // If solutions are shown, clear active cell
    if (showSolutions) {
      setActiveCell(null);
      setActiveWord(null);
    }
  }, [showSolutions]);


  const handleCellClick = (row: number, col: number) => {
    if (!grid[row][col] || showSolutions) return;
    setActiveCell({ row, col });
    
    // Find the word corresponding to this cell
    const clickedWord = placedWords.find(word => {
        if (word.direction === 'across') {
            return row === word.row && col >= word.col && col < word.col + word.word.length;
        } else {
            return col === word.col && row >= word.row && row < word.row + word.word.length;
        }
    });
    setActiveWord(clickedWord || null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, row: number, col: number) => {
    const value = e.target.value.toUpperCase().slice(0, 1);
    const newUserGrid = userGrid.map(r => [...r]);
    newUserGrid[row][col] = value;
    setUserGrid(newUserGrid);

    // Auto-focus next cell
    if (value && activeWord) {
        if (activeWord.direction === 'across' && col + 1 < activeWord.col + activeWord.word.length) {
            inputRefs.current[row][col+1]?.focus();
        } else if (activeWord.direction === 'down' && row + 1 < activeWord.row + activeWord.word.length) {
            inputRefs.current[row+1][col]?.focus();
        }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    if (showSolutions) return;
    let newRow = row;
    let newCol = col;
    switch(e.key) {
        case 'ArrowUp': 
            newRow = Math.max(0, row - 1);
            break;
        case 'ArrowDown':
            newRow = Math.min(rows - 1, row + 1);
            break;
        case 'ArrowLeft':
            newCol = Math.max(0, col - 1);
            break;
        case 'ArrowRight':
            newCol = Math.min(cols - 1, col + 1);
            break;
        case 'Backspace':
            if (!userGrid[row][col]) {
                if(activeWord?.direction === 'across' && col > 0) newCol = col -1;
                if(activeWord?.direction === 'down' && row > 0) newRow = row - 1;
            }
            break;
        default:
            return;
    }
    e.preventDefault();
    if(grid[newRow][newCol]) {
      inputRefs.current[newRow][newCol]?.focus();
      handleCellClick(newRow, newCol);
    }
  };

  const isCellInActiveWord = (row: number, col: number) => {
    if (!activeWord || showSolutions) return false;
    if (activeWord.direction === 'across') {
        return row === activeWord.row && col >= activeWord.col && col < activeWord.col + activeWord.word.length;
    }
    return col === activeWord.col && row >= activeWord.row && row < activeWord.row + activeWord.word.length;
  };
  
  const wordNumbers: { [key: string]: number } = {};
  placedWords.forEach(word => {
    wordNumbers[`${word.row}-${word.col}`] = word.number;
  });

  return (
    <div 
      className="grid bg-slate-200 border-2 border-slate-700 shadow-md"
      style={{ 
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        width: `min(${cols * 2.5}rem, 100%)`, 
        aspectRatio: `${cols}/${rows}` 
      }}
    >
      {grid.map((gridRow, r) =>
        gridRow.map((cell, c) => {
          if (!cell) {
            return <div key={`${r}-${c}`} className="bg-slate-50"></div>;
          }
          const cellNumber = wordNumbers[`${r}-${c}`];
          const isActive = activeCell?.row === r && activeCell?.col === c;
          const isInActiveWord = isCellInActiveWord(r, c);
          const cellValue = showSolutions ? grid[r][c] : (userGrid[r][c] || '');
          
          let cellBgClass = 'bg-white';
          if (showSolutions) cellBgClass = 'bg-green-100';
          else if (isActive) cellBgClass = 'bg-yellow-200';
          else if (isInActiveWord) cellBgClass = 'bg-blue-100';

          return (
            <div key={`${r}-${c}`} className="relative aspect-square">
              {cellNumber && <div className="absolute top-0 left-0.5 text-xs font-bold text-slate-600" style={{fontSize: '0.6rem'}}>{cellNumber}</div>}
              <input
                ref={el => { if(inputRefs.current[r]) inputRefs.current[r][c] = el; }}
                type="text"
                maxLength={1}
                value={cellValue}
                readOnly={showSolutions}
                onClick={() => handleCellClick(r, c)}
                onChange={(e) => handleInputChange(e, r, c)}
                onKeyDown={(e) => handleKeyDown(e, r, c)}
                aria-label={`cell ${r},${c}`}
                className={`w-full h-full text-center uppercase font-bold text-slate-800 border border-slate-400
                  ${cellBgClass}
                  ${showSolutions ? 'text-green-800' : ''}
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 z-10`}
              />
            </div>
          );
        })
      )}
    </div>
  );
});
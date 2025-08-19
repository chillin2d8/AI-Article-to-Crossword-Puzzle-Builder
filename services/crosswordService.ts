import type { CrosswordWord, GridData, PlacedWord } from '../types';

const GRID_SIZE = 25; // Start with a medium grid, then trim

export const generateGrid = (words: CrosswordWord[]): GridData => {
  const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);
  let grid: (string | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  const placedWords: PlacedWord[] = [];

  // Place the first (longest) word in the center
  const firstWord = sortedWords.shift();
  if (!firstWord) return { grid: [], placedWords: [], rows: 0, cols: 0 };

  const startRow = Math.floor(GRID_SIZE / 2);
  const startCol = Math.floor((GRID_SIZE - firstWord.word.length) / 2);
  for (let i = 0; i < firstWord.word.length; i++) {
    grid[startRow][startCol + i] = firstWord.word[i];
  }
  placedWords.push({ ...firstWord, row: startRow, col: startCol, direction: 'across', number: 0 });

  // Try to place the rest of the words
  for (const wordToPlace of sortedWords) {
    let bestFit = { score: -1, row: 0, col: 0, direction: 'across' as 'across' | 'down' };

    for (const placed of placedWords) {
      for (let i = 0; i < wordToPlace.word.length; i++) {
        for (let j = 0; j < placed.word.length; j++) {
          if (wordToPlace.word[i] === placed.word[j]) {
            // Potential intersection found
            let newRow: number, newCol: number;
            let isValid = true;
            let score = 0;
            const newDirection = placed.direction === 'across' ? 'down' : 'across';

            if (newDirection === 'down') {
              newRow = placed.row - i;
              newCol = placed.col + j;
              if (newRow < 0 || newRow + wordToPlace.word.length > GRID_SIZE) continue;
              // Check for conflicts
              for (let k = 0; k < wordToPlace.word.length; k++) {
                const r = newRow + k;
                const char = grid[r][newCol];
                if (char && char !== wordToPlace.word[k]) { isValid = false; break; }
                if (!char) score++; // Prefer empty spaces
                if (grid[r][newCol-1] || grid[r][newCol+1]) { // Check adjacent
                    if(r !== placed.row) {isValid = false; break;}
                }
              }
               // Check endpoints
              if(grid[newRow-1]?.[newCol] || grid[newRow + wordToPlace.word.length]?.[newCol]) isValid = false;

            } else { // newDirection === 'across'
              newRow = placed.row + j;
              newCol = placed.col - i;
              if (newCol < 0 || newCol + wordToPlace.word.length > GRID_SIZE) continue;
              // Check for conflicts
              for (let k = 0; k < wordToPlace.word.length; k++) {
                const c = newCol + k;
                const char = grid[newRow][c];
                if (char && char !== wordToPlace.word[k]) { isValid = false; break; }
                if (!char) score++;
                if (grid[newRow-1]?.[c] || grid[newRow+1]?.[c]) {
                   if(c !== placed.col) {isValid = false; break;}
                }
              }
               // Check endpoints
              if(grid[newRow]?.[newCol-1] || grid[newRow]?.[newCol + wordToPlace.word.length]) isValid = false;
            }
            
            if (isValid && score > bestFit.score) {
              bestFit = { score, row: newRow, col: newCol, direction: newDirection };
            }
          }
        }
      }
    }

    if (bestFit.score > -1) {
      // Place the word
      for (let i = 0; i < wordToPlace.word.length; i++) {
        if (bestFit.direction === 'across') {
          grid[bestFit.row][bestFit.col + i] = wordToPlace.word[i];
        } else {
          grid[bestFit.row + i][bestFit.col] = wordToPlace.word[i];
        }
      }
      placedWords.push({ ...wordToPlace, row: bestFit.row, col: bestFit.col, direction: bestFit.direction, number: 0 });
    }
  }

  // Trim and number the grid
  return trimAndNumberGrid(grid, placedWords);
};

const trimAndNumberGrid = (grid: (string|null)[][], placed: PlacedWord[]): GridData => {
    let minRow = GRID_SIZE, maxRow = -1, minCol = GRID_SIZE, maxCol = -1;
    for(const word of placed) {
        minRow = Math.min(minRow, word.row);
        maxRow = Math.max(maxRow, word.direction === 'down' ? word.row + word.word.length - 1 : word.row);
        minCol = Math.min(minCol, word.col);
        maxCol = Math.max(maxCol, word.direction === 'across' ? word.col + word.word.length - 1 : word.col);
    }

    if (maxRow === -1) { // No words placed
      return { grid: [[]], placedWords: [], rows: 0, cols: 0 };
    }

    // Add a 1-cell border, safely handling cases where the puzzle touches the edge (row/col 0)
    const trimBounds = {
      rowStart: Math.max(0, minRow - 1),
      rowEnd: Math.min(GRID_SIZE, maxRow + 2),
      colStart: Math.max(0, minCol - 1),
      colEnd: Math.min(GRID_SIZE, maxCol + 2),
    };

    const trimmedGrid = grid.slice(trimBounds.rowStart, trimBounds.rowEnd).map(r => r.slice(trimBounds.colStart, trimBounds.colEnd));
    const finalPlacedWords: PlacedWord[] = [];
    let number = 1;

    // Sort words to number them correctly (top-to-bottom, left-to-right)
    const sortedForNumbering = [...placed].sort((a,b) => a.row - b.row || a.col - b.col);
    const starts: {[key: string]: boolean} = {};
    
    for (const word of sortedForNumbering) {
        const key = `${word.row}-${word.col}`;
        // Re-calculate row and col based on the new trimmed grid
        const updatedWord = {
            ...word,
            row: word.row - trimBounds.rowStart,
            col: word.col - trimBounds.colStart,
            number: 0
        };
        if (!starts[key]) {
            starts[key] = true;
            updatedWord.number = number++;
        }
        finalPlacedWords.push(updatedWord);
    }
    
    // Assign numbers to words that share a start cell
    finalPlacedWords.forEach(word => {
        if (word.number === 0) {
            const startWord = finalPlacedWords.find(w => w.row === word.row && w.col === word.col && w.number !== 0);
            if (startWord) {
                word.number = startWord.number;
            }
        }
    });

    return {
        grid: trimmedGrid,
        placedWords: finalPlacedWords,
        rows: trimmedGrid.length,
        cols: trimmedGrid[0]?.length || 0
    };
};
import { describe, it, expect } from 'vitest';
import { generateGrid } from './crosswordService';
import { CrosswordWord } from '../types';

describe('crosswordService', () => {
  describe('generateGrid', () => {
    it('should generate a valid grid from a list of words', () => {
      const words: CrosswordWord[] = [
        { word: 'REACT', clue: 'A JavaScript library for building user interfaces' },
        { word: 'HOOKS', clue: 'A new addition in React 16.8' },
        { word: 'STATE', clue: 'An object that represents the parts of the app that can change' },
      ];

      const gridData = generateGrid(words);

      // Basic assertions
      expect(gridData).toBeDefined();
      expect(gridData.grid.length).toBeGreaterThan(0);
      expect(gridData.placedWords.length).toBeGreaterThanOrEqual(2); // At least 2 words should intersect

      // Verify all placed words are in the original list
      const originalWordsSet = new Set(words.map(w => w.word));
      gridData.placedWords.forEach(placed => {
        expect(originalWordsSet.has(placed.word)).toBe(true);
      });

      // Verify the grid content matches the placed words
      gridData.placedWords.forEach(word => {
        for (let i = 0; i < word.word.length; i++) {
          if (word.direction === 'across') {
            expect(gridData.grid[word.row][word.col + i]).toBe(word.word[i]);
          } else {
            expect(gridData.grid[word.row + i][word.col]).toBe(word.word[i]);
          }
        }
      });
    });

    it('should handle an empty array of words', () => {
        const gridData = generateGrid([]);
        expect(gridData.placedWords.length).toBe(0);
        expect(gridData.grid.length).toBe(0);
    });
  });
});

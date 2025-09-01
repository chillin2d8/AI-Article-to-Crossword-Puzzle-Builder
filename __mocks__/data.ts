import { GeneratedData, AnalysisData, GridData, PlacedWord, CrosswordWord } from '../types';
import { STATIC_FALLBACK_IMAGE_DATA_URI } from '../config';

export const mockCrosswordWords: CrosswordWord[] = [
    { word: 'GRID', clue: 'A layout of rows and columns' },
    { word: 'ROW', clue: 'A horizontal line of cells' },
    { word: 'DATA', clue: 'Information' },
];

export const mockAnalysisResult: AnalysisData = {
  title: 'The Art of Testing',
  summary: 'When we write computer code, we need to make sure it works. We do this by testing it. This helps find and fix bugs.',
  search_query: 'software development testing code computer',
  crossword_words: mockCrosswordWords,
  error: null,
  reason: null,
  crosswordWarning: null,
};


export const mockPlacedWords: PlacedWord[] = [
    { word: 'GRID', clue: 'A layout of rows and columns', row: 1, col: 1, direction: 'across', number: 1 },
    { word: 'ROW', clue: 'A horizontal line of cells', row: 0, col: 2, direction: 'down', number: 2 }
];

export const mockGridData: GridData = {
  grid: [
    [null, null, 'R', null],
    ['G', 'R', 'I', 'D'],
    [null, null, 'W', null]
  ],
  placedWords: mockPlacedWords,
  rows: 3,
  cols: 4,
};

export const mockGeneratedData: GeneratedData = {
    title: 'The Art of Testing',
    summary: 'When we write computer code, we need to make sure it works. We do this by testing it. This helps find and fix bugs.',
    gradeLevel: '6',
    imageUrlOne: STATIC_FALLBACK_IMAGE_DATA_URI,
    imageUrlTwo: STATIC_FALLBACK_IMAGE_DATA_URI,
    gridData: mockGridData,
    searchQuery: 'software development testing code computer',
    crosswordWarning: null,
};
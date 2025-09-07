import { GeneratedData, ComprehensiveAnalysisData, GridData, PlacedWord, EnrichedVocabularyItem, WordScrambleVocabularyItem } from '../types';
import { STATIC_FALLBACK_IMAGE_DATA_URI } from '../config';

export const mockEnrichedVocabulary: EnrichedVocabularyItem[] = [
    { word: 'GRID', clue_type: 'Definition', clue_text: 'A layout of rows and columns' },
    { word: 'ROW', clue_type: 'Definition', clue_text: 'A horizontal line of cells' },
    { word: 'DATA', clue_type: 'Synonym', clue_text: 'Information' },
];

export const mockScrambleVocabulary: WordScrambleVocabularyItem[] = [
    { word: 'SCRAMBLE', scrambled_word: 'LBMECARS', clue_type: 'Definition', clue_text: 'Mix in a confused way' },
    { word: 'PUZZLE', scrambled_word: 'ZZLEPU', clue_type: 'Synonym', clue_text: 'Conundrum' },
];

export const mockAnalysisResult: ComprehensiveAnalysisData = {
  title: 'The Art of Testing',
  summary: 'When we write computer code, we need to make sure it works. We do this by testing it. This helps find and fix bugs.',
  search_query: 'software development testing code computer',
  enriched_vocabulary: mockEnrichedVocabulary,
  word_search_vocabulary: mockEnrichedVocabulary,
  word_scramble_vocabulary: mockScrambleVocabulary,
  error: null,
  reason: null,
};


export const mockPlacedWords: PlacedWord[] = [
    { ...mockEnrichedVocabulary[0], row: 1, col: 1, direction: 'across', number: 1 },
    { ...mockEnrichedVocabulary[1], row: 0, col: 2, direction: 'down', number: 2 }
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
    puzzleType: 'crossword',
    analysisData: mockAnalysisResult,
    imageUrlOne: STATIC_FALLBACK_IMAGE_DATA_URI,
    imageUrlTwo: STATIC_FALLBACK_IMAGE_DATA_URI,
    gridData: mockGridData,
    wordSearchData: {
        grid: [['A', 'B'], ['C', 'D']],
        placedWords: [{ word: 'AB', row: 0, col: 0, direction: 'horizontal'}],
        wordList: [{ word: 'AB', clue_type: 'Definition', clue_text: 'The first two letters' }]
    },
    wordScrambleData: {
        wordList: mockScrambleVocabulary
    },
    searchQuery: 'software development testing code computer',
    crosswordWarning: null,
};
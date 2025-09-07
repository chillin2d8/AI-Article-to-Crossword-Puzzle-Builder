import { WordSearchData, PlacedWordSearchWord, WordSearchVocabularyItem } from '../types';

type Direction = {
    name: 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up' | 'horizontal-reverse' | 'vertical-reverse' | 'diagonal-down-reverse' | 'diagonal-up-reverse';
    dRow: number;
    dCol: number;
};

const GRID_SIZE = 20;

const ALL_DIRECTIONS: Direction[] = [
    // Forward
    { name: 'horizontal', dRow: 0, dCol: 1 },
    { name: 'vertical', dRow: 1, dCol: 0 },
    { name: 'diagonal-down', dRow: 1, dCol: 1 },
    { name: 'diagonal-up', dRow: -1, dCol: 1 },
    // Reverse
    { name: 'horizontal-reverse', dRow: 0, dCol: -1 },
    { name: 'vertical-reverse', dRow: -1, dCol: 0 },
    { name: 'diagonal-down-reverse', dRow: -1, dCol: -1 },
    { name: 'diagonal-up-reverse', dRow: 1, dCol: -1 },
];

const getDirectionsForGradeLevel = (gradeLevel: string): Direction[] => {
    switch (gradeLevel) {
        case '3': // 3rd Grade: Simple forward
            return [ALL_DIRECTIONS[0], ALL_DIRECTIONS[1]];
        case '6': // 6th Grade: Forward + Diagonal
            return [ALL_DIRECTIONS[0], ALL_DIRECTIONS[1], ALL_DIRECTIONS[2], ALL_DIRECTIONS[3]];
        case '9': // 9th Grade: Forward, Diagonal, and simple Reverse
            return [ALL_DIRECTIONS[0], ALL_DIRECTIONS[1], ALL_DIRECTIONS[2], ALL_DIRECTIONS[3], ALL_DIRECTIONS[4], ALL_DIRECTIONS[5]];
        case '12': // 12th Grade: All directions
        default:
            return ALL_DIRECTIONS;
    }
};


const canPlaceWord = (
    grid: (string | null)[][],
    word: string,
    row: number,
    col: number,
    direction: Direction
): boolean => {
    for (let i = 0; i < word.length; i++) {
        const r = row + direction.dRow * i;
        const c = col + direction.dCol * i;

        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
            return false; // Out of bounds
        }
        if (grid[r][c] && grid[r][c] !== word[i]) {
            return false; // Conflict with another word
        }
    }
    return true;
};

const placeWordOnGrid = (
    grid: (string | null)[][],
    word: string,
    row: number,
    col: number,
    direction: Direction
): void => {
    for (let i = 0; i < word.length; i++) {
        const r = row + direction.dRow * i;
        const c = col + direction.dCol * i;
        grid[r][c] = word[i];
    }
};

export const generateWordSearchGrid = (
    vocabulary: WordSearchVocabularyItem[],
    gradeLevel: string
): WordSearchData => {
    const grid: (string | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    const placedWords: PlacedWordSearchWord[] = [];
    const directions = getDirectionsForGradeLevel(gradeLevel);

    const sortedVocabulary = [...vocabulary].sort((a, b) => b.word.length - a.word.length);

    for (const vocabItem of sortedVocabulary) {
        const upperWord = vocabItem.word.toUpperCase();
        let placed = false;
        const attempts = 150;

        for (let i = 0; i < attempts; i++) {
            const direction = directions[Math.floor(Math.random() * directions.length)];
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);

            if (canPlaceWord(grid, upperWord, row, col, direction)) {
                placeWordOnGrid(grid, upperWord, row, col, direction);
                placedWords.push({
                    word: vocabItem.word, // Keep original casing for display list
                    row,
                    col,
                    direction: direction.name,
                });
                placed = true;
                break;
            }
        }
    }

    const finalGrid: string[][] = grid.map(row =>
        row.map(cell => cell || String.fromCharCode(65 + Math.floor(Math.random() * 26)))
    );
    
    // Create the final word list from the items that were successfully placed
    const placedWordSet = new Set(placedWords.map(p => p.word.toUpperCase()));
    const finalWordList = vocabulary.filter(item => placedWordSet.has(item.word.toUpperCase()));

    return {
        grid: finalGrid,
        placedWords: placedWords,
        wordList: finalWordList,
    };
};
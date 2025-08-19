
export interface CrosswordWord {
  word: string;
  clue: string;
}

export interface PlacedWord extends CrosswordWord {
  row: number;
  col: number;
  direction: 'across' | 'down';
  number: number;
}

export interface GridData {
  grid: (string | null)[][];
  placedWords: PlacedWord[];
  rows: number;
  cols: number;
}

export interface AnalysisResult {
  title: string;
  summary: string;
  summary_6th_grade: string;
  originalGradeLevel: string;
  summaryGradeLevel: string;
  image_prompt_one: string;
  image_prompt_two: string;
  crossword_words: CrosswordWord[];
}

export interface GeneratedData {
  title: string;
  summary: string;
  summary_6th_grade: string;
  imageUrlOne: string;
  imageUrlTwo: string;
  gridData: GridData;
  originalWordCount: number;
  summaryWordCount: number;
  originalGradeLevel: string;
  summaryGradeLevel: string;
  image_prompt_one: string;
  image_prompt_two: string;
}

import { z } from 'zod';
import { comprehensiveAnalysisSchema, vocabularyValidationSchema, vocabularyReplacementSchema, enrichedVocabularySchema, wordSearchVocabularySchema, wordSearchReplacementSchema, wordScrambleVocabularySchema } from './schemas';
import { USER_TIERS, UI_CONFIG } from './config';
import type { Timestamp } from '@firebase/firestore';

export type UserTier = keyof typeof USER_TIERS;
export type UserTierConfig = typeof USER_TIERS[UserTier];
export type PuzzleType = typeof UI_CONFIG.PUZZLE_TYPES[number]['value'];

// This is the new, unified, and enriched vocabulary structure.
export type EnrichedVocabularyItem = z.infer<typeof enrichedVocabularySchema>;

export interface PlacedWord extends EnrichedVocabularyItem {
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

// --- NEW WORD SEARCH TYPES ---
// This is the enriched vocabulary structure for Word Search
export type WordSearchVocabularyItem = z.infer<typeof wordSearchVocabularySchema>;

export interface PlacedWordSearchWord {
    word: string;
    row: number;
    col: number;
    direction: 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up' | 'horizontal-reverse' | 'vertical-reverse' | 'diagonal-down-reverse' | 'diagonal-up-reverse';
}

export interface WordSearchData {
    grid: string[][];
    placedWords: PlacedWordSearchWord[];
    wordList: WordSearchVocabularyItem[]; // The full, enriched list for display
}
// --- END NEW WORD SEARCH TYPES ---

// --- NEW WORD SCRAMBLE TYPES ---
export type WordScrambleVocabularyItem = z.infer<typeof wordScrambleVocabularySchema>;

export interface WordScrambleData {
    wordList: WordScrambleVocabularyItem[];
}
// --- END NEW WORD SCRAMBLE TYPES ---


// The result from the initial AI analysis, plus a potential warning added by our services.
export type ComprehensiveAnalysisData = z.infer<typeof comprehensiveAnalysisSchema> & { crosswordWarning?: string | null };
export type VocabularyValidationResponse = z.infer<typeof vocabularyValidationSchema>;
export type VocabularyReplacementResponse = z.infer<typeof vocabularyReplacementSchema>;
export type WordSearchReplacementResponse = z.infer<typeof wordSearchReplacementSchema>;


export interface GeneratedData {
  id?: string; // Firestore document ID
  title: string;
  summary: string;
  gradeLevel: string;
  puzzleType: PuzzleType;
  
  // Puzzle-specific data
  gridData: GridData; // Crossword data
  wordSearchData: WordSearchData; // New Word Search data
  wordScrambleData: WordScrambleData; // New Word Scramble data
  
  analysisData: ComprehensiveAnalysisData; // Store the full analysis
  imageUrlOne: string;
  imageUrlTwo: string;
  searchQuery: string;
  crosswordWarning?: string | null;
  createdAt?: any; 
}

// State management types for the reducer
export interface GeneratorState {
  phase: 'input' | 'selecting-images' | 'final';
  loadingProgress: { [key: string]: string };
  finalData: GeneratedData | null;
  analysisData: ComprehensiveAnalysisData | null;
  error: string | null;
  activityId: string | null; // To hold the ID for saving
  pdfDownloadCompleted: boolean;
}

export type GeneratorAction =
  | { type: 'GENERATE_START' }
  | { type: 'UPDATE_PROGRESS'; payload: { stage: string; message: string } }
  | { type: 'CLEAR_PROGRESS' }
  | { type: 'ANALYSIS_SUCCESS'; payload: ComprehensiveAnalysisData }
  | { type: 'FINALIZE_START' }
  | { type: 'GENERATE_SUCCESS'; payload: { data: GeneratedData, id: string } }
  | { type: 'GENERATE_ERROR'; payload: string }
  | { type: 'FINALIZE_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' }
  | { type: 'SET_ACTIVITY_FOR_VIEWING'; payload: GeneratedData }
  | { type: 'PDF_DOWNLOAD_START' }
  | { type: 'PDF_DOWNLOAD_SUCCESS' };

// Custom Error Classes for specific feedback
export class ApiError extends Error {
  cause?: unknown;
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'ApiError';
    if (options?.cause) {
        this.cause = options.cause;
    }
  }
}

export class ContentError extends Error {
  cause?: unknown;
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'ContentError';
    if (options?.cause) {
        this.cause = options.cause;
    }
  }
}

export class PdfGenerationError extends Error {
    cause?: unknown;
    constructor(message: string, options?: { cause?: unknown }) {
        super(message);
        this.name = 'PdfGenerationError';
        if (options?.cause) {
            this.cause = options.cause;
        }
    }
}

// Types for Image Selection feature
export type ImageType = 'royalty-free' | 'svg';

export interface ConfigOptions {
    imageTypeOne: ImageType;
    imageTypeTwo: ImageType;
}

export interface ImageSelection {
    one: string | null;
    two: string | null;
}

export interface ImageSearchResult {
    id: string | number;
    url_small: string;
    url_full: string;
    description: string;
    user_name: string;
    user_link: string;
}

export interface UnsplashPhoto {
    id: string;
    urls: {
        small: string;
        regular: string;
    };
    alt_description: string | null;
    user: {
        name: string;
        links: {
            html: string;
        };
    };
}

export interface UnsplashSearchResponse {
    results: UnsplashPhoto[];
}

export interface PexelsPhoto {
    id: number;
    src: {
        medium: string;
        original: string;
    };
    alt: string | null;

    photographer: string;
    photographer_url: string;
}

export interface PexelsSearchResponse {
    photos: PexelsPhoto[];
}

export interface SignInCredentials {
    email: string;
    password: string;
}

export interface SignUpCredentials extends SignInCredentials {
    fullName: string;
}

export interface SubscriptionInfo {
    role: string;
    status: string;
    cancel_at_period_end: boolean;
    current_period_end: Date;
}

export class AuthError extends Error {
    code: string;
    constructor(message: string, code: string) {
        super(message);
        this.name = 'AuthError';
        this.code = code;
    }
}

export interface UserProfile {
    agreedToTerms: boolean;
    termsAgreementDate?: Timestamp;
}
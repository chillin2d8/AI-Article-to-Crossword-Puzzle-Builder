import { z } from 'zod';
import { analysisSchema } from './schemas';
import { USER_TIERS } from './config';

export type UserTier = keyof typeof USER_TIERS;
export type UserTierConfig = typeof USER_TIERS[UserTier];


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

// The result from the initial AI analysis, plus a potential warning added by our services.
export type AnalysisData = z.infer<typeof analysisSchema> & { crosswordWarning?: string | null };

export interface GeneratedData {
  title: string;
  summary: string;
  gradeLevel: string;
  gridData: GridData;
  imageUrlOne: string;
  imageUrlTwo: string;
  searchQuery: string;
  crosswordWarning?: string | null;
}

// State management types for the reducer
export interface GeneratorState {
  phase: 'input' | 'selecting-images' | 'final';
  loadingProgress: { [key: string]: string };
  finalData: GeneratedData | null;
  analysisData: AnalysisData | null;
  error: string | null;
}

export type GeneratorAction =
  | { type: 'GENERATE_START' }
  | { type: 'UPDATE_PROGRESS'; payload: { stage: string; message: string } }
  | { type: 'CLEAR_PROGRESS' }
  | { type: 'ANALYSIS_SUCCESS'; payload: AnalysisData }
  | { type: 'FINALIZE_START' }
  | { type: 'GENERATE_SUCCESS'; payload: GeneratedData }
  | { type: 'GENERATE_ERROR'; payload: string }
  | { type: 'UPDATE_SUMMARY'; payload: string }
  | { type: 'RESET' };

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
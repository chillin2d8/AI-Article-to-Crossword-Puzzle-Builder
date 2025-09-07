import { analyzeArticle as analyzeArticleWithAI } from './geminiService';
import { ContentError, GeneratedData, ComprehensiveAnalysisData, PuzzleType, WordSearchData, EnrichedVocabularyItem } from '../types';
import { getContent } from './contentService';
import { generateGrid } from './crosswordService';
import { generateWordSearchGrid } from './wordSearchService';
import { getSinglePexelsImage } from './pexelsService';

interface GenerationOptions {
    gradeLevel: string;
    wordCount: number;
    puzzleType: PuzzleType;
}

/**
 * Step 1 of Royalty-Free flow OR part of the main comic flow.
 * Fetches content and analyzes it with AI.
 */
export const generateAnalysisData = async (
    sourceText: string,
    options: GenerationOptions,
    updateProgress: (stage: string, message:string) => void
): Promise<ComprehensiveAnalysisData> => {
    // 1. Get content (handles URL or text)
    const articleText = await getContent(sourceText, updateProgress);
    
    // 2. Analyze with AI
    updateProgress('Analysis', 'Analyzing article with AI...');
    const analysisResult = await analyzeArticleWithAI(articleText, options);

    // Graceful failure for short/unsuitable content
    if (analysisResult.enriched_vocabulary && analysisResult.enriched_vocabulary.length < 5) {
        analysisResult.crosswordWarning = "We couldn't generate a full puzzle from this text, but here's a quick summary.";
        analysisResult.enriched_vocabulary = []; // Ensure it's an empty array
    }

    if (!analysisResult.summary) { // Stricter check
        throw new ContentError("AI analysis failed to return the required text content. The source text may be too short or in an unsupported format.");
    }

    updateProgress('Analysis', 'Analysis complete.');
    return analysisResult;
}

/**
 * Assembles the final data object after all data has been gathered.
 */
export const assembleFinalData = (
    analysisData: ComprehensiveAnalysisData,
    imageUrls: { one: string, two: string },
    options: GenerationOptions,
    updateProgress: (stage: string, message:string) => void
): GeneratedData => {
    updateProgress('Puzzle', 'Building puzzle(s)...');
    
    // Default to sensible fallbacks if optional fields are missing
    const title = analysisData.title || "Untitled Activity";
    const searchQuery = analysisData.search_query || title.split(' ').slice(0, 3).join(' ');

    const crosswordVocabulary = analysisData.enriched_vocabulary || [];
    const wordSearchVocabulary = analysisData.word_search_vocabulary || [];
    const wordScrambleVocabulary = analysisData.word_scramble_vocabulary || [];

    // Initialize puzzle data containers
    let gridData = { grid: [], placedWords: [], rows: 0, cols: 0 };
    let wordSearchData = { grid: [], placedWords: [], wordList: [] };
    let wordScrambleData = { wordList: [] };

    // Determine which puzzles to generate based on the selected type
    const shouldGenerateCrossword = options.puzzleType === 'crossword' || options.puzzleType === 'launchedition';
    const shouldGenerateWordSearch = options.puzzleType === 'wordsearch' || options.puzzleType === 'launchedition';
    const shouldGenerateWordScramble = options.puzzleType === 'wordscramble' || options.puzzleType === 'launchedition';

    if (shouldGenerateCrossword) {
        gridData = generateGrid(crosswordVocabulary);
    }
    if (shouldGenerateWordSearch) {
        wordSearchData = generateWordSearchGrid(wordSearchVocabulary, options.gradeLevel);
    }
    if (shouldGenerateWordScramble) {
        wordScrambleData = { wordList: wordScrambleVocabulary };
    }

    updateProgress('Puzzle', 'Puzzle(s) built successfully.');

    const finalData: GeneratedData = {
        title,
        summary: analysisData.summary!,
        gradeLevel: options.gradeLevel,
        puzzleType: options.puzzleType,
        gridData,
        wordSearchData,
        wordScrambleData,
        analysisData, // Pass the full analysis data through
        imageUrlOne: imageUrls.one,
        imageUrlTwo: imageUrls.two,
        searchQuery,
        crosswordWarning: analysisData.crosswordWarning || null,
        createdAt: new Date(),
    };
    
    updateProgress('Finalizing', 'Success!');
    return finalData;
}


/**
 * Orchestrates the full, one-click generation process for the Free tier.
 */
export const generateFreeActivityData = async (
    sourceText: string,
    options: GenerationOptions,
    updateProgress: (stage: string, message:string) => void
): Promise<GeneratedData> => {
    // 1. Get and analyze content
    const analysisResult = await generateAnalysisData(sourceText, options, updateProgress);

    // 2. Generate a single random image
    updateProgress('Image Search', 'Finding a royalty-free image...');
    const searchQuery = analysisResult.search_query || analysisResult.title || "abstract";
    const imageUrl = await getSinglePexelsImage(searchQuery);
    updateProgress('Image Search', 'Image found successfully.');

    // 3. Assemble final data (using the same image for both slots)
    const finalData = assembleFinalData(
        analysisResult, 
        { one: imageUrl, two: imageUrl },
        options,
        updateProgress
    );

    return finalData;
}
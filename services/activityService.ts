
import { analyzeArticle as analyzeArticleWithAI } from './geminiService';
import { AnalysisData, ContentError, GeneratedData } from '../types';
import { getContent } from './contentService';
import { generateGrid } from './crosswordService';
import { getSinglePexelsImage } from './pexelsService';

interface GenerationOptions {
    gradeLevel: string;
    wordCount: number;
}

/**
 * Step 1 of Royalty-Free flow OR part of the main comic flow.
 * Fetches content and analyzes it with AI.
 */
export const generateAnalysisData = async (
    sourceText: string,
    options: GenerationOptions,
    updateProgress: (stage: string, message:string) => void
): Promise<AnalysisData> => {
    // 1. Get content (handles URL or text)
    const articleText = await getContent(sourceText, updateProgress);
    
    // 2. Analyze with AI
    updateProgress('Analysis', 'Analyzing article with AI...');
    const analysisResult = await analyzeArticleWithAI(articleText, options);

    // Graceful failure for short/unsuitable content
    if (analysisResult.crossword_words && analysisResult.crossword_words.length < 5) {
        analysisResult.crosswordWarning = "We couldn't generate a crossword from this text, but here's a quick summary.";
        analysisResult.crossword_words = []; // Ensure it's an empty array
    }

    if (!analysisResult.title || !analysisResult.summary || !analysisResult.search_query) {
        throw new ContentError("AI analysis failed to return the required text content. The source text may be too short or in an unsupported format.");
    }

    updateProgress('Analysis', 'Analysis complete.');
    return analysisResult;
}

/**
 * Assembles the final data object after all data has been gathered.
 */
export const assembleFinalData = (
    analysisData: AnalysisData,
    imageUrls: { one: string, two: string },
    options: GenerationOptions,
    updateProgress: (stage: string, message:string) => void
): GeneratedData => {
    updateProgress('Crossword', 'Building crossword grid...');
    const gridData = generateGrid(analysisData.crossword_words || []);
    updateProgress('Crossword', 'Grid built successfully.');

    const finalData: GeneratedData = {
        title: analysisData.title!,
        summary: analysisData.summary!,
        gradeLevel: options.gradeLevel,
        gridData,
        imageUrlOne: imageUrls.one,
        imageUrlTwo: imageUrls.two,
        searchQuery: analysisData.search_query!,
        crosswordWarning: analysisData.crosswordWarning || null,
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
    const imageUrl = await getSinglePexelsImage(analysisResult.search_query!);
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

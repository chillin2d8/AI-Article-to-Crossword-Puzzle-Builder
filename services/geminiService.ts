
import { GoogleGenAI, Type } from "@google/genai";
import { ApiError, ContentError } from '../types';
import { AI_CONFIG, STATIC_FALLBACK_IMAGE_DATA_URI } from '../config';
import { analysisSchema } from "../schemas";
import * as Prompts from '../prompts/registry';
import { AnalysisData } from '../types';

// Per security guidelines, the API key is accessed directly from the execution environment.
// It is assumed to be pre-configured and valid.
if (!process.env.API_KEY) {
    throw new Error("Gemini API key is not configured. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This schema is used by the Gemini API to structure its JSON output.
const analysisApiSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        search_query: { type: Type.STRING },
        crossword_words: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    clue: { type: Type.STRING }
                },
                required: ["word", "clue"]
            }
        },
        error: { type: Type.STRING, nullable: true },
        reason: { type: Type.STRING, nullable: true },
    },
};

export const analyzeArticle = async (
    articleText: string, 
    options: { gradeLevel: string, wordCount: number }
): Promise<AnalysisData> => {
    try {
        const prompt = Prompts.getAnalysisPrompt({ 
            articleText, 
            gradeLevel: options.gradeLevel, 
            wordCount: options.wordCount 
        });

        const result = await ai.models.generateContent({
            model: AI_CONFIG.TEXT_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisApiSchema,
            }
        });
        
        const jsonText = result.text.trim();
        const parsedJson = JSON.parse(jsonText);

        const validationResult = analysisSchema.safeParse(parsedJson);

        if (!validationResult.success) {
            console.error("Zod validation failed:", validationResult.error.flatten());
            throw new ApiError(
                "The AI returned an invalid data structure. Please try regenerating.",
                { cause: validationResult.error }
            );
        }

        const validatedData = validationResult.data;

        if (validatedData.error) {
             const message = validatedData.reason 
                ? `${validatedData.error} Reason: ${validatedData.reason}.`
                : validatedData.error;
             throw new ContentError(message + " Please provide prose content like a story or report.");
        }
        
        if (validatedData.crossword_words) {
            validatedData.crossword_words = validatedData.crossword_words
                .map((item) => ({
                    word: item.word.trim().split(' ')[0].toUpperCase(),
                    clue: item.clue
                }))
                .filter((item) => item.word.length > 2);
        }

        return validatedData as AnalysisData; // Zod refine ensures this is safe
    } catch (err) {
        if (err instanceof ApiError || err instanceof ContentError) {
            throw err;
        }
        console.error("Error analyzing article:", err);
        throw new ApiError('Failed to analyze the article. The AI model returned an error.', { cause: err as Error });
    }
};

export const editForFit = async (summaryText: string, keywords: string[], gradeLevel: string): Promise<string> => {
    try {
        const prompt = Prompts.getEditForFitPrompt({ summaryText, keywords, gradeLevel });

        const result = await ai.models.generateContent({
            model: AI_CONFIG.TEXT_MODEL,
            contents: prompt,
        });

        return result.text.trim();

    } catch (err) {
        console.error("Error editing summary for fit:", err);
        return summaryText;
    }
};

export const generateSvgPlaceholder = async (theme: string): Promise<string> => {
    try {
        const prompt = Prompts.getSvgPlaceholderPrompt({ theme });
        const result = await ai.models.generateContent({
            model: AI_CONFIG.TEXT_MODEL,
            contents: prompt
        });

        const svgContent = result.text.trim();
        if (svgContent.startsWith('<svg') && svgContent.endsWith('</svg>')) {
             // The response is SVG code, so we need to Base64 encode it for use in an <img> src.
             // Using unescape and encodeURIComponent is a common way to handle potential UTF-8 characters.
            const base64Svg = btoa(unescape(encodeURIComponent(svgContent)));
            return `data:image/svg+xml;base64,${base64Svg}`;
        }
        console.warn("Generated content was not a valid SVG:", svgContent);
        throw new Error("Generated content is not a valid SVG.");

    } catch (err) {
        console.error("Error generating SVG placeholder:", err);
        return STATIC_FALLBACK_IMAGE_DATA_URI;
    }
};

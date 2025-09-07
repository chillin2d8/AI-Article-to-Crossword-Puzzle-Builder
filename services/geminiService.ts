import { GoogleGenAI, Type } from "@google/genai";
import { ApiError, ContentError, ComprehensiveAnalysisData, VocabularyValidationResponse, VocabularyReplacementResponse, EnrichedVocabularyItem, WordSearchReplacementResponse, WordSearchVocabularyItem } from '../types';
import { AI_CONFIG, STATIC_FALLBACK_IMAGE_DATA_URI } from '../config';
import { comprehensiveAnalysisSchema, vocabularyValidationSchema, vocabularyReplacementSchema, wordSearchReplacementSchema } from "../schemas";
import * as Prompts from '../prompts/registry';

// Per security guidelines, the API key is accessed directly from the execution environment.
// It is assumed to be pre-configured and valid.
if (!process.env.API_KEY) {
    throw new Error("Gemini API key is not configured. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// This schema is used by the Gemini API to structure its JSON output.
const comprehensiveApiSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        search_query: { type: Type.STRING },
        enriched_vocabulary: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: { 
                    word: { type: Type.STRING }, 
                    clue_type: { type: Type.STRING, enum: ["Definition", "Synonym", "Antonym"] },
                    clue_text: { type: Type.STRING } 
                },
                required: ["word", "clue_type", "clue_text"]
            }
        },
        word_search_vocabulary: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: { 
                    word: { type: Type.STRING }, 
                    clue_type: { type: Type.STRING, enum: ["Definition", "Synonym", "Antonym"] },
                    clue_text: { type: Type.STRING } 
                },
                required: ["word", "clue_type", "clue_text"]
            }
        },
        word_scramble_vocabulary: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    scrambled_word: { type: Type.STRING },
                    clue_type: { type: Type.STRING, enum: ["Definition", "Synonym", "Antonym"] },
                    clue_text: { type: Type.STRING }
                },
                required: ["word", "scrambled_word", "clue_type", "clue_text"]
            }
        },
        error: { type: Type.STRING, nullable: true },
        reason: { type: Type.STRING, nullable: true },
    },
};

const validationApiSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            word: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["appropriate", "inappropriate"] },
            reason: { type: Type.STRING, nullable: true },
        },
        required: ["word", "status"],
    },
};

const replacementApiSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            original_word: { type: Type.STRING },
            replacement_word: { type: Type.STRING },
            replacement_clue_type: { type: Type.STRING, enum: ["Definition", "Synonym", "Antonym"] },
            replacement_clue_text: { type: Type.STRING },
        },
        required: ["original_word", "replacement_word", "replacement_clue_type", "replacement_clue_text"],
    }
};

const performJsonApiCall = async <T>(prompt: string, model: string, apiSchema: object, validationSchema: any): Promise<T> => {
    const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: apiSchema },
    });

    let jsonText = result.text.trim();
    let parsedJson;

    try {
        parsedJson = JSON.parse(jsonText);
    } catch (parseError: any) {
        if (parseError instanceof SyntaxError) {
            console.warn("Initial JSON parse failed. Attempting to repair.", parseError.message);
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonText = jsonMatch[0];
                try {
                    parsedJson = JSON.parse(jsonText);
                } catch (repairError) {
                     console.error("Failed to parse even the repaired JSON string.", repairError);
                     throw new ApiError(
                        "The AI returned a severely malformed JSON response that could not be repaired.",
                        { cause: repairError }
                    );
                }
            } else {
                 throw new ApiError(
                    "The AI returned an invalid data structure that could not be repaired.",
                    { cause: parseError }
                );
            }
        } else {
            throw parseError; // Re-throw other errors
        }
    }


    const validationResult = validationSchema.safeParse(parsedJson);

    if (!validationResult.success) {
        console.error("Zod validation failed after JSON repair:", validationResult.error.flatten());
        throw new ApiError(
            "The AI returned an invalid data structure even after repair.",
            { cause: validationResult.error }
        );
    }
    return validationResult.data as T;
};


export const analyzeArticle = async (
    articleText: string, 
    options: { gradeLevel: string, wordCount: number }
): Promise<ComprehensiveAnalysisData> => {
    try {
        // --- STEP 1: GENERATE INITIAL CONTENT ---
        const initialPrompt = Prompts.getAnalysisPrompt({ 
            articleText, 
            gradeLevel: options.gradeLevel, 
            wordCount: options.wordCount 
        });
        let analysisData = await performJsonApiCall<ComprehensiveAnalysisData>(
            initialPrompt,
            AI_CONFIG.TEXT_MODEL,
            comprehensiveApiSchema,
            comprehensiveAnalysisSchema
        );
        
        if (analysisData.error) {
             const message = analysisData.reason 
                ? `${analysisData.error} Reason: ${analysisData.reason}.`
                : analysisData.error;
             throw new ContentError(message + " Please provide prose content like a story or report.");
        }

        // --- STEP 2: VALIDATE & CORRECT CROSSWORD VOCABULARY ---
        if (analysisData.enriched_vocabulary && analysisData.enriched_vocabulary.length > 0) {
            const wordsToValidate = analysisData.enriched_vocabulary.map(item => item.word);
            const validationPrompt = Prompts.getVocabularyValidationPrompt({ words: wordsToValidate, gradeLevel: options.gradeLevel });
            const validationResult = await performJsonApiCall<VocabularyValidationResponse>(validationPrompt, AI_CONFIG.TEXT_MODEL, validationApiSchema, vocabularyValidationSchema);
            const inappropriateWords = validationResult.filter(v => v.status === 'inappropriate').map(v => v.word);

            if (inappropriateWords.length > 0) {
                console.warn(`Crossword validation failed for: ${inappropriateWords.join(', ')}. Attempting correction.`);
                const replacementPrompt = Prompts.getVocabularyReplacementPrompt({ summary: analysisData.summary!, wordsToReplace: inappropriateWords, gradeLevel: options.gradeLevel });
                const replacements = await performJsonApiCall<VocabularyReplacementResponse>(replacementPrompt, AI_CONFIG.TEXT_MODEL, replacementApiSchema, vocabularyReplacementSchema);
                const replacementMap = new Map(replacements.map(r => [r.original_word.toUpperCase(), r]));
                
                const correctedVocabulary: EnrichedVocabularyItem[] = analysisData.enriched_vocabulary.map(wordObj => {
                    const replacement = replacementMap.get(wordObj.word.toUpperCase());
                    return replacement ? {
                        word: replacement.replacement_word.trim().split(' ')[0].toUpperCase(),
                        clue_type: replacement.replacement_clue_type,
                        clue_text: replacement.replacement_clue_text
                    } : wordObj;
                });
                analysisData.enriched_vocabulary = correctedVocabulary;
            }
        }
        
        // --- STEP 3: VALIDATE & CORRECT WORD SEARCH VOCABULARY ---
        if (analysisData.word_search_vocabulary && analysisData.word_search_vocabulary.length > 0) {
            const wordsToValidate = analysisData.word_search_vocabulary.map(item => item.word);
            const validationPrompt = Prompts.getVocabularyValidationPrompt({ words: wordsToValidate, gradeLevel: options.gradeLevel });
            const validationResult = await performJsonApiCall<VocabularyValidationResponse>(validationPrompt, AI_CONFIG.TEXT_MODEL, validationApiSchema, vocabularyValidationSchema);
            const inappropriateWords = validationResult.filter(v => v.status === 'inappropriate').map(v => v.word);

            if (inappropriateWords.length > 0) {
                 console.warn(`Word Search validation failed for: ${inappropriateWords.join(', ')}. Attempting correction.`);
                const replacementPrompt = Prompts.getWordSearchReplacementPrompt({ summary: analysisData.summary!, wordsToReplace: inappropriateWords, gradeLevel: options.gradeLevel });
                const replacements = await performJsonApiCall<WordSearchReplacementResponse>(replacementPrompt, AI_CONFIG.TEXT_MODEL, replacementApiSchema, wordSearchReplacementSchema);
                const replacementMap = new Map(replacements.map(r => [r.original_word.toUpperCase(), r]));
                
                const correctedVocabulary: WordSearchVocabularyItem[] = analysisData.word_search_vocabulary.map(wordObj => {
                    const replacement = replacementMap.get(wordObj.word.toUpperCase());
                    return replacement ? {
                        word: replacement.replacement_word.trim().split(' ')[0].toUpperCase(),
                        clue_type: replacement.replacement_clue_type,
                        clue_text: replacement.replacement_clue_text
                    } : wordObj;
                });
                analysisData.word_search_vocabulary = correctedVocabulary;
            }
        }


        // Final data cleanup
        if (analysisData.enriched_vocabulary) {
            analysisData.enriched_vocabulary = analysisData.enriched_vocabulary
                .map((item) => ({ ...item, word: item.word.trim().split(' ')[0].toUpperCase() }))
                .filter((item) => item.word.length > 2);
        }
        
        if (analysisData.word_search_vocabulary) {
            analysisData.word_search_vocabulary = analysisData.word_search_vocabulary
                .map((item) => ({ ...item, word: item.word.trim().split(' ')[0].toUpperCase() }))
                .filter((item) => item.word.length > 2);
        }


        return analysisData;

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
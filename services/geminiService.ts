import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A short, engaging title for the article content, like 'The Mystery of Edgar Allan Poe'."
        },
        summary: {
            type: Type.STRING,
            description: "A concise 3-4 sentence summary of the provided article."
        },
        summary_6th_grade: {
            type: Type.STRING,
            description: "A detailed summary of the article, rewritten to be easily understandable by a 6th-grade student. This summary MUST be between 450 and 520 words. Format the summary into distinct paragraphs separated by a newline character (\\n) to improve readability."
        },
        originalGradeLevel: {
            type: Type.STRING,
            description: "An estimation of the reading grade level of the original article provided by the user. E.g., '10th Grade', 'College Level'."
        },
        summaryGradeLevel: {
            type: Type.STRING,
            description: "The reading grade level of the summary you have just generated. This should be '6th Grade'."
        },
        image_prompt_one: {
            type: Type.STRING,
            description: "A detailed prompt for an image generation model to create a vibrant, comic-style illustration for the Crossword page. The prompt must connect the article's theme to a relatable high school context (e.g., social media, school events, teen trends) and describe a specific, visually engaging scene that would appeal to teenagers."
        },
        image_prompt_two: {
            type: Type.STRING,
            description: "A second, DIFFERENT detailed prompt for an image generation model to create a vibrant, comic-style illustration for the Summary page. This prompt must also connect the article's theme to a modern high school experience but should depict a different scene or concept than the first prompt to provide visual variety."
        },
        crossword_words: {
            type: Type.ARRAY,
            description: "A list of 15-20 key terms, names, or concepts from the article, with a corresponding short clue for a crossword puzzle.",
            items: {
                type: Type.OBJECT,
                properties: {
                    word: {
                        type: Type.STRING,
                        description: "A single keyword from the article. Must be one word without spaces."
                    },
                    clue: {
                        type: Type.STRING,
                        description: "A short definition or hint for the keyword, suitable for a crossword clue."
                    }
                },
                required: ["word", "clue"]
            }
        }
    },
    required: ["title", "summary", "summary_6th_grade", "originalGradeLevel", "summaryGradeLevel", "image_prompt_one", "image_prompt_two", "crossword_words"]
};


export const analyzeArticle = async (articleText: string): Promise<AnalysisResult> => {
    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an expert educational content creator. Your task is to analyze the provided article and generate a set of materials based on it.

            Your instructions are:
            1.  **6th-Grade Summary**: Rewrite the article to be easily understandable by a 6th-grade student (around 11-12 years old). This summary MUST be between 450 and 520 words. Use simpler vocabulary, sentence structure, and format it into distinct paragraphs (separated by a newline character) for better readability.
            2.  **Grade Level Analysis**: Estimate the reading grade level of the original article and the new summary you have written.
            3.  **Crossword Content**: Identify 15-20 key terms, names, or concepts. For each, provide a short, simple clue. All keywords must be a single word with no spaces or hyphens.
            4.  **Image Prompts**: Create two distinct prompts for vibrant, comic-book style illustrations that connect the article's main theme to a modern high school student's life. The illustrations should be relatable and visually appealing to teenagers. For example, if the article is about history, depict students reacting to a historical event on social media. If it's about science, show a cool, modern school science fair project related to the topic. The prompts must describe a concrete visual scene that is culturally relevant and engaging for a high school audience.
            5.  **Other Content**: Create a short title and a standard 3-4 sentence summary.

            ARTICLE:
            ---
            ${articleText}
            ---
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            }
        });
        
        const jsonText = result.text.trim();
        const parsedResult = JSON.parse(jsonText);
        
        // Data cleaning: Ensure words are single words and uppercase
        parsedResult.crossword_words = parsedResult.crossword_words
            .map((item: {word: string, clue: string}) => ({
                word: item.word.trim().split(' ')[0].toUpperCase(),
                clue: item.clue
            }))
            .filter((item: {word: string}) => item.word.length > 1); // Remove very short or empty words

        return parsedResult as AnalysisResult;
    } catch (err) {
        console.error("Error analyzing article:", err);
        if (err instanceof Error) {
            throw new Error(`Failed to analyze the article. The AI model returned an error: ${err.message}`);
        }
        throw new Error("Failed to analyze the article due to an unknown error.");
    }
};

export const generateImage = async (prompt: string, aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("Image generation failed, no images returned.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate image. The AI model returned an error: ${error.message}`);
        }
        throw new Error("Failed to generate image due to an unknown error.");
    }
};
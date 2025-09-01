import { z } from 'zod';

// Schema for a single word and clue pair
export const crosswordWordSchema = z.object({
  word: z.string().describe("A single keyword from the article. Must be one word without spaces."),
  clue: z.string().describe("A short definition or hint for the keyword, suitable for a crossword clue."),
});

// Schema for the entire analysis result from the AI
export const analysisSchema = z.object({
  title: z.string().optional().nullable().describe("A short, engaging title for the article content."),
  summary: z.string().optional().nullable().describe("A concise 3-4 sentence summary of the provided article."),
  search_query: z.string().optional().nullable().describe("A high-quality search query (2-4 keywords) for a stock photo website, summarizing the article's visual theme."),
  crossword_words: z.array(crosswordWordSchema).optional().nullable().describe("A list of key terms and clues for the crossword puzzle."),
  // Field to allow the AI to return a structured error for invalid content.
  error: z.string().optional().nullable().describe("An error message if the provided text is not valid prose."),
  reason: z.string().optional().nullable().describe("A brief explanation for why the content was considered invalid."),
}).refine(data => {
    if (data.error && data.error.trim().length > 0) {
        return true;
    }
    const requiredStringFields = ['title', 'summary', 'search_query'];
    for (const field of requiredStringFields) {
        const value = data[field as keyof typeof data];
        if (typeof value !== 'string' || value.trim().length === 0) {
            return false;
        }
    }
    if (!Array.isArray(data.crossword_words)) {
        return false;
    }
    return true;
}, {
    message: "A valid response must contain either a non-empty 'error' field, or all required text fields must be present and non-empty, and 'crossword_words' must be an array.",
});

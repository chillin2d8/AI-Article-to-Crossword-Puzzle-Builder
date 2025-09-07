import { z } from 'zod';

// Schema for a single enriched vocabulary item with a randomized clue type
export const enrichedVocabularySchema = z.object({
  word: z.string().describe("A single keyword from the article. Must be one word without spaces."),
  clue_type: z.enum(["Definition", "Synonym", "Antonym"]).describe("The type of clue provided."),
  clue_text: z.string().describe("The text of the clue (a definition, synonym, or antonym)."),
});

// The Word Search now uses the same enriched format.
export const wordSearchVocabularySchema = enrichedVocabularySchema;

// New schema for Word Scramble vocabulary
export const wordScrambleVocabularySchema = z.object({
  word: z.string().describe("A single keyword from the article."),
  scrambled_word: z.string().describe("A scrambled version of the keyword."),
  clue_type: z.enum(["Definition", "Synonym", "Antonym"]).describe("The type of clue provided."),
  clue_text: z.string().describe("The text of the clue."),
});


// Schema for the entire comprehensive analysis result from the AI
export const comprehensiveAnalysisSchema = z.object({
  title: z.string().optional().nullable().describe("A short, engaging title for the article content."),
  summary: z.string().min(1, "Summary cannot be empty.").describe("A concise summary of the provided article."),
  search_query: z.string().optional().nullable().describe("A high-quality search query (2-4 keywords) for a stock photo website, summarizing the article's visual theme."),
  enriched_vocabulary: z.array(enrichedVocabularySchema).optional().nullable().describe("An enriched list of key terms for the crossword puzzle."),
  word_search_vocabulary: z.array(wordSearchVocabularySchema).optional().nullable().describe("An enriched list of key terms for the word search puzzle."),
  word_scramble_vocabulary: z.array(wordScrambleVocabularySchema).optional().nullable().describe("An enriched list of key terms with scrambled versions for a word scramble puzzle."),
  // Field to allow the AI to return a structured error for invalid content.
  error: z.string().optional().nullable().describe("An error message if the provided text is not valid prose."),
  reason: z.string().optional().nullable().describe("A brief explanation for why the content was considered invalid."),
});

// Schema for validating the AI's vocabulary check response
export const vocabularyValidationSchema = z.array(
    z.object({
        word: z.string(),
        status: z.enum(["appropriate", "inappropriate"]),
        reason: z.string().optional().nullable(),
    })
);

// Schema for validating the AI's vocabulary replacement response (for enriched items)
export const vocabularyReplacementSchema = z.array(
    z.object({
        original_word: z.string(),
        replacement_word: z.string(),
        replacement_clue_type: z.enum(["Definition", "Synonym", "Antonym"]),
        replacement_clue_text: z.string(),
    })
);

// New schema for validating Word Search replacements
export const wordSearchReplacementSchema = vocabularyReplacementSchema;
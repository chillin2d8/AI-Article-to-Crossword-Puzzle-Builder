// Strongly-typed parameters for our prompt functions
interface AnalysisPromptParams {
  articleText: string;
  gradeLevel: string;
  wordCount: number;
}

interface EditForFitPromptParams {
  summaryText: string;
  keywords: string[];
  gradeLevel: string;
}

interface SvgPlaceholderPromptParams {
  theme: string;
}

interface VocabularyValidationParams {
    words: string[];
    gradeLevel: string;
}

interface VocabularyReplacementParams {
    summary: string;
    wordsToReplace: string[];
    gradeLevel: string;
}

/**
 * Generates the main prompt for analyzing an article and creating educational content.
 */
export const getAnalysisPrompt = ({ articleText, gradeLevel, wordCount }: AnalysisPromptParams): string => {
  let gradeLevelInstruction = '';
  if (gradeLevel === '3') {
    gradeLevelInstruction = `
**Special Instruction for 3rd Grade Vocabulary:**
It is absolutely CRITICAL that the words selected for all vocabulary lists are appropriate for a 3rd-grade reading level (typically 8-9 year olds). You MUST choose the simplest, most common, and concrete nouns or verbs from the text.

- **DO:** Select words like 'animal', 'family', 'school', 'happy', 'run'.
- **DO NOT:** Select abstract concepts, multi-syllable words, or specialized terms (e.g., 'democracy', 'photosynthesis', 'meticulous').
- **PRIORITIZE:** If the text has complex words, find simpler, related words instead. The goal is accessibility for young learners, not a comprehensive vocabulary test.
This rule applies to all vocabulary sections below.
`;
  }


  return `You are an expert educational content creator for a tool called PLAY (Puzzle Learning Aids for Youth). Your task is to analyze the provided article and generate a comprehensive JSON object containing a variety of educational materials.

**CRITICAL First Step: Content Validation**
Analyze the provided text to determine if it is prose (like an article, story, or report). If the text is source code, a list, a recipe, or other non-prose content, you MUST respond with a JSON object where the 'error' field is set to "The provided text is not a valid article." and the 'reason' field explains why (e.g., "The text appears to be computer source code."). For all other required fields, provide placeholder values like "N/A" for strings and empty arrays for lists.

If the text IS valid prose, proceed with the following instructions to generate the full JSON object.

**CRITICAL Data Integrity Rule:**
For any successful response (i.e., when the 'error' field is null or absent), all other fields in the schema MUST be populated with meaningful, non-empty content and correctly formatted arrays.

**JSON Generation Instructions:**

1.  **Title**: Create a short, engaging title for the article content.

2.  **Summary**:
    - **Content:** Rewrite the article to be easily understandable by a ${gradeLevel}th-grade student. This summary MUST be a minimum of 250 words and structured into distinct paragraphs (separated by a newline character '\\n').
    - **Tone:** Use a direct, informative, and engaging third-person narrative tone. **Crucially, DO NOT refer to the source article.** Avoid phrases like "The article explains..." or any meta-commentary.

3.  **Search Query**: Generate a high-quality search query (2-4 keywords) suitable for a stock photo website, capturing the visual essence of the article.
${gradeLevelInstruction}
4.  **Enriched Vocabulary (for Crossword)**:
    - **Content**: Identify ${wordCount} key terms from the article. For each, provide the single most effective clue.
    - **Clue Type Randomization**: You MUST randomly choose the clue type for each word from one of the following: "Definition", "Synonym", or "Antonym".
    - **Format**: An array of objects, each with "word", "clue_type", and "clue_text".
    - **Constraint**: All words must be single words without spaces or hyphens.

5.  **Word Search Vocabulary**:
    - **Content**: Identify a separate list of ${wordCount} key terms from the article suitable for a Word Search.
    - **Clue Type Randomization**: You MUST randomly choose the clue type for each word from one of the following: "Definition", "Synonym", or "Antonym".
    - **Format**: An array of objects, each with "word", "clue_type", and "clue_text".
    - **Constraint**: All words must be single words without spaces or hyphens.

6.  **Word Scramble Vocabulary**:
    - **Content**: Identify a separate list of ${wordCount} key terms from the article suitable for a Word Scramble. For each word, you MUST provide a scrambled version of it that is not the same as the original word.
    - **Clue Type Randomization**: You MUST randomly choose the clue type for each word from one of the following: "Definition", "Synonym", or "Antonym".
    - **Format**: An array of objects, each with "word", "scrambled_word", "clue_type", and "clue_text".
    - **Constraint**: All words must be single words without spaces or hyphens.

**CRITICAL FINAL CHECK:** For valid prose input, the 'title', 'summary', and 'search_query' fields MUST be populated. Do not leave them empty or null.

ARTICLE TO ANALYZE:
---
${articleText}
---
`;
};

/**
 * Generates a prompt to validate vocabulary against a specific grade level.
 */
export const getVocabularyValidationPrompt = ({ words, gradeLevel }: VocabularyValidationParams): string => {
    const wordList = JSON.stringify(words);
    return `You are an expert in pedagogy and vocabulary development for K-12 students.
    
    Your task is to analyze the following list of words and determine if each one is appropriate for a typical ${gradeLevel}th-grade student's vocabulary level.
    
    **Instructions:**
    - Review each word in the provided list.
    - For each word, classify its status as either "appropriate" or "inappropriate".
    - If a word is "inappropriate", provide a brief "reason" (e.g., "Too complex", "Advanced concept", "Rarely used").
    - You MUST respond with a JSON array of objects, where each object has "word", "status", and an optional "reason".
    
    Word List to Validate:
    ${wordList}`;
};

/**
 * Generates a prompt to find grade-appropriate replacements for a list of words.
 */
export const getVocabularyReplacementPrompt = ({ summary, wordsToReplace, gradeLevel }: VocabularyReplacementParams): string => {
    const wordList = JSON.stringify(wordsToReplace);
    return `You are an expert educational content creator specializing in simplifying complex topics for a ${gradeLevel}th-grade audience.
    
    The following list of words has been deemed too difficult for a ${gradeLevel}th-grade student. Your task is to provide simpler, grade-appropriate replacements that are contextually relevant to the provided summary.
    
    **Instructions:**
    1.  Read the summary to understand the context.
    2.  For each "original_word" in the list below, find a suitable "replacement_word".
    3.  The "replacement_word" MUST be a single word without spaces or hyphens.
    4.  Create a single, high-quality clue for the new word. You MUST randomly choose the clue type from "Definition", "Synonym", or "Antonym".
    5.  You MUST respond with a JSON array of objects, where each object contains the "original_word", the "replacement_word", the "replacement_clue_type", and the "replacement_clue_text".
    
    Summary for Context:
    ---
    ${summary}
    ---
    
    Words to Replace:
    ${wordList}`;
};

// A new, dedicated replacement prompt for the word search
export const getWordSearchReplacementPrompt = getVocabularyReplacementPrompt;


/**
 * Generates the prompt for the "AI Typesetter" to shorten a summary while preserving keywords.
 */
export const getEditForFitPrompt = ({ summaryText, keywords, gradeLevel }: EditForFitPromptParams): string => {
  const keywordList = keywords.join(', ');
  return `You are a professional typesetter and editor. Your task is to revise a given text to ensure it fits perfectly on a single printed page.

    The following summary is slightly too long. You must rewrite it to be approximately 10-15% shorter.

    **CRITICAL INSTRUCTIONS:**
    1.  **Preserve Meaning:** Do not lose any key information.
    2.  **Maintain Reading Level:** The text is written for a ${gradeLevel}th-grade reading level. Your revision MUST maintain this clarity.
    3.  **PRESERVE KEYWORDS:** The following keywords are answers in a crossword puzzle based on this text. You MUST ensure that every single one of these words is present in the final shortened summary.
        **Keywords to preserve:** ${keywordList}

    ORIGINAL SUMMARY:
    ---
    ${summaryText}
    ---

    Return ONLY the rewritten, shortened summary.`;
};

/**
 * Generates the prompt for creating a fallback SVG placeholder image.
 */
export const getSvgPlaceholderPrompt = ({ theme }: SvgPlaceholderPromptParams): string => {
  return `You are an expert SVG generator. Based on the following theme, create a visually appealing, abstract, geometric SVG image.
    
    Theme: "${theme}"

    **Instructions:**
    - The SVG MUST be 400x300 pixels.
    - Use a colorful and modern palette.
    - Keep the design simple and abstract.
    - **IMPORTANT**: Your entire response must be ONLY the SVG code, starting with \`<svg ...>\` and ending with \`</svg>\`. Do not include any other text, explanations, or markdown fences.`;
};
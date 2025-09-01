

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

/**
 * Generates the main prompt for analyzing an article and creating educational content.
 */
export const getAnalysisPrompt = ({ articleText, gradeLevel, wordCount }: AnalysisPromptParams): string => {
  return `You are an expert educational content creator. Your task is to analyze the provided article and generate a set of materials based on it.

    **CRITICAL First Step:**
    Analyze the provided text to determine if it is prose (like an article, story, or report). If the text appears to be source code, a list of items, a recipe, or other non-prose content, you MUST respond with a JSON object that strictly adheres to the schema. The 'error' field must be set to "The provided text is not a valid article." and the 'reason' field must explain why (e.g., "The text appears to be computer source code."). For all other required string fields in the schema (like 'title', 'summary'), you MUST provide a placeholder value such as "N/A". For the 'crossword_words' array, provide an empty array.
    
    If the text IS valid prose, proceed with the following instructions:

    **CRITICAL Data Integrity Rule:** For any successful response (i.e., when the 'error' field is null or absent), all other string fields in the schema ('title', 'summary', 'search_query') MUST be populated with meaningful, non-empty text. The 'crossword_words' array MUST also be present. Failure to adhere to this will result in a rejected response.

    Your instructions are:
    1.  **Summary**:
        - **Content:** Rewrite the article to be easily understandable by a ${gradeLevel}th-grade student. This summary MUST be a minimum of 250 words. It should be substantial and well-structured. Format it into distinct paragraphs (separated by a newline character) for better readability.
        - **Tone and Voice:** Write the summary in a direct, informative, and engaging third-person narrative tone. Present the information as established facts. **Crucially, DO NOT refer to the source article.** Avoid phrases like "The article explains...", "The author discusses...", or any meta-commentary.
    2.  **Crossword Content**: Identify ${wordCount} key terms, names, or concepts. For each, provide a short, simple clue. All keywords must be a single word with no spaces or hyphens.
    3.  **Search Query**: Based on the article's central theme, generate a high-quality search query (2-4 keywords) suitable for a stock photo website like Pexels or Unsplash. This query should capture the visual essence of the article. For example, for an article about space exploration, a good query would be "rocket launch space night".
    4.  **Title**: Create a short, engaging title for the article content.

    ARTICLE:
    ---
    ${articleText}
    ---
    `;
};

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
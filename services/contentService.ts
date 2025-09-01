import { ContentError } from '../types';

const fetchWithTimeout = (
    resource: RequestInfo | URL,
    options: RequestInit & { timeout?: number } = {}
): Promise<Response> => {
    const { timeout = 10000 } = options; // Default to 10 seconds for content fetching

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const request = fetch(resource, {
        ...options,
        signal: controller.signal
    });

    return new Promise((resolve, reject) => {
        request.then(response => {
            clearTimeout(id);
            resolve(response);
        }).catch(error => {
            clearTimeout(id);
            reject(error);
        });
    });
};

const isValidUrl = (text: string): boolean => {
    try {
        // A simple check for http/https in a well-formed URL
        const url = new URL(text);
        return ['http:', 'https:'].includes(url.protocol);
    } catch (_) {
        return false;
    }
};

const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Takes a source string, determines if it's a URL or plain text.
 * If it's a URL, it fetches and extracts the main article text.
 * If it's plain text, it returns it directly.
 * @param source The user-provided string (either text or a URL).
 * @param updateProgress A callback to update the UI loading status.
 * @returns A promise that resolves to the article's text content.
 */
export const getContent = async (
    source: string,
    updateProgress?: (stage: string, message: string) => void
): Promise<string> => {
    if (!isValidUrl(source)) {
        updateProgress?.('Content', 'Processing text...');
        return source;
    }

    try {
        updateProgress?.('Content', 'Fetching from URL...');
        // Use the robust fetchWithTimeout utility
        const response = await fetchWithTimeout(`${CORS_PROXY}${encodeURIComponent(source)}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        updateProgress?.('Content', 'Extracting article...');
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // A comprehensive list of selectors for common non-article elements to remove.
        const selectorsToRemove = [
            'script', 'style', 'nav', 'header', 'footer', 'aside',
            '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
            '.ad', '.advert', '.popup', '.menu', '.nav', '.sidebar', '#sidebar',
            '.related-posts', '.comments', '#comments'
        ];
        doc.querySelectorAll(selectorsToRemove.join(', ')).forEach(el => el.remove());


        // Simple heuristic: try to find common article containers, otherwise fall back to body.
        const articleNode = doc.querySelector('article, [role="main"], #main, #content, .main, .post-body, .article-body');
        const textContent = ((articleNode || doc.body) as HTMLElement).innerText;

        // Cleanup of excessive whitespace, preserving paragraph breaks.
        const cleanedText = textContent.replace(/\s\s+/g, '\n').trim();

        if (cleanedText.length < 200) { // Arbitrary threshold for a meaningful article.
            throw new Error('Extracted content is too short to be a valid article.');
        }

        return cleanedText;

    } catch (err) {
        console.error("Error fetching or parsing URL content:", err);
        const cause = err instanceof Error ? err.message : 'Unknown error';
        throw new ContentError(
            `Could not retrieve a valid article from the provided URL. Reason: ${cause}`,
            { cause: err }
        );
    }
};
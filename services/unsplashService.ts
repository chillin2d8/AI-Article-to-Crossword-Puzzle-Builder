
import { ImageSearchResult, UnsplashSearchResponse } from "../types";
import { API_KEYS } from "../config";

const API_BASE_URL = 'https://api.unsplash.com';

export const searchUnsplashImages = async (query: string, page: number = 1): Promise<ImageSearchResult[]> => {
    const apiKey = API_KEYS.UNSPLASH;
    if (!apiKey) {
        throw new Error("Unsplash API key is not configured. Please set the UNSPLASH_API_KEY environment variable.");
    }
    
    const url = new URL(`${API_BASE_URL}/search/photos`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', String(page));
    url.searchParams.append('per_page', '4'); // 4-panel display
    url.searchParams.append('client_id', apiKey);

    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
        }
        
        const data: UnsplashSearchResponse = await response.json();
        
        // Normalize the Unsplash response to our common ImageSearchResult format
        return data.results.map(photo => ({
            id: photo.id,
            url_small: photo.urls.small,
            url_full: photo.urls.regular, // Use regular size for final output
            description: photo.alt_description || 'An image from Unsplash',
            user_name: photo.user.name,
            user_link: photo.user.links.html,
        }));

    } catch (err) {
        console.error("Failed to fetch from Unsplash:", err);
        throw err;
    }
};
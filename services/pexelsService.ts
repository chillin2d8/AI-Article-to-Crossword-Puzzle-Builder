
import { ImageSearchResult, PexelsSearchResponse } from "../types";
import { API_KEYS } from "../config";

const API_BASE_URL = 'https://api.pexels.com/v1';

export const searchPexelsImages = async (query: string, page: number = 1): Promise<ImageSearchResult[]> => {
    const apiKey = API_KEYS.PEXELS;
    if (!apiKey) {
        throw new Error("Pexels API key is not configured. Please set the PEXELS_API_KEY environment variable.");
    }

    const url = new URL(`${API_BASE_URL}/search`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', String(page));
    url.searchParams.append('per_page', '4'); // 4-panel display
    
    try {
        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': apiKey,
            }
        });

        if (!response.ok) {
            throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
        }
        
        const data: PexelsSearchResponse = await response.json();
        
        // Normalize the Pexels response to our common ImageSearchResult format
        return data.photos.map(photo => ({
            id: photo.id,
            url_small: photo.src.medium,
            url_full: photo.src.original, // Use original size for final output
            description: photo.alt || 'A photo from Pexels',
            user_name: photo.photographer,
            user_link: photo.photographer_url,
        }));

    } catch (err) {
        console.error("Failed to fetch from Pexels:", err);
        throw err;
    }
};

export const getSinglePexelsImage = async (query: string): Promise<string> => {
    const results = await searchPexelsImages(query, 1);
    if (results.length === 0) {
        throw new Error("No images found for the free tier generation.");
    }
    // Return the full URL of the first image
    return results[0].url_full;
}

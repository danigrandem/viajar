import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

interface SearchResult {
    file: string;
    chunkIndex: number;
    text: string;
    similarity: number;
}

export async function searchContent(query: string): Promise<SearchResult[]> {
    try {
        const response = await axios.post(`${API_URL}/search`, { query });
        return response.data;
    } catch (error) {
        console.error('Error searching content:', error);
        throw error;
    }
} 
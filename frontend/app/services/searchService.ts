import axios from 'axios';


interface SearchResult {
    file: string;
    chunkIndex: number;
    text: string;
    similarity: number;
}

export async function searchContent(query: string): Promise<SearchResult[]> {
    try {
        const response = await axios.post(`/api/search`, { query });
        return response.data;
    } catch (error) {
        console.error('Error searching content:', error);
        throw error;
    }
} 
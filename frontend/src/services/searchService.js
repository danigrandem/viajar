import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const searchContent = async (query) => {
  try {
    const response = await axios.post(`+/api/search`, { query });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}; 
import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import { searchContent } from '../services/searchService';

export default function SearchPage() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    try {
      const searchResults = await searchContent(query);
      setResults(searchResults);
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
        Philippines Travel Search
      </h1>
      
      <div className="max-w-2xl mx-auto">
        <SearchBar onSearch={handleSearch} />
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <SearchResults results={results} isLoading={isLoading} />
      </div>
    </div>
  );
} 
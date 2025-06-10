import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import Chat from '../components/Chat';
import { searchContent } from '../services/searchService';
import { sendChatMessage } from '../services/chatService';

interface SearchResult {
  file: string;
  chunkIndex: number;
  text: string;
  similarity: number;
}

export function meta() {
  return [
    { title: "Viajar por Filipinas - Búsqueda Semántica" },
    { name: "description", content: "Busca información detallada sobre viajes a Filipinas usando IA" },
  ];
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'chat'>('chat');

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const searchResults = await searchContent(query);
      setResults(searchResults);
      setSearchParams({ search: query });
    } catch (err) {
      setError('Error al realizar la búsqueda. Por favor, intenta de nuevo.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatMessage = async (message: string, sessionId: string, onChunk: (chunk: string) => void): Promise<void> => {
    try {
      await sendChatMessage(message, sessionId, onChunk);
    } catch (err) {
      console.error('Chat error:', err);
      throw err;
    }
  };

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Viajar por Filipinas
          </h1>
          <p className="text-xl text-gray-600">
            Descubre información detallada sobre Filipinas usando búsqueda semántica
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="hidden flex border-b border-gray-200 mb-8">
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'search'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('search')}
            >
              Búsqueda
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'chat'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
          </div>

          {activeTab === 'search' ? (
            <>
              <SearchBar
                onSearch={handleSearch}
                initialValue={searchParams.get('search') || ''}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <SearchResults results={results} isLoading={isLoading} />
            </>
          ) : (
            <Chat onSendMessage={handleChatMessage} />
          )}
        </div>
      </div>
    </div>
  );
}

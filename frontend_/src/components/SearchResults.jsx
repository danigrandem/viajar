export default function SearchResults({ results, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Searching...</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        No results found. Try a different search query.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result, index) => (
        <div key={`${result.file}-${result.chunkIndex}`} className="result-card bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-2">
            <span className="file-name">{result.file}</span>
            <span className="similarity-score">
              {(result.similarity * 100).toFixed(1)}% match
            </span>
          </div>
          <p className="text-preview">{result.text}</p>
        </div>
      ))}
    </div>
  );
} 
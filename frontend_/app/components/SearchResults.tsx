import { DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface SearchResult {
    file: string;
    chunkIndex: number;
    text: string;
    similarity: number;
}

interface SearchResultsProps {
    results: SearchResult[];
    isLoading: boolean;
}

export default function SearchResults({ results, isLoading }: SearchResultsProps) {
    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 text-lg">Buscando información...</p>
            </div>
        );
    }

    if (!results || results.length === 0) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <DocumentTextIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">No se encontraron resultados</h3>
                <p className="text-yellow-600">Intenta con una búsqueda diferente o más específica.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Resultados de la búsqueda</h2>
                <span className="text-sm text-gray-500">{results.length} resultados encontrados</span>
            </div>
            {results.map((result) => (
                <div
                    key={`${result.file}-${result.chunkIndex}`}
                    className="result-card bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                            <span className="file-name font-medium text-gray-700">{result.file}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                            <ChartBarIcon className="h-4 w-4 text-blue-500" />
                            <span className="similarity-score text-sm font-medium text-blue-600">
                                {(result.similarity * 100).toFixed(1)}% relevancia
                            </span>
                        </div>
                    </div>
                    <p className="text-preview text-gray-600 leading-relaxed">{result.text}</p>
                </div>
            ))}
        </div>
    );
} 
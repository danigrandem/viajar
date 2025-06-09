import { useState } from 'react';
import type { FormEvent } from 'react';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
    onSearch: (query: string) => void;
    initialValue?: string;
}

export default function SearchBar({ onSearch, initialValue = '' }: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);
    const [isTyping, setIsTyping] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-800">Búsqueda Semántica</h2>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setIsTyping(true);
                                setTimeout(() => setIsTyping(false), 1000);
                            }}
                            placeholder="Busca información sobre viajes a Filipinas..."
                            className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
                    >
                        <MagnifyingGlassIcon className="h-5 w-5" />
                        Buscar
                    </button>
                </div>
            </form>
            {isTyping && (
                <div className="mt-2 text-sm text-gray-500">
                    Escribe para buscar información sobre Filipinas...
                </div>
            )}
        </div>
    );
} 
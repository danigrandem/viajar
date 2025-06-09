document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');

    // Function to perform search
    async function performSearch(query) {
        try {
            loadingDiv.classList.remove('hidden');
            resultsDiv.innerHTML = '';

            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const results = await response.json();
            displayResults(results);
        } catch (error) {
            console.error('Search error:', error);
            resultsDiv.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    An error occurred while searching. Please try again.
                </div>
            `;
        } finally {
            loadingDiv.classList.add('hidden');
        }
    }

    // Function to display results
    function displayResults(results) {
        if (results.length === 0) {
            resultsDiv.innerHTML = `
                <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    No results found. Try a different search query.
                </div>
            `;
            return;
        }

        resultsDiv.innerHTML = results.map((result, index) => `
            <div class="result-card bg-white rounded-lg shadow-md p-6">
                <div class="flex justify-between items-start mb-2">
                    <span class="file-name">${result.file}</span>
                    <span class="similarity-score">${(result.similarity * 100).toFixed(1)}% match</span>
                </div>
                <p class="text-preview">${result.text}</p>
            </div>
        `).join('');
    }

    // Event listeners
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    });
}); 
let chatContext = [];

async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message) return;

    // Add user message to chat
    addMessageToChat('user', message);
    messageInput.value = '';

    try {
        // Get chat response
        const chatResponse = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context: chatContext })
        });
        const chatData = await chatResponse.json();

        // Add assistant response to chat
        addMessageToChat('assistant', chatData.response);
        
        // Update context
        chatContext.push({ role: 'user', content: message });
        chatContext.push({ role: 'assistant', content: chatData.response });

        // Get search results
        const searchResponse = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: message })
        });
        const searchData = await searchResponse.json();

        // Display search results
        displaySearchResults(searchData);
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('error', 'Lo siento, ha ocurrido un error.');
    }
}

function addMessageToChat(role, content) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-4 ${role === 'user' ? 'text-right' : ''}`;
    messageDiv.innerHTML = `
        <div class="inline-block p-3 rounded-lg ${
            role === 'user' ? 'bg-blue-500 text-white' : 
            role === 'error' ? 'bg-red-500 text-white' : 
            'bg-gray-200'
        }">
            ${content}
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = results.map(result => `
        <div class="mb-4 p-4 border rounded-lg">
            <h3 class="font-bold">${result.file}</h3>
            <p class="text-gray-600">${result.text.substring(0, 200)}...</p>
            <div class="text-sm text-gray-500">
                Similitud: ${(result.similarity * 100).toFixed(2)}%
            </div>
        </div>
    `).join('');
}

// Event Listeners
document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
}); 
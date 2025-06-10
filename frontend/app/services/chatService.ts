import axios from 'axios';

interface ChatResponse {
    response: string;
}

interface StreamChunk {
    chunk?: string;
    done?: boolean;
    error?: string;
}


export async function sendChatMessage(
    message: string,
    sessionId: string,
    onChunk: (chunk: string) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        const eventSource = new EventSource(`/api/chat?message=${encodeURIComponent(message)}&sessionId=${sessionId}`);

        let fullResponse = '';

        eventSource.onmessage = (event) => {
            const data: StreamChunk = JSON.parse(event.data);

            if (data.error) {
                eventSource.close();
                reject(new Error(data.error));
                return;
            }

            if (data.chunk) {
                fullResponse += data.chunk;
                onChunk(data.chunk);
            }

            if (data.done) {
                eventSource.close();
                resolve(fullResponse);
            }
        };

        eventSource.onerror = (error) => {
            eventSource.close();
            reject(error);
        };
    });
} 
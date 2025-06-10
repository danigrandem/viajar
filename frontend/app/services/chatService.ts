import axios from 'axios';

interface ChatResponse {
    response: string;
}

export async function sendChatMessage(message: string, sessionId: string): Promise<string> {
    try {
        const { data } = await axios.post<ChatResponse>(`/api/chat`, {
            message,
            sessionId
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return data.response;
    } catch (error) {
        console.error('Error sending chat message:', error);
        throw error;
    }
} 
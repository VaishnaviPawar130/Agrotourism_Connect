import { api } from './api';
import type { ChatResponse } from '../components/chatbot/chatbot.types';

/**
 * Send a single public chatbot message to our backend.
 *
 * The frontend only ever talks to our own API (`/api/v1/chat`); the OpenRouter
 * call and its key live server-side. Conversation history is kept in React state
 * for display only and is intentionally not sent yet.
 */
export async function sendChatMessage(message: string): Promise<string> {
  const res = await api.post<ChatResponse>('/chat', { message });
  return res.data?.data?.reply ?? '';
}

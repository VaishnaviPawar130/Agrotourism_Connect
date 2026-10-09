import { api } from './api';
import type { ChatResponse } from '../components/chatbot/chatbot.types';

/**
 * Send a single public chatbot message to our backend.
 *
 * The frontend only ever talks to our own API (`/api/v1/chat`); the OpenRouter
 * call and its key live server-side. Recent user questions provide topic context.
 */
export async function sendChatMessage(message: string, history: string[] = []): Promise<string> {
  const res = await api.post<ChatResponse>('/chat', { message, history: history.slice(-6) });
  return res.data?.data?.reply ?? '';
}

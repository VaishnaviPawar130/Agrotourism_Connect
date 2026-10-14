export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

/** Request body accepted by POST /api/v1/chat. */
export interface ChatRequest {
  message: string;
}

/** Successful response shape from POST /api/v1/chat. */
export interface ChatResponse {
  success: boolean;
  message: string;
  data: {
    reply: string;
  };
}

/** Shared limit, kept consistent with the backend controller validation. */
export const MAX_MESSAGE_LENGTH = 1000;

export const WELCOME_MESSAGE =
  "Hello! I’m the Agrotourism Connect AI Assistant. I can help you with agro tourism, land development, feasibility, public projects, investment opportunities and general enquiries.";

export const GENERIC_ERROR_MESSAGE =
  "Sorry, I’m unable to respond right now. Please try again.";

/** One-tap starter prompts shown under the welcome message. */
export const SUGGESTION_CHIPS: readonly string[] = [
  'Explore Agro Tourism',
  'Check Feasibility',
  'Public Projects',
  'Investment Opportunities',
];

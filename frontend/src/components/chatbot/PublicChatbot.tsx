import { useCallback, useRef, useState } from 'react';
import { ChatbotButton } from './ChatbotButton';
import { ChatbotWindow } from './ChatbotWindow';
import {
  GENERIC_ERROR_MESSAGE,
  WELCOME_MESSAGE,
  type ChatMessage,
} from './chatbot.types';
import { sendChatMessage } from '../../services/chatbotService';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const welcome: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: WELCOME_MESSAGE,
};

/**
 * Self-contained public chatbot: a floating launcher plus a popup window.
 * Mounted once in PublicLayout so it appears on every public page and nowhere
 * in the authenticated dashboards. Recent user questions are sent as topic
 * context; assistant replies remain display-only.
 */
export function PublicChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [isSending, setIsSending] = useState(false);
  const sendingRef = useRef(false);

  const handleSend = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 1000 || sendingRef.current) return;
    sendingRef.current = true;
    setIsSending(true);

    setMessages((prev) => [
      ...prev,
      { id: createId(), role: 'user', content: trimmed },
    ]);

    try {
      const history = messages.filter((item) => item.role === 'user').slice(-6).map((item) => item.content);
      const reply = await sendChatMessage(trimmed, history);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content: reply.trim() || GENERIC_ERROR_MESSAGE,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: createId(), role: 'assistant', content: GENERIC_ERROR_MESSAGE },
      ]);
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  }, [messages]);

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 top-24 z-50 flex flex-col items-end justify-end gap-2.5 sm:bottom-5 sm:right-5 sm:top-28">
      {open && (
        <div className="pointer-events-auto flex min-h-0 w-full justify-end">
          <ChatbotWindow
            messages={messages}
            isSending={isSending}
            onSend={handleSend}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
      <div className="pointer-events-auto">
        <ChatbotButton open={open} onClick={() => setOpen((o) => !o)} />
      </div>
    </div>
  );
}

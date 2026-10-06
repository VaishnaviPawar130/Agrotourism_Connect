import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Send, Sprout, X } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import {
  MAX_MESSAGE_LENGTH,
  SUGGESTION_CHIPS,
  type ChatMessage as ChatMessageType,
} from './chatbot.types';

interface ChatbotWindowProps {
  messages: ChatMessageType[];
  isSending: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-forest/10 text-brand-forest">
        <Sprout className="h-4 w-4" />
      </span>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-brand-border bg-white px-3.5 py-3 shadow-sm">
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-forest/50 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-forest/50 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-forest/50" />
      </div>
    </div>
  );
}

export function ChatbotWindow({
  messages,
  isSending,
  onSend,
  onClose,
}: ChatbotWindowProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const trimmed = input.trim();
  const canSend = trimmed.length > 0 && trimmed.length <= MAX_MESSAGE_LENGTH && !isSending;
  // Chips only make sense before the visitor has said anything.
  const showSuggestions = messages.filter((m) => m.role === 'user').length === 0;

  function handleSend() {
    if (!canSend) return;
    onSend(trimmed);
    setInput('');
  }

  function handleSuggestion(text: string) {
    if (isSending) return;
    onSend(text);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Agrotourism Connect AI Tourism Assistant"
      className="animate-chatbot-window-in flex h-[540px] max-h-[calc(100dvh-9.5rem)] w-[384px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-brand-border bg-brand-cream shadow-[0_16px_48px_-16px_rgba(20,55,42,0.28)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-brand-forest to-brand-deep px-3.5 py-2.5 text-white">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/15">
            <Sprout className="h-4 w-4 text-brand-goldSoft" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight">Agrotourism Connect</p>
            <span className="flex items-center gap-1.5 text-[11px] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              AI Tourism Assistant
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="-mr-1 rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="chatbot-scroll flex-1 space-y-2.5 overflow-y-auto bg-gradient-to-b from-brand-offwhite to-brand-cream px-3.5 py-3"
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {showSuggestions && (
          <div className="pt-0.5">
            <p className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-brand-slate">
              Try asking about
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSuggestion(chip)}
                  disabled={isSending}
                  className="rounded-full border border-brand-forest/25 bg-white px-2.5 py-1 text-[11px] font-medium text-brand-forest shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-forest hover:bg-brand-forest hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {isSending && <TypingIndicator />}
      </div>

      {/* Composer */}
      <div className="border-t border-brand-border bg-white px-3 pb-1.5 pt-2.5">
        <div className="flex items-end gap-2 rounded-xl border border-brand-border bg-brand-offwhite p-1 focus-within:border-brand-forest focus-within:ring-1 focus-within:ring-brand-forest">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Ask about agro tourism, projects, feasibility..."
            className="max-h-24 min-h-[2rem] flex-1 resize-none bg-transparent px-2.5 py-1.5 text-[13px] text-brand-charcoal placeholder:text-brand-slate/70 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-forest text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-1"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1 text-center text-[10.5px] text-brand-slate">
          AI Assistant • Public information only
        </p>
      </div>
    </div>
  );
}

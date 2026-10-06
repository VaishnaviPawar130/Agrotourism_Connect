import { Fragment, type ReactNode } from 'react';
import { Sprout } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from './chatbot.types';

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * Minimal, safe renderer for the light Markdown the assistant tends to return
 * (**bold**, *italic*, `code`, `# headings`, and `-`/`1.` lists). We deliberately
 * avoid pulling in a full Markdown dependency for the first version. All text is
 * rendered through React children, so nothing is injected as raw HTML.
 */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={`${keyPrefix}-t-${i}`}>{text.slice(lastIndex, match.index)}</Fragment>);
      i += 1;
    }
    if (match[2] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b-${i}`}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      nodes.push(<em key={`${keyPrefix}-i-${i}`}>{match[3]}</em>);
    } else if (match[4] !== undefined) {
      nodes.push(
        <code
          key={`${keyPrefix}-c-${i}`}
          className="rounded bg-brand-forest/10 px-1.5 py-0.5 font-mono text-[0.82em] text-brand-forest"
        >
          {match[4]}
        </code>,
      );
    }
    i += 1;
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(<Fragment key={`${keyPrefix}-t-${i}`}>{text.slice(lastIndex)}</Fragment>);
  }

  return nodes;
}

function renderContent(content: string): ReactNode {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let listItems: ReactNode[] = [];
  let listKey = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`ul-${listKey}`} className="my-1.5 list-disc space-y-1 pl-5 marker:text-brand-forest/60">
        {listItems}
      </ul>,
    );
    listItems = [];
    listKey += 1;
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trimEnd();
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.*)$/);

    if (heading) {
      flushList();
      blocks.push(
        <p key={`h-${index}`} className="mb-1 mt-2 text-[0.95em] font-semibold text-brand-charcoal first:mt-0">
          {renderInline(heading[2], `h-${index}`)}
        </p>,
      );
      return;
    }

    if (bullet || ordered) {
      const itemText = (bullet ? bullet[1] : ordered![1]) ?? '';
      listItems.push(
        <li key={`li-${index}`} className="pl-1 leading-relaxed">
          {renderInline(itemText, `li-${index}`)}
        </li>,
      );
      return;
    }

    flushList();

    if (line.trim() === '') {
      blocks.push(<div key={`sp-${index}`} className="h-1.5" />);
      return;
    }

    blocks.push(
      <p key={`p-${index}`} className="whitespace-pre-wrap leading-relaxed">
        {renderInline(line, `p-${index}`)}
      </p>,
    );
  });

  flushList();
  return blocks;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[84%] rounded-2xl rounded-br-md bg-brand-forest px-3.5 py-2 text-[13px] leading-relaxed text-white shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-forest/10 text-brand-forest">
        <Sprout className="h-3.5 w-3.5" />
      </span>
      <div className="max-w-[84%] rounded-2xl rounded-tl-md border border-brand-border bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-brand-charcoal shadow-sm">
        <div className="space-y-1.5">{renderContent(message.content)}</div>
      </div>
    </div>
  );
}

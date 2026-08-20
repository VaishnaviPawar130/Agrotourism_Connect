import { ReactNode } from 'react';
import { Search } from 'lucide-react';

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      {onSearchChange && (
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

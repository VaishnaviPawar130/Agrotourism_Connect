import { ReactNode } from 'react';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

export interface Column<T> {
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  loading,
  error,
  emptyLabel = 'No records found',
  keyExtractor,
  onRowClick,
  showSerial,
  page,
  pageSize,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  /** Message from a failed fetch. Shown instead of the empty state so a
   *  network/permission failure is never mistaken for "no data". */
  error?: string;
  emptyLabel?: string;
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** Prepends a narrow "Sr. No." column numbered from the row's position —
   *  purely a display index, never sent to or stored by the backend. */
  showSerial?: boolean;
  /** Current 1-based page, for continuing the numbering across pages
   *  (`(page - 1) * pageSize + index + 1`). Omit on an unpaginated list to
   *  number from 1 on every render. */
  page?: number;
  pageSize?: number;
}) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState title={emptyLabel} />;

  const serialOffset = showSerial && page && pageSize ? (page - 1) * pageSize : 0;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-brand-cream/70">
            {showSerial && (
              <th className="w-[70px] whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Sr. No.
              </th>
            )}
            {columns.map((col) => (
              <th key={col.header} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr
              key={keyExtractor(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`transition-colors even:bg-slate-50/60 hover:bg-brand-cream/60 ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {showSerial && (
                <td className="w-[70px] px-4 py-3 text-center tabular-nums font-medium text-slate-400">{serialOffset + index + 1}</td>
              )}
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3 align-middle text-slate-700 ${col.className ?? ''}`}>
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

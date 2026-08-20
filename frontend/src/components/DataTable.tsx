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
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  /** Message from a failed fetch. Shown instead of the empty state so a
   *  network/permission failure is never mistaken for "no data". */
  error?: string;
  emptyLabel?: string;
  keyExtractor: (row: T) => string;
}) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState title={emptyLabel} />;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-brand-cream">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-brand-cream/60">
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-2.5 text-slate-700 ${col.className ?? ''}`}>
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

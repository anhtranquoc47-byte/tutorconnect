import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  sortable?: boolean
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string | number
  onSort?: (key: string) => void
  sortKey?: string
  sortOrder?: 'asc' | 'desc'
  isLoading?: boolean
  emptyMessage?: string
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onSort,
  sortKey,
  sortOrder,
  isLoading,
  emptyMessage = 'Không có dữ liệu',
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
      <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
        <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-3.5 ${col.sortable ? 'cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-100' : ''}`}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className="flex items-center gap-1.5">
                  <span>{col.header}</span>
                  {col.sortable && sortKey === col.key && (
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-400">
                <div className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  <span>Đang tải dữ liệu...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                    {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as ReactNode}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

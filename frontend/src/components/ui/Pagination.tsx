import { Button } from './Button'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize?: number
  onPageSizeChange?: (pageSize: number) => void
  totalCount?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  totalCount,
}: PaginationProps) {
  if (totalPages <= 1 && !totalCount) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-2">
        {totalCount !== undefined && (
          <span>
            Tổng cộng <strong>{totalCount}</strong> bản ghi
          </span>
        )}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 text-sm text-gray-800 dark:text-gray-200 outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Trước
        </Button>
        <span className="px-2 font-medium text-gray-800 dark:text-gray-200">
          Trang {currentPage} / {Math.max(1, totalPages)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  )
}

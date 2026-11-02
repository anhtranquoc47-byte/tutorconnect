import { Button } from './Button'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Đã có lỗi xảy ra',
  message = 'Không thể tải dữ liệu. Vui lòng thử lại sau.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl">
      <div className="mb-3 text-3xl text-red-500">⚠️</div>
      <h4 className="text-base font-bold text-red-800 dark:text-red-300 mb-1">{title}</h4>
      <p className="text-sm text-red-600 dark:text-red-400 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  )
}

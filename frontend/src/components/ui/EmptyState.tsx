import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title?: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

export function EmptyState({
  title = 'Không tìm thấy dữ liệu',
  description = 'Hiện tại chưa có thông tin nào để hiển thị.',
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-gray-900/50 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
      <div className="mb-4 text-4xl text-gray-400 dark:text-gray-600">
        {icon || '📂'}
      </div>
      <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}

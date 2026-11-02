import { Bell } from 'lucide-react'

export function NotificationsCard() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Thông báo mới
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cập nhật quan trọng gần đây
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/60 p-3 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            <span className="shrink-0 text-amber-600">🔔</span>
            <div>
              <span className="font-semibold">Tutor vừa cập nhật link Google Meet</span>{' '}
              cho buổi học sắp tới.
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-indigo-200/60 bg-indigo-50/60 p-3 text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-200">
            <span className="shrink-0 text-indigo-600">💳</span>
            <div>
              Bạn còn <span className="font-bold">350 Credit</span> khả dụng trong tài
              khoản.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationsCard

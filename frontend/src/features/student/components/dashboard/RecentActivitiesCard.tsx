import { CheckCircle2 } from 'lucide-react'

export function RecentActivitiesCard() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Hoạt động gần đây
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Lịch sử tương tác hệ thống
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                Booking đã được Tutor xác nhận
              </p>
              <p className="text-[11px] text-gray-400">
                Môn Toán Cao Cấp A1 - Gia sư Thu Thảo
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                Goal được cập nhật tiến độ 60%
              </p>
              <p className="text-[11px] text-gray-400">
                Cột mốc Ma trận & Định thức đã vượt qua
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecentActivitiesCard

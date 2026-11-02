import { Award, Star, Target } from 'lucide-react'

interface StatisticsCardProps {
  completedSessions: number
}

export function StatisticsCard({ completedSessions }: StatisticsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <Award className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Thống kê cá nhân
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tổng quan kết quả học tập
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 divide-x divide-gray-200 rounded-xl border border-gray-100 bg-gray-50/70 py-4 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-800/30">
        {/* Completed sessions */}
        <div className="flex flex-col items-center justify-center px-3 text-center">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Award className="h-4 w-4" />
          </div>

          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {completedSessions}
          </span>

          <span className="mt-1 text-[11px] leading-tight font-medium text-gray-500 dark:text-gray-400">
            Buổi học
            <br />
            hoàn thành
          </span>
        </div>

        {/* Active goals */}
        <div className="flex flex-col items-center justify-center px-3 text-center">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <Target className="h-4 w-4" />
          </div>

          <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
            Active
          </span>

          <span className="mt-1 text-[11px] leading-tight font-medium text-gray-500 dark:text-gray-400">
            Mục tiêu
            <br />
            đang thực hiện
          </span>
        </div>

        {/* Average rating */}
        <div className="flex flex-col items-center justify-center px-3 text-center">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </div>

          <span className="flex items-center gap-1 text-2xl font-black text-amber-600 dark:text-amber-400">
            4.8
          </span>

          <span className="mt-1 text-[11px] leading-tight font-medium text-gray-500 dark:text-gray-400">
            Đánh giá
            <br />
            trung bình
          </span>
        </div>
      </div>
    </div>
  )
}

export default StatisticsCard

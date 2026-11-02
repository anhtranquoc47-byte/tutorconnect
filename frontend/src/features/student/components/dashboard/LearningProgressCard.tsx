import { useMemo, useState } from 'react'
import { BookOpen, ChevronDown, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { LearningGoal } from '../../types/learningGoal.types'
import { LearningStatus } from '@/constants/enums'

interface LearningProgressCardProps {
  goals: LearningGoal[]
}

interface ChartPoint {
  date: string
  displayDate: string
  progress: number
  milestone: string
  status: number
}

export function LearningProgressCard({ goals }: LearningProgressCardProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(
    goals[0]?.id ?? null,
  )

  const selectedGoal = useMemo(
    () => goals.find((goal) => goal.id === selectedGoalId) ?? goals[0],
    [goals, selectedGoalId],
  )

  const milestonesList = selectedGoal?.milestones ?? []
  const completedMilestonesCount = milestonesList.filter(
    (m) =>
      m.status === LearningStatus.Completed ||
      m.status === 3 ||
      m.status === 2 ||
      (m as any).status === 'Completed' ||
      (m as any).isCompleted === true,
  ).length

  // 🎯 TÍNH % TIẾN ĐỘ CHÍNH XÁC CỤ THỂ THEO LỘ TRÌNH MỤC TIÊU
  const progressPercent =
    milestonesList.length > 0
      ? Math.round((completedMilestonesCount / milestonesList.length) * 100)
      : Math.round(selectedGoal?.currentProgressPercent ?? 0)

  const chartData = useMemo<ChartPoint[]>(() => {
    if (!selectedGoal) return []

    const milestones = [...(selectedGoal.milestones ?? [])].sort(
      (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime(),
    )

    if (milestones.length === 0) {
      return [
        {
          date: selectedGoal.targetDate,
          displayDate: formatDate(selectedGoal.targetDate),
          progress: progressPercent,
          milestone: 'Tiến độ hiện tại',
          status: selectedGoal.status,
        },
      ]
    }

    const total = milestones.length

    const points = milestones.map((milestone) => {
      const completedCount = milestones.filter(
        (item) =>
          (item.status === LearningStatus.Completed ||
            item.status === 3 ||
            item.status === 2 ||
            (item as any).status === 'Completed' ||
            (item as any).isCompleted === true) &&
          item.orderNumber <= milestone.orderNumber,
      ).length

      const milestoneProgress = Math.round((completedCount / total) * 100)

      return {
        date: milestone.targetDate,
        displayDate: formatDate(milestone.targetDate),
        progress: milestoneProgress,
        milestone: milestone.title,
        status: milestone.status,
      }
    })

    const lastPoint = points[points.length - 1]!
    const lastDate = new Date(lastPoint.date).getTime()
    const currentDate = new Date().getTime()

    if (currentDate >= lastDate) {
      points.push({
        date: new Date().toISOString(),
        displayDate: 'Hiện tại',
        progress: progressPercent,
        milestone: 'Tiến độ hiện tại',
        status: selectedGoal.status,
      })
    }

    return points
  }, [selectedGoal, progressPercent])

  if (goals.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60">
            <BookOpen className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100">
              Tiến độ mục tiêu học tập
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Các mục tiêu bạn đang hoàn thành
            </p>
          </div>
        </div>

        <p className="py-8 text-center text-xs text-gray-500 italic dark:text-gray-400">
          Chưa có mục tiêu học tập nào được đặt.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm lg:col-span-2 dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <TrendingUp className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-gray-100">
              Biểu Đồ Tiến Độ Học Tập
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Theo dõi trực quan sự tăng trưởng kiến thức theo từng cột mốc
            </p>
          </div>
        </div>

        <Link
          to="/student/progress"
          className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-extrabold text-indigo-600 transition-all hover:bg-indigo-100 hover:scale-105 active:scale-95 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-900/60"
        >
          <span>Chi tiết</span>
          <Sparkles className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Goal Selector */}
      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">
          Chọn mục tiêu xem biểu đồ:
        </label>

        <div className="relative">
          <select
            value={selectedGoal?.id ?? ''}
            onChange={(e) => {
              setSelectedGoalId(Number(e.target.value))
            }}
            className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-3 pr-10 text-xs font-bold text-gray-800 transition-all outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title} ({goal.subject?.name || (goal as any).subjectName || 'Môn học'})
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-indigo-500" />
        </div>
      </div>

      {selectedGoal && (
        <>
          {/* Summary Stats Cards */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3 text-center dark:border-indigo-950/60 dark:bg-indigo-950/20">
              <span className="block text-[10px] font-bold text-indigo-500 uppercase">Tổng mốc</span>
              <span className="mt-0.5 block text-lg font-black text-indigo-700 dark:text-indigo-300">
                {milestonesList.length}
              </span>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3 text-center dark:border-emerald-950/60 dark:bg-emerald-950/20">
              <span className="block text-[10px] font-bold text-emerald-500 uppercase">Đã xong</span>
              <span className="mt-0.5 block text-lg font-black text-emerald-700 dark:text-emerald-300">
                {completedMilestonesCount}
              </span>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-3 text-center dark:border-purple-950/60 dark:bg-purple-950/20">
              <span className="block text-[10px] font-bold text-purple-500 uppercase">Tiến độ</span>
              <span className="mt-0.5 block text-lg font-black text-purple-700 dark:text-purple-300">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Area Chart Gradient NỔI BẬT */}
          <div className="mb-6 rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50/50 to-white p-4 dark:border-gray-800 dark:from-gray-900/40 dark:to-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                  Đường cong tăng trưởng bài học
                </h4>
                <p className="text-[11px] text-gray-400">
                  Biểu đồ tính theo % tỉ lệ cột mốc hoàn thành
                </p>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 15,
                      right: 15,
                      left: -15,
                      bottom: 5,
                    }}
                  >
                    <defs>
                      <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                    <XAxis
                      dataKey="displayDate"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null

                        const point = payload[0]?.payload as ChartPoint

                        return (
                          <div className="rounded-2xl border border-indigo-100 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/95">
                            <p className="text-[11px] font-bold text-gray-400">
                              📅 {point.displayDate}
                            </p>

                            <p className="mt-1 text-sm font-black text-indigo-600 dark:text-indigo-400">
                              ⚡ {point.progress}% tiến độ
                            </p>

                            <p className="mt-1 max-w-[200px] text-xs font-semibold text-gray-700 dark:text-gray-200">
                              📌 {point.milestone}
                            </p>
                          </div>
                        )
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="progress"
                      stroke="#6366f1"
                      strokeWidth={3.5}
                      fillOpacity={1}
                      fill="url(#colorProgress)"
                      dot={{
                        r: 6,
                        fill: '#ffffff',
                        stroke: '#6366f1',
                        strokeWidth: 3,
                      }}
                      activeDot={{
                        r: 8,
                        fill: '#6366f1',
                        stroke: '#ffffff',
                        strokeWidth: 3,
                      }}
                      isAnimationActive
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-xs text-gray-500">
                Chưa có dữ liệu tiến độ.
              </p>
            )}
          </div>

          {/* Milestone List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider dark:text-gray-200">
                Danh sách cột mốc bài học
              </h4>
              <span className="text-[11px] font-bold text-gray-400">
                {completedMilestonesCount}/{milestonesList.length} Đã xong
              </span>
            </div>

            {milestonesList.map((milestone) => {
              const isCompleted =
                milestone.status === LearningStatus.Completed ||
                milestone.status === 3 ||
                milestone.status === 2 ||
                (milestone as any).status === 'Completed' ||
                (milestone as any).isCompleted === true

              return (
                <div
                  key={milestone.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-3 transition-all ${
                    isCompleted
                      ? 'border-emerald-100 bg-emerald-50/30 dark:border-emerald-950/40 dark:bg-emerald-950/20'
                      : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : milestone.orderNumber}
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`text-xs font-bold ${
                          isCompleted
                            ? 'text-gray-400 line-through'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {milestone.title}
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        Hạn: {formatDate(milestone.targetDate)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isCompleted ? '✓ Hoàn thành' : '⚡ Đang học'}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  })
}

export default LearningProgressCard
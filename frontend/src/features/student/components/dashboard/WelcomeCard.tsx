import type { AuthUser } from '@/features/auth/auth.types'

interface WelcomeCardProps {
  user: AuthUser
  todaySessionsCount: number
  // activeGoalsCount?: number
}

export default function WelcomeCard({ user, todaySessionsCount }: WelcomeCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white shadow-sm">
      {/* Background Glow Accents */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-purple-500/20 blur-2xl" />

      <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <img
            src={'https://api.dicebear.com/7.x/avataaars/svg?seed=student123'}
            alt="Avatar"
            className="h-16 w-16 rounded-full border-2 border-white/80 bg-white/10 object-cover p-0.5 shadow-md"
          />

          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
              Xin chào, {user.name}
            </h1>

            <p className="mt-1 max-w-md text-xs font-medium text-indigo-100/90">
              Chào mừng bạn quay trở lại! Hãy kiểm tra lịch học và tiếp tục lộ trình hoàn
              thành mục tiêu hôm nay.
            </p>
          </div>
        </div>

        {/* Quick Metrics Badges */}
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          {/* <div className="min-w-[110px] flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-center backdrop-blur-md transition hover:bg-white/15 sm:flex-initial">
            <span className="block text-[10px] font-semibold tracking-wider text-indigo-200 uppercase">
              Credit còn lại
            </span>

            <span className="mt-0.5 flex items-center justify-center gap-1.5 text-lg font-black text-amber-300">
              <Wallet className="h-4 w-4" />
              {user.creditBalance}
            </span>
          </div> */}

          <div className="min-w-[110px] flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-center backdrop-blur-md transition hover:bg-white/15 sm:flex-initial">
            <span className="block text-[10px] font-semibold tracking-wider text-indigo-200 uppercase">
              Lớp hôm nay
            </span>

            <span className="mt-0.5 block text-lg font-black text-white">
              {todaySessionsCount} buổi
            </span>
          </div>

          <div className="min-w-[110px] flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-center backdrop-blur-md transition hover:bg-white/15 sm:flex-initial">
            <span className="block text-[10px] font-semibold tracking-wider text-indigo-200 uppercase">
              Trạng thái
            </span>

            <span className="mt-0.5 block inline-block rounded-md border border-emerald-400/30 bg-emerald-950/40 px-2 py-0.5 text-xs font-bold text-emerald-300">
              Hoạt động
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

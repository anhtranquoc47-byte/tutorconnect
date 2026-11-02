import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  UserSquare2,
  Users,
  BookOpen,
  AlertTriangle,
  ChevronRight,
  HelpCircle,
  CalendarDays,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/auth.store'

export interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user } = useAuthStore()
  const isTutor = user?.role === 'tutor'
  const isAdmin = user?.role === 'admin'

  const tutorLinkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
      isActive
        ? 'bg-gradient-to-r from-brand-600/90 to-indigo-600/80 text-white shadow-[0_4px_20px_rgba(59,130,246,0.25)]'
        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
    )

  const defaultLinkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer',
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 shadow-sm border border-brand-200/60 dark:border-brand-800/60'
        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
    )

  const linkClass = isTutor ? tutorLinkClass : defaultLinkClass

  return (
    <>
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col justify-between border-r p-4 transition-transform duration-300 ease-in-out md:static md:translate-x-0',
          isTutor
            ? 'border-white/[0.06] bg-[#0b0e14]'
            : 'border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 shadow-xs',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2 pt-1">
            <span
              className={clsx(
                'text-[11px] font-extrabold uppercase tracking-widest',
                isTutor ? 'text-slate-500' : 'text-slate-400',
              )}
            >
              {isAdmin ? 'Quản trị hệ thống' : 'Bảng điều khiển'}
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className={clsx(
                  'rounded-lg p-1 md:hidden',
                  isTutor ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                )}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <nav className="flex flex-col gap-1.5">
            {isAdmin ? (
              <>
                <NavLink to="/admin/dashboard" className={linkClass} onClick={onClose}>
                  <LayoutDashboard className="h-[18px] w-[18px] shrink-0 opacity-80" />
                  <span>Dashboard Tổng quan</span>
                </NavLink>
                <NavLink to="/admin/featured-tutors" className={linkClass} onClick={onClose}>
                  <Sparkles className="h-[18px] w-[18px] shrink-0 opacity-80" />
                  <span>Gia sư Tiêu biểu</span>
                </NavLink>
                <NavLink to="/admin/tutor-applications" className={linkClass} onClick={onClose}>
                  <UserSquare2 className="h-[18px] w-[18px] shrink-0 opacity-80" />
                  <span>Duyệt hồ sơ Gia sư</span>
                </NavLink>
                <NavLink to="/admin/subjects" className={linkClass} onClick={onClose}>
                  <BookOpen className="h-[18px] w-[18px] shrink-0 opacity-80" />
                  <span>Quản lý Môn học</span>
                </NavLink>
                <NavLink to="/admin/users" className={linkClass} onClick={onClose}>
                  <Users className="h-[18px] w-[18px] shrink-0 opacity-80" />
                  <span>Quản lý Người dùng</span>
                </NavLink>
                <NavLink to="/admin/watchlist" className={linkClass} onClick={onClose}>
                  <ShieldAlert className="h-[18px] w-[18px] shrink-0 opacity-80" />
                  <span>Cảnh báo Vi phạm</span>
                </NavLink>
                <NavLink to="/admin/complaints" className={linkClass} onClick={onClose}>
                  <AlertTriangle className="h-[18px] w-[18px] shrink-0 opacity-80" />
                  <span>Xử lý Khiếu nại</span>
                </NavLink>
              </>
            ) : isTutor ? (
              <>
                <NavLink to="/tutor/timetable" className={linkClass} onClick={onClose}>
                  {({ isActive }) => (
                    <>
                      <CalendarDays className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1">Lịch giảng dạy</span>
                      {isActive && <ChevronRight className="h-4 w-4 shrink-0 opacity-80" />}
                    </>
                  )}
                </NavLink>
                <NavLink to="/tutor/profile" className={linkClass} onClick={onClose}>
                  {({ isActive }) => (
                    <>
                      <UserSquare2 className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1">Hồ sơ Gia sư</span>
                      {isActive && <ChevronRight className="h-4 w-4 shrink-0 opacity-80" />}
                    </>
                  )}
                </NavLink>
              </>
            ) : null}
          </nav>
        </div>

        {isTutor ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10">
                <HelpCircle className="h-4 w-4 text-brand-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">Bạn cần hỗ trợ?</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  Xem hướng dẫn hoặc liên hệ đội ngũ hỗ trợ.
                </p>
                <a
                  href="#"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-400 transition hover:text-brand-300"
                >
                  Help Center
                  <ChevronRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-brand-50/30 p-3.5 dark:border-slate-800 dark:from-slate-800/60 dark:to-slate-900/60">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-brand-600/20">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                {user.name}
              </span>
              <span className="truncate text-xs text-slate-500">{user.email}</span>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  )
}
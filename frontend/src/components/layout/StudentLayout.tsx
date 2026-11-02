import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth.store'

import {
  LayoutDashboard,
  Search,
  CalendarDays,
  LineChart,
  LogOut,
  Menu,
  X,
  User,
  GraduationCap,
  Wallet,
  Sparkles, // <-- Thêm icon Sparkles ở đây
   BookOpen
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/features/auth/auth.api'
import { NotificationBell } from './NotificationBell'
import { ChatMessengerModal } from './ChatMessengerModal'
import { queryClient } from '@/app/query-client'
import { ChatbotWidget } from '@/features/chatbot/components/ChatbotWidget'
export default function StudentLayout() {
  const navigate = useNavigate()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const { logout } = useAuthStore()

  // 1. Lấy dữ liệu user từ React Query
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: authApi.me,
  })

  const navItems = [
    {
      label: 'Tổng quan',
      path: '/student/dashboard',
      icon: LayoutDashboard,
    },
      {
      label: 'Gia sư Tiêu biểu',
      path: '/student/featured',
      icon: Sparkles,
    },
    {
  label: 'Khám phá Gia sư',
  path: '/student/all-tutors',
  icon: BookOpen,
},
    {
      label: 'Ví Credit & Nạp tiền',
      path: '/student/wallet',
      icon: Wallet,
    },
    {
      label: 'Tìm Gia sư',
      path: '/student/tutors',
      icon: Search,
    },
    {
      label: 'Lịch học của tôi',
      path: '/student/schedule',
      icon: CalendarDays,
    },
    {
      label: 'Tiến độ học tập',
      path: '/student/progress',
      icon: LineChart,
    },
  ]

const handleLogout = async () => {
  try {
    await logout()
    queryClient.clear() // Xóa sạch toàn bộ bộ nhớ đệm của Học viên A cũ
    window.location.href = '/login' // Chuyển trang sạch sẽ
  } catch (error) {
    console.error('Logout failed:', error)
    window.location.href = '/login'
  }
}

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 transition-colors duration-200 dark:bg-gray-950 dark:text-gray-200">
      {/* Overlay cho Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex h-screen w-64 flex-col justify-between overflow-hidden border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out lg:sticky lg:top-0 dark:border-gray-800 dark:bg-gray-900 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Phần Top: Logo + Menu */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Logo Platform */}
          <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white/90 px-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90">
            <NavLink to="/student" className="group flex items-center gap-3">
              <div className="from-brand-600 shadow-brand-600/25 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr to-indigo-600 text-lg font-black text-white shadow-md transition-transform group-hover:scale-105">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="via-brand-200 bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-lg font-extrabold text-transparent">
                  GiaSưConnect
                </span>
                <span className="-mt-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                  Tutor & Learning
                </span>
              </div>
            </NavLink>

            <button
              className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-1.5 p-4">
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500">
              Menu Học Viên
            </p>
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 shadow-xs dark:bg-indigo-950/60 dark:text-indigo-400'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Phần Bottom: Profile & Logout */}
        <div className="border-t border-gray-100 p-4 dark:border-gray-800">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-2.5 dark:bg-gray-800/50">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="from-brand-500 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr to-indigo-600 text-xs font-bold text-white shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-xs font-bold text-gray-900 dark:text-gray-100">
                  {user?.name || 'Học viên'}
                </span>
                <span className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                  {user?.email || 'hocvien@tutorconnect.com'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP HEADER TRANG HỌC VIÊN */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-gray-800 dark:bg-gray-900/80">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="hidden text-xs font-semibold tracking-wider text-gray-400 uppercase sm:block dark:text-gray-500">
              Khu vực Học viên
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Pill Số dư Credit hiển thị góc trên Header */}
            <NavLink
              to="/student/wallet"
              className="flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
              title="Xem Ví Credit"
            >
              <span>🪙</span>
              <span>
            
{Number(localStorage.getItem(user?.id ? `tutor_student_credit_${user.id}` : 'tutor_student_credit') || 0).toLocaleString()} Credit
              </span>
              <span className="ml-1 rounded-md bg-amber-600 px-1.5 py-0.5 text-[10px] text-white">Nạp</span>
            </NavLink>

            {/* Nút Chuông Thông Báo Thông Minh */}
            <NotificationBell />
            
{/* Nút Chat Messenger */}
<ChatMessengerModal />


            <div className="h-5 w-px bg-gray-200 dark:bg-gray-800" />

            <button
              onClick={() => navigate('/student/profile')}
              className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              title="Hồ sơ cá nhân"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* BODY PAGE CONTENT */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <ChatbotWidget />
    </div>
  )
}
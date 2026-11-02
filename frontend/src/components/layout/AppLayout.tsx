import { Suspense, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Spinner } from '@/components/ui/Spinner'
import { ToastProvider } from '@/components/ui/ToastContext'
import { useAuthStore } from '@/features/auth/auth.store'
import { ChatbotWidget } from '@/features/chatbot/components/ChatbotWidget'

export function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuthStore()

  const isTutorDark =
    user?.role === 'tutor' &&
    (location.pathname.startsWith('/tutor') || location.pathname === '/users')

  return (
    <ToastProvider>
      <div
        className={
          isTutorDark
            ? 'flex min-h-screen flex-col bg-[#0b0e14] text-slate-100'
            : 'flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100'
        }
      >
        <Header onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
        <div className="flex flex-1">
          <Sidebar
            isOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />
          <main className={`mx-auto w-full flex-1 ${isTutorDark ? 'p-4 sm:p-6 lg:p-8' : 'max-w-7xl p-4 sm:p-6 lg:p-8'}`}>
            <Suspense
              fallback={
                <div className="flex h-64 items-center justify-center">
                  <Spinner />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>

      {/* 🤖 BỔ SUNG NÚT CHATBOT Ở GÓC DƯỚI BÊN PHẢI CHO GIA SƯ */}
      <ChatbotWidget />
    </ToastProvider>
  )
}
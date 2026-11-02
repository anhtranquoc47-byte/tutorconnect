import { Button } from '@/components/ui/Button'
import { useAuthStore } from './auth.store'
import { useNavigate } from 'react-router-dom'

export function AlreadyAuthenticatedPage() {
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 dark:bg-slate-950">
      {/* Background Orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
      />

      <section className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:p-10">
        <h1 className="mt-6 text-2xl font-extrabold text-slate-900 dark:text-white">
          Bạn đã đăng nhập
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Bạn cần đăng xuất trước khi truy cập trang này.
        </p>

        <Button className="mt-8" onClick={() => void handleLogout()}>
          Đăng xuất
        </Button>
      </section>
    </main>
  )
}
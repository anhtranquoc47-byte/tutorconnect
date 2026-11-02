import { useState, type FormEvent, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from './auth.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface LocationState {
  from?: { pathname: string }
}

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, status, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const redirectTo = (location.state as LocationState)?.from?.pathname ?? '/'

  useEffect(() => {
    clearError()
  }, [clearError])


  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await login({ email, password })
      const currentUser = useAuthStore.getState().user

      // 🔍 KIỂM TRA ROUTE CHUYỂN HƯỚNG CÓ ĐÚNG VỚI ROLE CỦA USER ĐANG ĐĂNG NHẬP KHÔNG
      if (redirectTo !== '/' && !redirectTo.includes('/unauthorized')) {
        const isStudentRoute = redirectTo.startsWith('/student')
        const isTutorRoute = redirectTo.startsWith('/tutor')
        const isAdminRoute = redirectTo.startsWith('/admin')

        if (
          (currentUser?.role === 'student' && isStudentRoute) ||
          (currentUser?.role === 'tutor' && isTutorRoute) ||
          (currentUser?.role === 'admin' && isAdminRoute)
        ) {
          navigate(redirectTo, { replace: true })
          return
        }
      }

      // 🎯 NẾU ROLE KHÔNG KHỚP (VD: GIA SƯ ĐĂNG NHẬP SAU KHI HỌC VIÊN ĐĂNG XUẤT) -> ĐƯA VỀ ĐÚNG TRANG CHỦ THEO ROLE
      if (currentUser?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else if (currentUser?.role === 'tutor') {
        navigate('/tutor/profile', { replace: true })
      } else if (currentUser?.role === 'student') {
        navigate('/student', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch {
      /* error surfaced via store */
    }
  }


  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4 dark:bg-slate-950">
      {/* Background Orbs */}
      <div
        aria-hidden="true"
        className="bg-brand-500/20 pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
      />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-col items-center text-center">
          <Link
            to="/"
            className="from-brand-600 shadow-brand-600/30 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr to-indigo-600 text-2xl text-white shadow-xl"
          >
            🎓
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('auth.login')}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Chào mừng bạn quay trở lại với GiaSưConnect
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex cursor-pointer items-center gap-2 text-slate-500">
              <input
                type="checkbox"
                defaultChecked
                className="text-brand-600 focus:ring-brand-500 rounded border-slate-300"
              />
              Ghi nhớ đăng nhập
            </label>
            <Link
              to="/forgot-password"
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}


          <Button
            type="submit"
            variant="gradient"
            size="lg"
            loading={status === 'loading'}
            className="mt-2 w-full"
          >
            {t('auth.login')}
          </Button>

          <div className="mt-4 text-center text-xs text-slate-500">
            Chưa có tài khoản?{' '}
            <Link
              to="/register/student"
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/ToastContext'
import { authApi } from './auth.api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Vui lòng nhập địa chỉ email')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await authApi.forgotPassword({ email })
      setSubmitted(true)
      toast.success('Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
  <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
    {/* Background Orbs */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
    />

    <div className="relative w-full max-w-md space-y-8 rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
      <div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Quên mật khẩu?
        </h2>

        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Nhập email của bạn và chúng tôi sẽ gửi liên kết hướng dẫn đặt lại mật khẩu.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <span className="text-3xl">✉️</span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Chúng tôi đã gửi hướng dẫn tới{' '}
            <strong className="text-slate-900 dark:text-white">
              {email}
            </strong>
            . Vui lòng kiểm tra hộp thư đến của bạn.
          </p>

          <div className="pt-4">
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Quay lại đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Input
              label="Địa chỉ Email"
              type="email"
              required
              placeholder="vd: user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error || undefined}
            />
          </div>

          <div>
            <Button type="submit" className="w-full" loading={loading}>
              Gửi yêu cầu đặt lại mật khẩu
            </Button>
          </div>

          <div className="text-center text-sm">
            <Link
              to="/login"
              className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </form>
      )}
    </div>
  </main>
)
}

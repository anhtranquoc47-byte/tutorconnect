import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '@/components/ui/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authApi } from './auth.api'
import { ApiError } from '@/lib/api/http'  
import type { RegisterStudentPayload } from './auth.types'

export function StudentRegisterPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState<RegisterStudentPayload>({
    name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const isValid =
    form.name.trim() &&
    form.email.trim() &&
    form.password.trim() &&
    form.phone.trim()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setEmailError(null) 

    if (form.password !== confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu phải trùng khớp')
      return
    }

    if (!form.email.includes('@')) {
      setError('Địa chỉ email không hợp lệ')
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.registerStudent(form)
      toast.success('Đăng ký học viên thành công! Vui lòng đăng nhập để bắt đầu tìm gia sư.')
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-slate-950 py-12">
      {/* Orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <Link to="/" className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-2xl text-white shadow-xl shadow-brand-600/30">
            🎓
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Đăng ký Tài khoản Học viên
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-md">
            Tìm gia sư phù hợp với nhu cầu học tập và quản lý mục tiêu học tập thông minh.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <Input
            label="Họ và tên học viên"
            placeholder="vd: Nguyễn Văn Học"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Địa chỉ Email"
            type="email"
            placeholder="hocvien@example.com"
            value={form.email}
            onChange={(e) => {
                setForm({ ...form, email: e.target.value })
                if (emailError) setEmailError(null)   // 👈 xoá lỗi khi user sửa lại email
              }}
            required
          />
          <Input
            label="Số điện thoại"
            placeholder="0912345678"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {error && (
            <div className="md:col-span-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <div className="md:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              className="w-full sm:w-auto"
            >
              Hoàn tất Đăng ký
            </Button>

            <Link
              to="/login"
              className="text-xs font-bold text-slate-500 hover:text-brand-600 text-center sm:text-right"
            >
              Đã có tài khoản? <span className="text-brand-600 underline">Đăng nhập</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

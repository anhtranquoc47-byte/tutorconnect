import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/ToastContext'
import { authApi } from './auth.api'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const toast = useToast()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (!token) {
      setIsTokenValid(false)
      setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu mã token.')
      return
    }

    authApi.validateResetToken(token)
      .then((isValid) => {
        setIsTokenValid(isValid)
        if (!isValid) setError('Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.')
      })
      .catch((err: unknown) => {
        setIsTokenValid(false)
        setError(err instanceof Error ? err.message : 'Không thể kiểm tra liên kết đặt lại mật khẩu.')
      })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await authApi.resetPassword({ token, newPassword, confirmPassword })
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.')
      navigate('/login')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Nhập mật khẩu mới của bạn bên dưới.
          </p>
        </div>

        {isTokenValid === null ? (
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-300">Đang kiểm tra liên kết đặt lại mật khẩu...</p>
        ) : isTokenValid ? (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Mật khẩu mới"
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={error || undefined}
            />
          </div>

          <div>
            <Button type="submit" className="w-full" loading={loading}>
              Cập nhật mật khẩu mới
            </Button>
          </div>

          <div className="text-center text-sm">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </form>
        ) : (
          <div className="mt-8 space-y-4 text-center">
            <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>
            <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Gửi lại yêu cầu đặt mật khẩu
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

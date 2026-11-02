import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/features/auth/auth.store'

export function UnauthorizedPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
      <div className="mb-4 text-6xl">🚫</div>
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">403 — Không có quyền truy cập</h1>
      <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mb-6">
        Tài khoản của bạn {user?.email ? `(${user.email}${user.role ? ` - ${user.role}` : ''})` : ''} không có quyền truy cập vào trang này. Vui lòng quay lại hoặc đăng nhập bằng tài khoản khác.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate('/')}>
          Trang chủ
        </Button>
        <Button
          variant="danger"
          onClick={async () => {
            await logout()
            navigate('/login')
          }}
        >
          Đăng xuất & Đổi tài khoản
        </Button>
      </div>
    </div>
  )
}


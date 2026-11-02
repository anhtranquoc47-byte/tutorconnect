import { useState, useEffect } from 'react'
import { User, Mail, Phone, ShieldCheck, KeyRound, Lock } from 'lucide-react'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { Button } from '@/components/ui/Button'
import { ChangePasswordModal } from '@/features/auth/ChangePasswordModal'

export default function StudentProfilePage() {
  const [fullName, setFullName] = useState('')
  const [status, setStatus] = useState('')
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  // 1. Fetch Current User Profile
  const { data: user, isLoading, isError } = useCurrentUser()

  useEffect(() => {
    if (user) {
      setFullName(user.name || '')
      setStatus(user.status || '')
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-500">
        Đang tải thông tin...
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
        Không thể tải thông tin người dùng
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
          Hồ sơ cá nhân
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Quản lý thông tin tài khoản và cài đặt bảo mật của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Cột trái: Avatar & Thông tin định danh */}
        <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="relative">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'student123'}`}
              alt="Avatar"
              className="h-24 w-24 rounded-full border-2 border-indigo-100 object-cover ring-4 ring-gray-50 dark:border-indigo-950/60 dark:ring-gray-800"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {user?.name}
            </h3>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Học viên
            </span>
          </div>
        </div>

        {/* Cột phải: Thông tin chi tiết & Bảo mật */}
        <div className="space-y-6 md:col-span-2">
          {/* Card 1: Thông tin cá nhân */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-5 border-b border-gray-100 pb-3 text-base font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100">
              Thông tin chi tiết
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    disabled
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-3 pl-9 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400"
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-3 pl-9 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-3 pl-9 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400"
                    placeholder="Chưa cập nhật"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Card 2: Cài đặt Bảo mật & Đổi mật khẩu */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 border-b border-gray-100 pb-3 text-base font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100">
              Bảo mật tài khoản
            </h2>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Mật khẩu đăng nhập
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Đổi mật khẩu định kỳ để bảo vệ tài khoản tốt hơn.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangePasswordOpen(true)}
                className="shrink-0 gap-1.5"
              >
                <Lock className="h-3.5 w-3.5" />
                Đổi mật khẩu
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Đổi mật khẩu */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  )
}

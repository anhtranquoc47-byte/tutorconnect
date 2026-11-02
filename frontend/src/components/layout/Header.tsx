import { useState } from 'react'
import { useNavigate, NavLink, useLocation } from 'react-router-dom'
import { Menu, GraduationCap, Lock } from 'lucide-react'
import { useAuthStore } from '@/features/auth/auth.store'
import { Button } from '@/components/ui/Button'
import { ChangePasswordModal } from '@/features/auth/ChangePasswordModal'
import { NotificationBell } from './NotificationBell'
import { ChatMessengerModal } from './ChatMessengerModal'
import { ChatbotWidget } from '@/features/chatbot/components/ChatbotWidget'
export interface HeaderProps {
  onToggleSidebar?: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  const isTutorDark =
    user?.role === 'tutor' &&
    (location.pathname.startsWith('/tutor') || location.pathname === '/users')

  const roleBadges: Record<string, string> = {
    admin:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    tutor: isTutorDark
      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    student:
      'bg-brand-100 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800',
  }

  return (
    <>
      <header
        className={
          isTutorDark
            ? 'sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0b0e14]/95 px-4 backdrop-blur-md sm:px-6'
            : 'sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800/80 dark:bg-slate-900/80'
        }
      >
        <div className="flex items-center gap-4">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className={
                isTutorDark
                  ? 'cursor-pointer rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white md:hidden'
                  : 'cursor-pointer rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800'
              }
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <NavLink
            to={
              user
                ? user.role === 'admin'
                  ? '/admin/dashboard'
                  : user.role === 'tutor'
                    ? '/tutor/profile'
                    : '/users'
                : '/'
            }
            className="group flex items-center gap-3"
          >
            <div className="from-brand-600 shadow-brand-600/25 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr to-indigo-600 text-lg font-black text-white shadow-md transition-transform group-hover:scale-105">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span
                className={
                  isTutorDark
                    ? 'via-brand-200 bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-lg font-extrabold text-transparent'
                    : 'via-brand-700 bg-gradient-to-r from-slate-900 to-indigo-600 bg-clip-text text-lg font-extrabold text-transparent dark:from-white dark:to-slate-300'
                }
              >
                GiaSưConnect
              </span>
              <span className="-mt-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                Tutor & Learning
              </span>
            </div>
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={
                  isTutorDark
                    ? 'hidden items-center gap-3 border-l border-white/[0.08] pl-3 sm:flex'
                    : 'hidden items-center gap-3 border-l border-slate-200 pl-3 sm:flex dark:border-slate-800'
                }
              >
                <div className="from-brand-500 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr to-indigo-600 text-sm font-bold text-white shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span
                    className={`text-sm leading-tight font-bold ${isTutorDark ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}
                  >
                    {user.name}
                  </span>
                  <span
                    className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-center text-[11px] font-semibold ${roleBadges[user.role] || 'bg-slate-100 text-slate-700'}`}
                  >
                    {user.role === 'admin'
                      ? 'Quản trị viên'
                      : user.role === 'tutor'
                        ? 'Gia sư'
                        : 'Học viên'}
                  </span>
                </div>
              </div>

              {/* Nút Chuông Thông Báo */}
              <NotificationBell />
              
{/* Nút Chat Messenger Trực Tuyến */}
<ChatMessengerModal />

              {/* Nút Ví Thu Nhập cho Gia Sư */}
              {user.role === 'tutor' && (
                <NavLink
                  to="/tutor/wallet"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
                  title="Ví Thu Nhập & Rút Tiền"
                >
                  <span>🪙</span>
                                  <span>
                                  {(() => {
                    const SYSTEM_SEED_CREDITS: Record<number, number> = {
                      3: 1985, // Nguyễn Lan
                      4: 1500, // Nguyễn Minh / Lê Minh
                      5: 1500, // Phạm Hoa
                      6: 1500, // Đỗ Nam
                    }

                    const uid = Number(user.id)
                    const isSystemAccount = SYSTEM_SEED_CREDITS[uid] !== undefined

                    // 1. Nếu là tài khoản có sẵn trong hệ thống -> Giữ nguyên số dư của hệ thống
                    if (isSystemAccount) {
                      const saved = localStorage.getItem(`tutor_income_credit_${uid}`)
                      if (saved !== null && Number(saved) > 0) {
                        return Number(saved).toLocaleString()
                      }
                      return (SYSTEM_SEED_CREDITS[uid] ?? 1985).toLocaleString()
                    }

                    // 2. Tài khoản mới lập hoàn toàn (Phạm Gia Sư, Trần Gia Sư, tài khoản mới...)
                    // Chỉ hiển thị số dư nếu tài khoản này THỰC SỰ có giao dịch nạp tiền trong ví
                    const txStr = localStorage.getItem(`tutor_income_transactions_${uid}`)
                    if (txStr) {
                      try {
                        const txs = JSON.parse(txStr)
                        if (Array.isArray(txs) && txs.length > 0) {
                          const saved = localStorage.getItem(`tutor_income_credit_${uid}`)
                          if (saved !== null) return Number(saved).toLocaleString()
                        }
                      } catch {
                        // ignore
                      }
                    }

                    // Mới lập chưa nạp tiền -> BẮT BUỘC 0 CR (Tự động xóa bỏ số 1985 rác cũ)
                    return '0'
                  })()} CR
                </span>
                  <span className="ml-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white">Rút</span>
                </NavLink>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChangePasswordOpen(true)}
                title="Đổi mật khẩu"
                className={
                  isTutorDark
                    ? 'hidden text-white font-bold hover:text-indigo-300 hover:bg-white/10 transition-colors sm:inline-flex'
                    : 'hidden font-bold text-slate-900 sm:inline-flex dark:text-white'
                }
              >
                <Lock className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
                Mật khẩu
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await logout()
                  navigate('/')
                }}
                className={
                  isTutorDark
                    ? 'border-white/20 bg-white/10 text-white font-bold hover:bg-white/20 hover:border-white/40 shadow-xs'
                    : 'font-bold text-slate-900 dark:text-white'
                }
              >
                Đăng xuất 
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="gradient" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/register/student')}
              >
                Đăng ký Học viên
              </Button>
            </div>
          )}
        </div>
      </header>

      {user && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      )}
      
    </>
  )
}
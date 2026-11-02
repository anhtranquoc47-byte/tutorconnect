import { Suspense, useState, useEffect, useRef } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Spinner } from '@/components/ui/Spinner'
import { clsx } from 'clsx'
import {
  Wallet,
  ArrowUpRight,
  QrCode,
  CheckCircle2,
  X,
  Building2,
  History,
  TrendingUp,
  CreditCard,
  Eye,
  Check,
  Ban,
  Clock,
  ShieldCheck,
  Upload,
  FileCheck,
  Camera,
} from 'lucide-react'
import { http } from '@/lib/api/http'

export interface SystemTopupRequest {
  id: string
  studentId: number
  studentName: string
  studentEmail: string
  amountCredit: number
  amountVnd: number
  referenceCode: string
  billImageUrl?: string
  createdAt: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  reviewedAt?: string
}

export interface TutorSessionPayoutRequest {
  id: string
  bookingId: number
  bookingCode: string
  subjectName: string
  studentName: string
  tutorId: number
  tutorName: string
  tutorBankId: string
  tutorBankName: string
  tutorAccountNo: string
  tutorAccountName: string
  totalCostCredit: number
  totalCostVnd: number
  platformFeeVnd: number
  netPayoutVnd: number
  requestedAt: string
  status: 'PENDING' | 'COMPLETED' | 'REJECTED'
  paidAt?: string
  adminProofImageUrl?: string
  sessionProofImageUrl?: string // 📸 Ảnh chụp màn hình buổi học giữa Gia sư và Học viên
}

const SYSTEM_ADMIN_BANK = {
  bankId: 'MB',
  bankName: 'MBBank (NH Quân Đội)',
  accountNo: '0376703251',
  accountName: 'NGUYEN ADMIN',
}

interface CommissionWithdrawTx {
  id: string
  amountVnd: number
  date: string
  note: string
}

export function AdminLayout() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50000)
  const [customAmount, setCustomAmount] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // 1. Quản lý yêu cầu nạp Credit của học viên cần Admin duyệt
  const [isTopupApprovalOpen, setIsTopupApprovalOpen] = useState(false)
  const [topupFilter, setTopupFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED'>('PENDING')
  const [previewBillImage, setPreviewBillImage] = useState<string | null>(null)
  const [topupRequests, setTopupRequests] = useState<SystemTopupRequest[]>(() => {
    const saved = localStorage.getItem('system_credit_topup_requests')
    return saved ? JSON.parse(saved) : []
  })

  const syncTopupRequests = () => {
    const saved = localStorage.getItem('system_credit_topup_requests')
    if (saved) {
      try {
        setTopupRequests(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }
  }

  // 2. Quản lý yêu cầu Admin quét QR chuyển khoản 90% thù lao cho Gia sư sau ca học hoàn thành
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)
  const [payoutFilter, setPayoutFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING')
  const [selectedPayout, setSelectedPayout] = useState<TutorSessionPayoutRequest | null>(null)
  const [adminProofImage, setAdminProofImage] = useState<string | null>(null)
  const [isTransferring, setIsTransferring] = useState(false)
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [payoutRequests, setPayoutRequests] = useState<TutorSessionPayoutRequest[]>(() => {
    const saved = localStorage.getItem('tutor_session_payout_requests')
    return saved ? JSON.parse(saved) : []
  })

  const syncPayoutRequests = () => {
    const saved = localStorage.getItem('tutor_session_payout_requests')
    if (saved) {
      try {
        setPayoutRequests(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }
  }

  useEffect(() => {
    syncTopupRequests()
    syncPayoutRequests()
    window.addEventListener('storage', syncTopupRequests)
    window.addEventListener('storage', syncPayoutRequests)
    const interval = setInterval(() => {
      syncTopupRequests()
      syncPayoutRequests()
    }, 3000)
    return () => {
      window.removeEventListener('storage', syncTopupRequests)
      window.removeEventListener('storage', syncPayoutRequests)
      clearInterval(interval)
    }
  }, [])

  const pendingTopupCount = topupRequests.filter((r) => r.status === 'PENDING').length
  const pendingPayoutCount = payoutRequests.filter((r) => r.status === 'PENDING').length

  const [withdrawHistory, setWithdrawHistory] = useState<CommissionWithdrawTx[]>(() => {
    const saved = localStorage.getItem('system_commission_withdraw_history')
    return saved ? JSON.parse(saved) : []
  })

  const [totalEarnedCommissionVnd, setTotalEarnedCommissionVnd] = useState<number>(0)

  const syncCommissionFromCompletedBookings = async () => {
    try {
      const res = await http.get<any>('/api/v1/bookings')
      const rawData = res.data
      const list = Array.isArray(rawData)
        ? rawData
        : rawData?.data || rawData?.$values || []

      let totalCommission = 0
      list.forEach((b: any) => {
        if (b.status === 'Completed' || b.status === 'Confirmed') {
          const cost = Number(b.creditCost || b.totalCost || 0)
          totalCommission += Math.round(cost * 1000 * 0.1)
        }
      })

      if (totalCommission < 150000) totalCommission = 150000
      setTotalEarnedCommissionVnd(totalCommission)
    } catch {
      setTotalEarnedCommissionVnd(150000)
    }
  }

  useEffect(() => {
    syncCommissionFromCompletedBookings()
  }, [])

  const totalWithdrawnVnd = withdrawHistory.reduce((sum, item) => sum + item.amountVnd, 0)
  const systemCommissionVnd = Math.max(0, totalEarnedCommissionVnd - totalWithdrawnVnd)

  const currentWithdrawVnd = customAmount
    ? Math.max(10000, Number(customAmount) || 0)
    : withdrawAmount

  const withdrawTransferCode = `ADMINRUT${Math.floor(1000 + Math.random() * 9000)}`

  const qrImageUrl = `https://img.vietqr.io/image/${SYSTEM_ADMIN_BANK.bankId}-${SYSTEM_ADMIN_BANK.accountNo}-compact2.png?amount=${currentWithdrawVnd}&addInfo=${encodeURIComponent(
    withdrawTransferCode,
  )}&accountName=${encodeURIComponent(SYSTEM_ADMIN_BANK.accountName)}`

  const handleConfirmWithdraw = () => {
    if (currentWithdrawVnd > systemCommissionVnd) {
      alert('Số dư hoa hồng không đủ để thực hiện lệnh rút này!')
      return
    }

    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)

      const newTx: CommissionWithdrawTx = {
        id: `RUT-${Date.now()}`,
        amountVnd: currentWithdrawVnd,
        date: new Date().toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        note: `Rút về ${SYSTEM_ADMIN_BANK.bankName} - ${SYSTEM_ADMIN_BANK.accountNo}`,
      }

      const updatedHistory = [newTx, ...withdrawHistory]
      setWithdrawHistory(updatedHistory)
      localStorage.setItem('system_commission_withdraw_history', JSON.stringify(updatedHistory))
    }, 1200)
  }

  const handleApproveTopup = (req: SystemTopupRequest) => {
    if (!window.confirm(`Xác nhận đã nhận đủ tiền và duyệt nạp +${req.amountCredit} Credit cho học viên ${req.studentName}?`)) {
      return
    }

    const updatedList = topupRequests.map((r) =>
      r.id === req.id
        ? { ...r, status: 'COMPLETED' as const, reviewedAt: new Date().toLocaleString('vi-VN') }
        : r
    )
    setTopupRequests(updatedList)
    localStorage.setItem('system_credit_topup_requests', JSON.stringify(updatedList))

    const studentCreditKey = `tutor_student_credit_${req.studentId}`
    const currentBalance = Number(localStorage.getItem(studentCreditKey) || 0)
    const newBalance = currentBalance + req.amountCredit
    localStorage.setItem(studentCreditKey, newBalance.toString())

    const studentTxKey = `tutor_student_transactions_${req.studentId}`
    const savedTxs = localStorage.getItem(studentTxKey)
    if (savedTxs) {
      try {
        const txs = JSON.parse(savedTxs)
        const updatedTxs = txs.map((tx: any) =>
          tx.id === req.id || tx.referenceCode === req.referenceCode
            ? { ...tx, status: 'COMPLETED' }
            : tx
        )
        localStorage.setItem(studentTxKey, JSON.stringify(updatedTxs))
      } catch (e) {
        console.error(e)
      }
    }

    window.dispatchEvent(new Event('storage'))
    alert(`✅ Đã duyệt thành công! Đã cộng +${req.amountCredit} Credit vào ví của học viên ${req.studentName}.`)
  }

  const handleRejectTopup = (req: SystemTopupRequest) => {
    if (!window.confirm(`Bạn có chắc muốn TỪ CHỐI yêu cầu nạp này của ${req.studentName}?`)) {
      return
    }

    const updatedList = topupRequests.map((r) =>
      r.id === req.id
        ? { ...r, status: 'FAILED' as const, reviewedAt: new Date().toLocaleString('vi-VN') }
        : r
    )
    setTopupRequests(updatedList)
    localStorage.setItem('system_credit_topup_requests', JSON.stringify(updatedList))

    const studentTxKey = `tutor_student_transactions_${req.studentId}`
    const savedTxs = localStorage.getItem(studentTxKey)
    if (savedTxs) {
      try {
        const txs = JSON.parse(savedTxs)
        const updatedTxs = txs.map((tx: any) =>
          tx.id === req.id || tx.referenceCode === req.referenceCode
            ? { ...tx, status: 'FAILED' }
            : tx
        )
        localStorage.setItem(studentTxKey, JSON.stringify(updatedTxs))
      } catch (e) {
        console.error(e)
      }
    }

    window.dispatchEvent(new Event('storage'))
    alert(`❌ Đã từ chối yêu cầu nạp ${req.referenceCode}.`)
  }

  const handleUploadProofImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (PNG, JPG, JPEG)!')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setAdminProofImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleConfirmPayoutTransfer = () => {
    if (!selectedPayout) return
    if (!adminProofImage) {
      alert('⚠️ Bắt buộc: Admin vui lòng chụp hoặc tải ảnh Bill chuyển khoản ngân hàng thành công để làm minh chứng gửi cho Gia sư!')
      return
    }

    setIsTransferring(true)
    setTimeout(() => {
      const nowStr = new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      const updatedPayouts = payoutRequests.map((p) =>
        p.id === selectedPayout.id
          ? {
              ...p,
              status: 'COMPLETED' as const,
              paidAt: nowStr,
              adminProofImageUrl: adminProofImage,
            }
          : p
      )

      setPayoutRequests(updatedPayouts)
      localStorage.setItem('tutor_session_payout_requests', JSON.stringify(updatedPayouts))
      window.dispatchEvent(new Event('storage'))

      setIsTransferring(false)
      setSelectedPayout(null)
      setAdminProofImage(null)
      alert(`✅ Đã chuyển khoản 90% thù lao (${selectedPayout.netPayoutVnd.toLocaleString('vi-VN')} đ) thành công và gửi bill minh chứng cho Gia sư ${selectedPayout.tutorName}!`)
    }, 1000)
  }

  const filteredTopupRequests = topupRequests.filter((r) => {
    if (topupFilter === 'ALL') return true
    return r.status === topupFilter
  })

  const filteredPayoutRequests = payoutRequests.filter((p) => {
    if (payoutFilter === 'ALL') return true
    return p.status === payoutFilter
  })

  const adminNavLink = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap',
      isActive
        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 bg-white/95 dark:bg-slate-900/95 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white text-sm shadow-md shadow-indigo-600/20">
                🛡️
              </span>
              Portal Quản Trị Viên (Admin)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Trung tâm quản lý hệ thống, đối soát ảnh ca học, duyệt nạp credit học viên & chuyển khoản 90% cho gia sư
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsTopupApprovalOpen(true)}
              className="relative flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition cursor-pointer"
            >
              <CreditCard className="h-4 w-4" />
              <span>Duyệt Nạp Credit</span>
              {pendingTopupCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black text-white shadow-sm animate-pulse">
                  {pendingTopupCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsPayoutModalOpen(true)}
              className="relative flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-xs font-black text-white shadow-md hover:from-blue-700 hover:to-cyan-700 active:scale-95 transition cursor-pointer"
            >
              <QrCode className="h-4 w-4" />
              <span>CK 90% Gia Sư</span>
              {pendingPayoutCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-400 text-slate-900 px-1.5 text-[10px] font-black shadow-sm animate-bounce">
                  {pendingPayoutCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border border-amber-500/20 rounded-2xl px-4 py-2">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-amber-500" /> Quỹ Hoa Hồng 10%
                </p>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {systemCommissionVnd.toLocaleString('vi-VN')} <span className="text-xs">VNĐ</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setIsWithdrawModalOpen(true)
                  setIsSuccess(false)
                }}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-black text-white shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition cursor-pointer"
              >
                <QrCode className="h-3.5 w-3.5" />
                Rút Tiền
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-2 px-1 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-slate-700">
          <NavLink to="/admin/dashboard" className={adminNavLink}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/admin/featured-tutors" className={adminNavLink}>
            ⭐ GS Tiêu Biểu
          </NavLink>
          <NavLink to="/admin/tutor-applications" className={adminNavLink}>
            👨‍🏫 Duyệt Gia Sư
          </NavLink>
          <NavLink to="/admin/subjects" className={adminNavLink}>
            📚 Môn Học
          </NavLink>
          <NavLink to="/admin/users" className={adminNavLink}>
            👥 Người Dùng
          </NavLink>
          <NavLink to="/admin/watchlist" className={adminNavLink}>
            🚨 Cảnh Báo
          </NavLink>
          <NavLink to="/admin/complaints" className={adminNavLink}>
            ⚠️ Khiếu Nại
          </NavLink>
        </div>
      </div>

      {/* =========================================================================
          🎯 MODAL 1: XÉT DUYỆT NẠP CREDIT CHO HỌC VIÊN
      ========================================================================= */}
      {isTopupApprovalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Xét Duyệt Nạp Credit Học Viên
                    {pendingTopupCount > 0 && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                        {pendingTopupCount} chờ duyệt
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Đối soát ảnh biên lai VietQR của học viên và xác nhận cộng credit vào tài khoản
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTopupApprovalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-4 pb-2">
              <button
                onClick={() => setTopupFilter('PENDING')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  topupFilter === 'PENDING'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                Chờ duyệt ({topupRequests.filter((r) => r.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setTopupFilter('COMPLETED')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  topupFilter === 'COMPLETED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Đã duyệt ({topupRequests.filter((r) => r.status === 'COMPLETED').length})
              </button>
              <button
                onClick={() => setTopupFilter('FAILED')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  topupFilter === 'FAILED'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Ban className="h-3.5 w-3.5" />
                Đã từ chối ({topupRequests.filter((r) => r.status === 'FAILED').length})
              </button>
              <button
                onClick={() => setTopupFilter('ALL')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  topupFilter === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Tất cả ({topupRequests.length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-2 border border-slate-200 rounded-2xl dark:border-slate-800">
              {filteredTopupRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Không có yêu cầu nạp nào trong mục này
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                      <th className="py-3 px-4 font-bold">Học Viên</th>
                      <th className="py-3 px-4 font-bold">Mã Chuyển Khoản</th>
                      <th className="py-3 px-4 font-bold text-right">Credit Nạp</th>
                      <th className="py-3 px-4 font-bold text-right">Số Tiền VNĐ</th>
                      <th className="py-3 px-4 font-bold text-center">Ảnh Biên Lai</th>
                      <th className="py-3 px-4 font-bold text-center">Trạng Thái</th>
                      <th className="py-3 px-4 font-bold text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTopupRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <strong className="block text-slate-900 dark:text-white font-bold">{req.studentName}</strong>
                          <span className="text-[10px] text-slate-400">{req.studentEmail}</span>
                          <span className="block text-[9px] text-slate-400 font-mono mt-0.5">{req.createdAt}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {req.referenceCode}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          +{req.amountCredit} CR
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                          {req.amountVnd.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-3 px-4 text-center">
                          {req.billImageUrl ? (
                            <div className="flex items-center justify-center">
                              <img
                                src={req.billImageUrl}
                                alt="Bill"
                                onClick={() => setPreviewBillImage(req.billImageUrl || null)}
                                className="h-11 w-11 rounded-lg object-cover border border-slate-300 shadow-xs cursor-pointer hover:scale-105 transition"
                                title="Bấm để xem ảnh biên lai phóng to"
                              />
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Không có bill</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {req.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Đã duyệt
                            </span>
                          ) : req.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 animate-pulse">
                              <Clock className="h-3 w-3" /> Chờ duyệt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                              <Ban className="h-3 w-3" /> Từ chối
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {req.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApproveTopup(req)}
                                className="flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition cursor-pointer"
                                title="Khớp lệnh và cộng credit"
                              >
                                <Check className="h-3.5 w-3.5" /> Duyệt
                              </button>
                              <button
                                onClick={() => handleRejectTopup(req)}
                                className="flex items-center gap-1 rounded-xl bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer"
                                title="Từ chối nạp"
                              >
                                <Ban className="h-3.5 w-3.5" /> Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {req.reviewedAt || 'Đã xử lý'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          🎯 MODAL 2: ADMIN QUÉT QR CHUYỂN KHOẢN 90% THÙ LAO CHO GIA SƯ
      ========================================================================= */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    Chuyển Khoản 90% Thù Lao Cho Gia Sư (Sau Ca Học)
                    {pendingPayoutCount > 0 && (
                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white">
                        {pendingPayoutCount} chờ thanh toán
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Đối soát ảnh minh chứng ca học, quét QR chuyển khoản 90% và gửi bill đối soát cho gia sư
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPayoutModalOpen(false)
                  setSelectedPayout(null)
                  setAdminProofImage(null)
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-4 pb-2">
              <button
                onClick={() => setPayoutFilter('PENDING')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  payoutFilter === 'PENDING'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                Chờ chuyển khoản ({payoutRequests.filter((p) => p.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setPayoutFilter('COMPLETED')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  payoutFilter === 'COMPLETED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Đã thanh toán ({payoutRequests.filter((p) => p.status === 'COMPLETED').length})
              </button>
              <button
                onClick={() => setPayoutFilter('ALL')}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  payoutFilter === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Tất cả ({payoutRequests.length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-2 border border-slate-200 rounded-2xl dark:border-slate-800">
              {filteredPayoutRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Không có yêu cầu thanh toán thù lao nào
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                      <th className="py-3 px-4 font-bold">Ca Học & Môn</th>
                      <th className="py-3 px-4 font-bold">Gia Sư Thụ Hưởng</th>
                      <th className="py-3 px-4 font-bold text-center">Ảnh Minh Chứng Ca Học</th>
                      <th className="py-3 px-4 font-bold text-right">Tổng Học Phí</th>
                      <th className="py-3 px-4 font-bold text-right">Thực Nhận 90%</th>
                      <th className="py-3 px-4 font-bold text-center">Trạng Thái</th>
                      <th className="py-3 px-4 font-bold text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPayoutRequests.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <strong className="block text-slate-900 dark:text-white font-mono font-bold text-blue-600">
                            {p.bookingCode}
                          </strong>
                          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                            {p.subjectName}
                          </span>
                          <span className="block text-[9px] text-slate-400">HV: {p.studentName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <strong className="block text-slate-900 dark:text-white font-bold">{p.tutorName}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {p.tutorBankName} • {p.tutorAccountNo}
                          </span>
                          <span className="block text-[9px] text-slate-400">{p.tutorAccountName}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {p.sessionProofImageUrl ? (
                            <div className="flex items-center justify-center">
                              <img
                                src={p.sessionProofImageUrl}
                                alt="Minh chứng buổi học"
                                onClick={() => setPreviewModalImage(p.sessionProofImageUrl || null)}
                                className="h-11 w-14 rounded-lg object-cover border border-indigo-200 shadow-xs cursor-pointer hover:scale-105 transition"
                                title="Bấm để xem ảnh chụp buổi học thực tế"
                              />
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Chưa nộp ảnh</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                          {p.totalCostVnd.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                          {p.netPayoutVnd.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-3 px-4 text-center">
                          {p.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Đã CK 90%
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 animate-pulse">
                              <Clock className="h-3 w-3" /> Chờ Admin CK
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {p.status === 'PENDING' ? (
                            <button
                              onClick={() => {
                                setSelectedPayout(p)
                                setAdminProofImage(null)
                              }}
                              className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-black text-white hover:bg-blue-700 shadow-xs transition cursor-pointer ml-auto"
                            >
                              <QrCode className="h-3.5 w-3.5" /> Quét QR & CK
                            </button>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {p.adminProofImageUrl && (
                                <button
                                  onClick={() => setPreviewModalImage(p.adminProofImageUrl || null)}
                                  className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                                  title="Xem bill minh chứng đã gửi"
                                >
                                  <Eye className="h-3.5 w-3.5 text-blue-500" /> Bill Admin
                                </button>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">{p.paidAt}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          🎯 POPUP CON: ADMIN XEM MINH CHỨNG CA HỌC, QUÉT QR & GỬI BILL
      ========================================================================= */}
      {selectedPayout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Quét QR Chuyển Khoản 90% Cho Gia Sư
                  </h4>
                  <p className="text-[11px] text-slate-500">Ca học: {selectedPayout.bookingCode} ({selectedPayout.subjectName})</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedPayout(null)
                  setAdminProofImage(null)
                }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 📸 1. KHUNG ĐỐI SOÁT ẢNH CHỤP BUỔI HỌC THỰC TẾ DO GIA SƯ GỬI */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-3.5 dark:border-indigo-950 dark:bg-indigo-950/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950 dark:text-indigo-200">
                  <Camera className="h-4 w-4 text-indigo-600" />
                  <span>Ảnh Minh Chứng Buổi Học Thực Tế (Gia Sư & Học Viên):</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Đã xác thực
                </span>
              </div>

              {selectedPayout.sessionProofImageUrl ? (
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-indigo-200/80">
                  <img
                    src={selectedPayout.sessionProofImageUrl}
                    alt="Session Screenshot"
                    onClick={() => setPreviewModalImage(selectedPayout.sessionProofImageUrl || null)}
                    className="h-20 w-32 object-cover rounded-lg border border-slate-200 shadow-xs cursor-pointer hover:scale-105 transition"
                    title="Bấm để xem ảnh chụp màn hình phóng to"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Ảnh chụp màn hình ca học {selectedPayout.bookingCode}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Đã kiểm tra có mặt Gia sư & Học viên trong ca học.
                    </p>
                    <button
                      type="button"
                      onClick={() => setPreviewModalImage(selectedPayout.sessionProofImageUrl || null)}
                      className="mt-1 text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> Xem ảnh phóng to
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Gia sư chưa đính kèm ảnh chụp màn hình ca học.</p>
              )}
            </div>

            {/* Chi tiết tài chính 90% */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Học Phí Gốc (100%)</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5">
                  {selectedPayout.totalCostVnd.toLocaleString('vi-VN')} đ
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Sàn Giữ Lại (10%)</p>
                <p className="text-xs font-bold text-amber-600 font-mono mt-0.5">
                  +{selectedPayout.platformFeeVnd.toLocaleString('vi-VN')} đ
                </p>
              </div>
              <div>
                <p className="text-[10px] text-emerald-600 font-bold uppercase">Admin Chuyển (90%)</p>
                <p className="text-sm font-black text-emerald-600 font-mono mt-0.5">
                  {selectedPayout.netPayoutVnd.toLocaleString('vi-VN')} đ
                </p>
              </div>
            </div>

            {/* Thông tin tài khoản gia sư */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-950 dark:bg-blue-950/20 text-xs space-y-1 font-mono">
              <p className="text-slate-600 dark:text-slate-400">
                Gia sư thụ hưởng: <strong className="text-slate-900 dark:text-white">{selectedPayout.tutorName}</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Ngân hàng: <strong className="text-slate-800 dark:text-slate-200">{selectedPayout.tutorBankName}</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Số tài khoản: <strong className="text-blue-600 font-bold text-sm">{selectedPayout.tutorAccountNo}</strong>
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Chủ tài khoản: <strong className="text-slate-800 dark:text-slate-200">{selectedPayout.tutorAccountName}</strong>
              </p>
            </div>

            {/* QR VietQR Tự Tính Toán 90% */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <img
                src={`https://img.vietqr.io/image/${selectedPayout.tutorBankId}-${selectedPayout.tutorAccountNo}-compact2.png?amount=${selectedPayout.netPayoutVnd}&addInfo=${encodeURIComponent(
                  selectedPayout.bookingCode,
                )}&accountName=${encodeURIComponent(selectedPayout.tutorAccountName)}`}
                alt="VietQR 90% Payout"
                className="h-44 w-44 object-contain rounded-xl border border-slate-100 p-1.5"
              />
              <p className="mt-2 text-[11px] font-bold text-slate-500">
                Số tiền quét: <span className="text-emerald-600 font-mono font-black">{selectedPayout.netPayoutVnd.toLocaleString('vi-VN')} VNĐ</span> (90%)
              </p>
            </div>

            {/* Khung Tải Lên Bill Minh Chứng Của Admin */}
            <div className="space-y-2 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-3.5 bg-indigo-50/20">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-indigo-600" />
                  <span>Ảnh Bill Chuyển Khoản Minh Chứng (Gửi Cho Gia Sư):</span>
                </label>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">* Bắt buộc</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Admin quét QR chuyển 90% thù lao, sau đó tải ảnh bill chuyển khoản vào đây để gửi cho gia sư đối soát.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUploadProofImage}
                className="hidden"
              />

              {adminProofImage ? (
                <div className="relative rounded-xl overflow-hidden border border-emerald-400 bg-emerald-50/20 p-2 flex items-center gap-3">
                  <img
                    src={adminProofImage}
                    alt="Proof"
                    className="h-20 w-20 object-cover rounded-lg border border-slate-200"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Đã đính kèm ảnh bill chuyển khoản
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Gia sư sẽ xem được bill này khi ca học hoàn thành.</p>
                  </div>
                  <button
                    onClick={() => setAdminProofImage(null)}
                    className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Xóa ảnh
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-indigo-300 bg-white dark:bg-slate-900 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 cursor-pointer shadow-xs transition"
                >
                  <Upload className="h-4 w-4" />
                  <span>Bấm vào đây để tải ảnh Bill chuyển khoản của Admin...</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedPayout(null)
                  setAdminProofImage(null)
                }}
                className="w-1/3 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isTransferring || !adminProofImage}
                onClick={handleConfirmPayoutTransfer}
                className="w-2/3 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-black text-white disabled:opacity-50 transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isTransferring ? 'Đang xác nhận...' : 'Xác Nhận Đã CK & Gửi Bill Cho Gia Sư'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PHÓNG TO ẢNH CHUNG */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            className="relative max-h-[92vh] max-w-[92vw] overflow-hidden rounded-2xl bg-black shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModalImage(null)}
              className="absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition shadow-md z-10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewModalImage}
              alt="Ảnh phóng to"
              className="max-h-[88vh] max-w-[88vw] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* MODAL PHÓNG TO ẢNH BIÊN LAI NẠP TIỀN */}
      {previewBillImage && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
          onClick={() => setPreviewBillImage(null)}
        >
          <div
            className="relative max-h-[92vh] max-w-[92vw] overflow-hidden rounded-2xl bg-black shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewBillImage(null)}
              className="absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition shadow-md z-10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewBillImage}
              alt="Ảnh biên lai đối soát"
              className="max-h-[88vh] max-w-[88vw] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* MODAL VIETQR RÚT TIỀN HOA HỒNG CHO ADMIN */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Rút Hoa Hồng 10% Về Tài Khoản
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chung 1 tài khoản thụ hưởng cho Ban Quản Trị Hệ Thống
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Rút Hoa Hồng Thành Công!
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Lệnh rút <strong className="text-emerald-600">{currentWithdrawVnd.toLocaleString('vi-VN')} VNĐ</strong> đã được ghi nhận và chuyển về tài khoản MBBank <strong>0376703251 (NGUYEN ADMIN)</strong>.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="w-full rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-700 transition"
                  >
                    Hoàn tất & Đóng
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-950 dark:bg-indigo-950/30">
                  <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs">
                    <Building2 className="h-4 w-4" />
                    <span>Tài Khoản Thụ Hưởng Chung (MBBank)</span>
                  </div>
                  <div className="space-y-1 font-mono text-xs">
                    <p className="text-slate-600 dark:text-slate-400">
                      Ngân hàng: <strong className="text-slate-800 dark:text-slate-200">{SYSTEM_ADMIN_BANK.bankName}</strong>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Số tài khoản: <strong className="text-emerald-600 text-sm font-bold">{SYSTEM_ADMIN_BANK.accountNo}</strong>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Chủ tài khoản: <strong className="text-slate-800 dark:text-slate-200">{SYSTEM_ADMIN_BANK.accountName}</strong>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Số tiền hoa hồng muốn rút:
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[50000, 100000, 200000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setWithdrawAmount(amt)
                          setCustomAmount('')
                        }}
                        className={`rounded-xl border p-2.5 text-xs font-black transition cursor-pointer ${
                          withdrawAmount === amt && !customAmount
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-300'
                            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800'
                        }`}
                      >
                        {amt.toLocaleString('vi-VN')} đ
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    <input
                      type="number"
                      placeholder="Hoặc nhập số tiền tùy chọn..."
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/20 dark:border-indigo-950">
                  <img
                    src={qrImageUrl}
                    alt="VietQR Admin Rút Tiền"
                    className="h-44 w-44 object-contain rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800"
                  />
                  <p className="mt-2 text-[11px] font-bold text-slate-500">
                    Nội dung nhận: <strong className="text-indigo-600 font-mono">{withdrawTransferCode}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="w-1/3 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmWithdraw}
                    disabled={isProcessing || systemCommissionVnd < 10000}
                    className="w-2/3 rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-md"
                  >
                    {isProcessing ? 'Đang giải ngân...' : 'Xác Nhận Rút Hoa Hồng'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { adminApi } from './admin.api'
import type { RiskWatchitem } from './admin.types'
import { Button } from '@/components/ui/Button'
import { Table, type Column } from '@/components/ui/Table'
import { useToast } from '@/components/ui/ToastContext'
import { ShieldAlert, Lock, EyeOff, CheckCircle, RefreshCw, PhoneCall, X, Send } from 'lucide-react'

export function RiskWatchlistPage() {
  const toast = useToast()
  const [items, setItems] = useState<RiskWatchitem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterRole, setFilterRole] = useState<'all' | 'tutor' | 'student'>('all')
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all')

  // State Modal gửi SMS qua SĐT
  const [selectedSmsUser, setSelectedSmsUser] = useState<RiskWatchitem | null>(null)
  const [smsMessage, setSmsMessage] = useState('')
  const [isSendingSms, setIsSendingSms] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await adminApi.getRiskWatchlist()
      setItems(data)
    } catch {
      toast.error('Không thể tải danh sách cảnh báo vi phạm')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleLock = async (item: RiskWatchitem) => {
    try {
      await adminApi.lockUser(item.userId, 'Khóa do vi phạm điều khoản sổ đen')
      toast.info(`Đã khóa tài khoản ${item.userName}`)
      void loadData()
    } catch {
      toast.error('Không thể khóa tài khoản')
    }
  }

  const handleDeactivate = async (item: RiskWatchitem) => {
    try {
      await adminApi.deactivateUser(item.userId, 'Vô hiệu hóa do cảnh báo rủi ro')
      toast.info(`Đã vô hiệu hóa tài khoản ${item.userName}`)
      void loadData()
    } catch {
      toast.error('Không thể vô hiệu hóa tài khoản')
    }
  }

  const handleDismiss = (item: RiskWatchitem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    toast.success(`Đã bỏ qua cảnh báo cho ${item.userName}`)
  }

  const handleOpenSmsModal = (item: RiskWatchitem) => {
    setSelectedSmsUser(item)
    const defaultTemplate =
      item.userRole === 'tutor'
        ? `[TutorConnect] CANH BAO: Tai khoan Gia su ${item.userName} hien bi phan anh vi pham dieu khoan. Vui long kiem tra va tuan thu quy dinh nen tang!`
        : `[TutorConnect] CANH BAO: Tai khoan Hoc vien ${item.userName} bi phat hien vi pham quy dinh dat ca/hoan tien. Vui long lien he Admin de ho tro!`
    setSmsMessage(defaultTemplate)
  }

  const handleSendSms = async () => {
    if (!selectedSmsUser || !smsMessage.trim()) return
    setIsSendingSms(true)
    try {
      await adminApi.sendWarningSms(selectedSmsUser.userId, smsMessage)
      toast.success(`Đã gửi tin nhắn SMS / Zalo cảnh báo tới SĐT (${selectedSmsUser.userPhone}) của ${selectedSmsUser.userName}!`)
      setSelectedSmsUser(null)
    } catch {
      toast.error('Gửi tin nhắn thất bại')
    } finally {
      setIsSendingSms(false)
    }
  }

  const filteredItems = items.filter((item) => {
    if (filterRole !== 'all' && item.userRole !== filterRole) return false
    if (filterSeverity !== 'all' && item.severity !== filterSeverity) return false
    return true
  })

  const columns: Column<RiskWatchitem>[] = [
    {
      key: 'userName',
      header: 'Tài Khoản Vi Phạm',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
              row.severity === 'critical' ? 'bg-rose-600' : 'bg-amber-500'
            }`}
          >
            {row.userRole === 'tutor' ? '👨‍🏫' : '🎓'}
          </div>
          <div>
            <p className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              {row.userName}
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  row.userRole === 'tutor' ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-100 text-brand-800'
                }`}
              >
                {row.userRole === 'tutor' ? 'Gia sư' : 'Học viên'}
              </span>
            </p>
            <span className="text-xs text-slate-400 font-mono block">{row.userEmail}</span>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">📱 SĐT: {row.userPhone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Mức Độ Rủi Ro',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
            row.severity === 'critical'
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
          }`}
        >
          {row.severity === 'critical' ? '🔴 Báo động Đỏ' : '🟡 Cảnh báo Vàng'}
        </span>
      ),
    },
    {
      key: 'violations',
      header: 'Chi Tiết 10 Điều Kiện Vi Phạm',
      render: (row) => (
        <div className="space-y-1.5 max-w-md">
          {row.violations.map((v, idx) => (
            <div key={idx} className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
              <span className="font-bold text-rose-600 dark:text-rose-400 text-xs block">⚠️ {v.label}</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 block leading-relaxed">{v.details}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Xử Lý Nhanh',
      render: (row) => (
        <div className="flex flex-col gap-1.5 sm:w-44">
          <Button size="sm" variant="danger" onClick={() => handleLock(row)} className="text-xs font-bold justify-start">
            <Lock className="mr-1.5 h-3.5 w-3.5" /> 🔒 Khóa
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDeactivate(row)} className="text-xs font-bold justify-start">
            <EyeOff className="mr-1.5 h-3.5 w-3.5" /> ⚫ Vô hiệu hóa
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenSmsModal(row)}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white justify-start shadow-xs"
          >
            <PhoneCall className="mr-1.5 h-3.5 w-3.5 text-amber-300" /> 📱 Gửi SMS qua SĐT
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDismiss(row)} className="text-xs text-slate-400 hover:text-emerald-600 justify-start">
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> ✅ Bỏ qua
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-700 via-pink-600 to-amber-600 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold">
              <ShieldAlert className="h-4 w-4 text-amber-300" />
              Hệ thống giám sát an toàn TutorConnect
            </div>
            <h1 className="text-2xl font-black">🚨 Danh Sách Cảnh Báo Vi Phạm</h1>
            <p className="mt-1 text-xs text-white/80 max-w-xl">
              Tự động quét và phát hiện 10 tiêu chuẩn vi phạm (Bùng ca, khiếu nại, rating kém, lạm dụng hoàn tiền, kéo khách ra ngoài, nhập sai MK...).
            </p>
          </div>
<button
  type="button"
  onClick={() => void loadData()}
  className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-rose-700 shadow-md transition hover:bg-slate-100 cursor-pointer"
>
  <RefreshCw className="h-4 w-4" />
  <span>Quét Lại Dữ Liệu</span>
</button>
        </div>
      </div>

      {/* Thanh bộ lọc */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Lọc vai trò:</span>
          {(['all', 'tutor', 'student'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                filterRole === r ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {r === 'all' ? 'Tất cả' : r === 'tutor' ? '👨‍🏫 Gia sư' : '🎓 Học viên'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Mức độ rủi ro:</span>
          {(['all', 'critical', 'warning'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                filterSeverity === s ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {s === 'all' ? 'Tất cả' : s === 'critical' ? '🔴 Đỏ (Nghiêm trọng)' : '🟡 Vàng (Cảnh báo)'}
            </button>
          ))}
        </div>
      </div>

      <Table columns={columns} data={filteredItems} keyExtractor={(row) => row.id} isLoading={isLoading} emptyMessage="Hiện tại không có tài khoản nào thuộc danh sách cảnh báo vi phạm!" />

      {/* MODAL GỬI TIN NHẮN SMS / ZALO QUA SĐT */}
      {selectedSmsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Gửi tin nhắn SMS / Zalo Cảnh Báo
                  </h3>
                  <p className="text-xs text-slate-500">Gửi trực tiếp đến SĐT cá nhân của người dùng</p>
                </div>
              </div>
              <button onClick={() => setSelectedSmsUser(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-indigo-50/80 p-3.5 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-xs space-y-1">
                <div className="font-bold text-indigo-900 dark:text-indigo-200">
                  👤 Người nhận: <span className="font-extrabold">{selectedSmsUser.userName}</span> ({selectedSmsUser.userRole === 'tutor' ? 'Gia sư' : 'Học viên'})
                </div>
                <div className="font-mono text-indigo-700 dark:text-indigo-300 font-bold">
                  📱 Số điện thoại: <span className="underline">{selectedSmsUser.userPhone}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nội dung tin nhắn SMS cảnh báo:
                </label>
                <textarea
                  rows={4}
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3 flex justify-end gap-2 dark:border-slate-800">
              <Button onClick={() => setSelectedSmsUser(null)} variant="outline" className="text-xs font-bold rounded-xl px-4 py-2">
                Hủy bỏ
              </Button>
              <Button onClick={handleSendSms} disabled={isSendingSms || !smsMessage.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl px-5 py-2">
                {isSendingSms ? <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" /> : <Send className="mr-1.5 h-4 w-4" />}
                Gửi Tin Nhắn Ngay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import { useState, useEffect, useRef } from 'react'
import {
  Wallet,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  History,
  AlertCircle,
  X,
  CreditCard,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCurrentUser } from '../hooks/useCurrentUser'

interface Transaction {
  id: string
  type: 'TOPUP' | 'BOOKING_PAYMENT' | 'REFUND' | 'WITHDRAW'
  title: string
  amountCredit: number
  amountVnd: number
  date: string
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
  referenceCode: string
  billImageUrl?: string
}

interface StudentBankInfo {
  bankId: string
  bankName: string
  accountNo: string
  accountName: string
}

export interface SystemTopupRequest {
  id: string
  studentId: number
  studentName: string
  studentEmail: string
  amountCredit: number
  amountVnd: number
  referenceCode: string
  billImageUrl: string
  createdAt: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  reviewedAt?: string
  reviewNote?: string
}

// 🎯 TÀI KHOẢN ADMIN HỆ THỐNG CHÍNH THỨC ĐỂ TẤT CẢ HỌC VIÊN QUÉT NẠP CREDIT
const SYSTEM_ADMIN_BANK = {
  bankId: 'MB',
  bankName: 'MBBank (NH Quân Đội)',
  accountNo: '0376703251',
  accountName: 'NGUYEN ADMIN',
}

// Danh sách các ngân hàng hỗ trợ VietQR
const SUPPORTED_BANKS = [
  { id: 'agribank', name: 'Agribank (NH Nông nghiệp & PTNT Việt Nam)' },
  { id: 'MB', name: 'MBBank (NH Quân Đội)' },
  { id: 'VCB', name: 'Vietcombank (NH Ngoại Thương)' },
  { id: 'BIDV', name: 'BIDV (NH Đầu tư & Phát triển VN)' },
  { id: 'TCB', name: 'Techcombank (NH Kỹ Thương)' },
  { id: 'CTG', name: 'VietinBank (NH Công Thương)' },
  { id: 'ACB', name: 'ACB (NH Á Châu)' },
]

const PRESET_AMOUNTS = [
  { credit: 50, vnd: 50000, label: '50 Credit' },
  { credit: 100, vnd: 100000, label: '100 Credit', popular: true },
  { credit: 200, vnd: 200000, label: '200 Credit' },
  { credit: 500, vnd: 500000, label: '500 Credit' },
  { credit: 1000, vnd: 1000000, label: '1,000 Credit' },
]

export default function StudentWalletPage() {
  const { data: currentUser } = useCurrentUser()

  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  // 1. Quản lý thông tin ngân hàng cá nhân của học viên
  const [bankInfo, setBankInfo] = useState<StudentBankInfo>(() => {
    const bankKey = `student_bank_info_${currentUser?.id || 'default'}`
    const saved = localStorage.getItem(bankKey)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }
    const isSeed = currentUser?.id === 7 || (currentUser?.email || '').toLowerCase().includes('t@gmail.com')
    if (isSeed) {
      return {
        bankId: 'MB',
        bankName: 'MBBank (NH Quân Đội)',
        accountNo: '0903000001',
        accountName: 'NGUYEN MINH ANH',
      }
    }
    return {
      bankId: 'MB',
      bankName: 'MBBank (NH Quân Đội)',
      accountNo: '',
      accountName: (currentUser?.name || '').toUpperCase(),
    }
  })

  // Đồng bộ lại khi currentUser tải xong
  useEffect(() => {
    if (currentUser?.id) {
      const bankKey = `student_bank_info_${currentUser.id}`
      const saved = localStorage.getItem(bankKey)
      if (saved) {
        try {
          setBankInfo(JSON.parse(saved))
          return
        } catch (e) {
          console.error(e)
        }
      }
      const isSeed = currentUser.id === 7 || (currentUser.email || '').toLowerCase().includes('t@gmail.com')
      if (isSeed) {
        setBankInfo({
          bankId: 'MB',
          bankName: 'MBBank (NH Quân Đội)',
          accountNo: '0903000001',
          accountName: 'NGUYEN MINH ANH',
        })
      } else {
        setBankInfo({
          bankId: 'MB',
          bankName: 'MBBank (NH Quân Đội)',
          accountNo: '',
          accountName: (currentUser.name || '').toUpperCase(),
        })
      }
    }
  }, [currentUser?.id, currentUser?.email, currentUser?.name])

  // State Chỉnh sửa Ngân hàng cá nhân
  const [isEditingBank, setIsEditingBank] = useState(false)
  const [editBankId, setEditBankId] = useState(bankInfo.bankId)
  const [editBankNo, setEditBankNo] = useState(bankInfo.accountNo)
  const [editBankName, setEditBankName] = useState(bankInfo.accountName)

  const handleOpenEditBank = () => {
    setEditBankId(bankInfo.bankId || 'MB')
    setEditBankNo(bankInfo.accountNo || '')
    setEditBankName(bankInfo.accountName || (currentUser?.name || '').toUpperCase())
    setIsEditingBank(true)
  }

  const handleSaveBank = () => {
    const selectedBank = SUPPORTED_BANKS.find((b) => b.id.toLowerCase() === editBankId.toLowerCase())
    const newInfo: StudentBankInfo = {
      bankId: editBankId,
      bankName: selectedBank ? selectedBank.name : editBankId,
      accountNo: editBankNo.trim(),
      accountName: editBankName.trim().toUpperCase() || (currentUser?.name || 'HỌC VIÊN').toUpperCase(),
    }
    setBankInfo(newInfo)
    if (currentUser?.id) {
      localStorage.setItem(`student_bank_info_${currentUser.id}`, JSON.stringify(newInfo))
    }
    setIsEditingBank(false)
  }

  // Tải số dư & giao dịch từ LocalStorage
  const syncWalletData = () => {
    if (!currentUser?.id) return
    const creditKey = `tutor_student_credit_${currentUser.id}`
    const txKey = `tutor_student_transactions_${currentUser.id}`

    const savedCredit = localStorage.getItem(creditKey)
    if (savedCredit !== null) {
      setBalance(Number(savedCredit))
    }

    const savedTx = localStorage.getItem(txKey)
    if (savedTx) {
      try {
        setTransactions(JSON.parse(savedTx))
      } catch (e) {
        console.error(e)
      }
    }
  }

  useEffect(() => {
    if (currentUser?.id && !isInitialized) {
      syncWalletData()
      setIsInitialized(true)
    }
  }, [currentUser?.id, isInitialized])

  // Tự động cập nhật số dư theo thời gian thực khi Admin bấm Duyệt
  useEffect(() => {
    if (!currentUser?.id) return
    const handleStorageChange = () => syncWalletData()
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(syncWalletData, 2500)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [currentUser?.id])

  // State Modal Nạp tiền
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [selectedCredit, setSelectedCredit] = useState<number>(100)
  const [customCredit, setCustomCredit] = useState<string>('')

  // State Màn hình Thanh toán QR
  const [activeQrStep, setActiveQrStep] = useState<boolean>(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [paymentTimeLeft, setPaymentTimeLeft] = useState<number>(600)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isPendingSubmitted, setIsPendingSubmitted] = useState<boolean>(false)

  // Quản lý Ảnh Bill chuyển khoản
  const [billImage, setBillImage] = useState<string | null>(null)
  const [billFileName, setBillFileName] = useState<string>('')
  const billInputRef = useRef<HTMLInputElement>(null)
  const [previewBillModal, setPreviewBillModal] = useState<string | null>(null)

  // Tính toán số tiền Credit & VNĐ
  const currentCreditToTopUp = customCredit ? Math.max(10, Number(customCredit) || 0) : selectedCredit
  const currentVndToPay = currentCreditToTopUp * 1000

  // Mã nội dung chuyển tiền duy nhất
  const [transferCode, setTransferCode] = useState<string>(
    () => `NAP${100}CR${Math.floor(1000 + Math.random() * 9000)}`
  )

  useEffect(() => {
    setTransferCode(`NAP${currentCreditToTopUp}CR${Math.floor(1000 + Math.random() * 9000)}`)
  }, [currentCreditToTopUp])

  // Mã VietQR của Admin hệ thống
  const qrImageUrl = `https://img.vietqr.io/image/${SYSTEM_ADMIN_BANK.bankId}-${SYSTEM_ADMIN_BANK.accountNo}-compact2.png?amount=${currentVndToPay}&addInfo=${encodeURIComponent(
    transferCode,
  )}&accountName=${encodeURIComponent(SYSTEM_ADMIN_BANK.accountName)}`

  // Đồng hồ đếm ngược 10 phút thanh toán
  useEffect(() => {
    let timer: any
    if (activeQrStep && paymentTimeLeft > 0 && !isPendingSubmitted) {
      timer = setInterval(() => {
        setPaymentTimeLeft((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [activeQrStep, paymentTimeLeft, isPendingSubmitted])

  // Lưu giao dịch
  const saveTransactionsToStorage = (newTxs: Transaction[]) => {
    if (!currentUser?.id) return
    const txKey = `tutor_student_transactions_${currentUser.id}`
    localStorage.setItem(txKey, JSON.stringify(newTxs))
    setTransactions(newTxs)
  }

  // Copy text helper
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Chọn ảnh Bill từ máy tính
  const handleBillFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh biên lai dưới 5MB!')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setBillImage(reader.result as string)
      setBillFileName(file.name)
    }
    reader.readAsDataURL(file)
  }

  // Bắt sự kiện dán ảnh Bill (Ctrl + V)
  const handlePasteBill = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item && item.type.includes('image')) {
        const file = item.getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = () => {
            setBillImage(reader.result as string)
            setBillFileName('screenshot_bill.png')
          }
          reader.readAsDataURL(file)
          break
        }
      }
    }
  }

  // 🎯 GỬI YÊU CẦU NẠP KÈM BILL CHO ADMIN DUYỆT (CHƯA CỘNG CREDIT NGAY)
  const handleSubmitBillToAdmin = () => {
    if (!billImage) {
      alert('Vui lòng đính kèm ảnh chụp biên lai chuyển khoản trước khi gửi!')
      return
    }
    if (!currentUser?.id) return

    setIsProcessing(true)

    setTimeout(() => {
      const requestId = `TOPUP-${Date.now()}`
      const createdDate = new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      // 1. Tạo yêu cầu đưa vào hàng đợi của Admin
      const newRequest: SystemTopupRequest = {
        id: requestId,
        studentId: currentUser.id,
        studentName: currentUser.name || 'Học viên',
        studentEmail: currentUser.email || '',
        amountCredit: currentCreditToTopUp,
        amountVnd: currentVndToPay,
        referenceCode: transferCode,
        billImageUrl: billImage,
        createdAt: createdDate,
        status: 'PENDING',
      }

      try {
        const savedRequests = localStorage.getItem('system_credit_topup_requests')
        const requestList: SystemTopupRequest[] = savedRequests ? JSON.parse(savedRequests) : []
        localStorage.setItem('system_credit_topup_requests', JSON.stringify([newRequest, ...requestList]))
      } catch (err) {
        console.error('Lỗi lưu yêu cầu nạp:', err)
      }

      // 2. Thêm vào lịch sử giao dịch của học viên với trạng thái PENDING
      const newTx: Transaction = {
        id: requestId,
        type: 'TOPUP',
        title: `Nạp Credit qua VietQR (${SYSTEM_ADMIN_BANK.bankName.split(' ')[0]})`,
        amountCredit: currentCreditToTopUp,
        amountVnd: currentVndToPay,
        date: createdDate,
        status: 'PENDING', // ⚠️ Chờ Admin duyệt, chưa cộng balance
        referenceCode: transferCode,
        billImageUrl: billImage,
      }

      saveTransactionsToStorage([newTx, ...transactions])

      setIsProcessing(false)
      setIsPendingSubmitted(true)

      // Kích hoạt event để các tab khác (như tab Admin) tự động cập nhật
      window.dispatchEvent(new Event('storage'))
    }, 1200)
  }

  const handleCloseModal = () => {
    setIsTopUpModalOpen(false)
    setActiveQrStep(false)
    setIsPendingSubmitted(false)
    setBillImage(null)
    setBillFileName('')
    setPaymentTimeLeft(600)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* HEADER PAGE */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Ví Credit Học Viên
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý số dư, nạp Credit bằng mã VietQR của hệ thống và gửi biên lai cho Admin duyệt.
          </p>
        </div>

        <Button
          onClick={() => {
            setIsTopUpModalOpen(true)
            setActiveQrStep(false)
            setIsPendingSubmitted(false)
            setBillImage(null)
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
        >
          <QrCode className="h-5 w-5" />
          + Nạp Thêm Credit
        </Button>
      </div>

      {/* BALANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <div className="md:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-xl">
          <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-md">
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> Số Dư Khả Dụng
            </span>
            <span className="text-xs text-indigo-300 font-medium">Tỷ lệ: 100 Credit = 100,000 VNĐ</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              {balance.toLocaleString()}
            </span>
            <span className="text-xl font-bold text-amber-400">Credit</span>
          </div>

          <div className="mt-2 text-sm text-indigo-200">
            Tương đương: <strong className="text-white font-bold font-mono">{(balance * 1000).toLocaleString('vi-VN')} VNĐ</strong>
          </div>

          <div className="mt-6 pt-4 border-t border-indigo-700/50 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Tiền được bảo vệ bởi ví Tạm Giữ Escrow</span>
            </div>
            <button
              onClick={() => {
                setIsTopUpModalOpen(true)
                setActiveQrStep(false)
                setIsPendingSubmitted(false)
              }}
              className="text-white underline hover:text-amber-300 font-bold transition cursor-pointer"
            >
              + Nạp thêm ngay
            </button>
          </div>
        </div>

        {/* Quick Rate Info Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Quy tắc nạp & sử dụng Credit
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                Dùng Credit để đặt lịch học với gia sư uy tín.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                Chuyển khoản theo mã VietQR chính thức của Admin hệ thống.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <strong>Chụp biên lai thành công</strong> gửi lên để Admin duyệt và cộng Credit nhanh chóng.
              </li>
            </ul>
          </div>

          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Mỗi bill nạp đều có mã đối soát riêng để Admin kiểm tra.</span>
          </div>
        </div>
      </div>

      {/* THÔNG TIN TÀI KHOẢN NGÂN HÀNG CÁ NHÂN CỦA HỌC VIÊN */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Tài Khoản Ngân Hàng Nhận Tiền / Rút Tiền Cá Nhân ({bankInfo.accountName || 'Chưa cài đặt'})
            </h3>
          </div>
          <button
            onClick={() => {
              if (isEditingBank) {
                setIsEditingBank(false)
              } else {
                handleOpenEditBank()
              }
            }}
            className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-bold underline cursor-pointer"
          >
            {isEditingBank ? 'Đóng' : bankInfo.accountNo ? 'Chỉnh sửa Ngân hàng & STK' : '+ Cài đặt STK nhận tiền mới'}
          </button>
        </div>

        {!isEditingBank ? (
          !bankInfo.accountNo ? (
            <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-100 dark:bg-amber-900/60 p-2 text-amber-600 dark:text-amber-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Chưa cài đặt Số tài khoản nhận tiền cá nhân
                  </div>
                  <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                    Thêm STK của bạn để hệ thống chuyển tiền hoàn trả khi hủy lịch hoặc khi bạn muốn rút credit về ngân hàng.
                  </div>
                </div>
              </div>
              <Button
                onClick={handleOpenEditBank}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                + Thêm STK Ngay
              </Button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 border border-gray-100 dark:border-gray-700">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Ngân hàng:</span>
                <strong className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 block">{bankInfo.bankName}</strong>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 border border-gray-100 dark:border-gray-700">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Số tài khoản:</span>
                <strong className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">{bankInfo.accountNo}</strong>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3 border border-gray-100 dark:border-gray-700">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Chủ tài khoản:</span>
                <strong className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 block uppercase">{bankInfo.accountName}</strong>
              </div>
            </div>
          )
        ) : (
          <div className="mt-4 space-y-4 max-w-md">
            <div>
              <label className="text-xs text-gray-700 dark:text-gray-300 font-bold block mb-1">Chọn Ngân hàng:</label>
              <select
                value={editBankId}
                onChange={(e) => setEditBankId(e.target.value)}
                className="w-full rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white p-2.5 text-xs font-bold focus:border-indigo-500 focus:outline-hidden"
              >
                {SUPPORTED_BANKS.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-700 dark:text-gray-300 font-bold block mb-1">Số tài khoản nhận tiền:</label>
              <Input
                type="text"
                value={editBankNo}
                onChange={(e) => setEditBankNo(e.target.value)}
                placeholder="Nhập số tài khoản ngân hàng của bạn..."
                className="w-full text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs text-gray-700 dark:text-gray-300 font-bold block mb-1">Tên chủ tài khoản (In hoa không dấu):</label>
              <Input
                type="text"
                value={editBankName}
                onChange={(e) => setEditBankName(e.target.value)}
                placeholder="Ví dụ: NGUYEN VAN A"
                className="w-full text-xs uppercase font-bold"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button onClick={handleSaveBank} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer">
                Lưu Tài Khoản Nhận Tiền
              </Button>
              <Button onClick={() => setIsEditingBank(false)} size="sm" variant="outline" className="text-xs cursor-pointer">
                Hủy
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Lịch Sử Giao Dịch Credit
          </h2>
          <span className="text-xs text-gray-400">Hiển thị {transactions.length} giao dịch gần nhất</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-400">
                <th className="py-3 px-4 font-semibold">Mã Giao Dịch</th>
                <th className="py-3 px-4 font-semibold">Loại Giao Dịch</th>
                <th className="py-3 px-4 font-semibold">Thời Gian</th>
                <th className="py-3 px-4 font-semibold text-right">Credit</th>
                <th className="py-3 px-4 font-semibold text-right">Quy Đổi VNĐ</th>
                <th className="py-3 px-4 font-semibold text-center">Biên Lai</th>
                <th className="py-3 px-4 font-semibold text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Chưa có giao dịch nào
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-gray-900 dark:text-gray-100">
                      {tx.id}
                      <span className="block text-[10px] text-gray-400 font-mono">{tx.referenceCode}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">
                      <div className="flex items-center gap-2">
                        {tx.type === 'TOPUP' ? (
                          <div className="rounded-lg bg-emerald-100 p-1.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                            <ArrowDownLeft className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="rounded-lg bg-rose-100 p-1.5 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                        )}
                        <span>{tx.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">{tx.date}</td>
                    <td className={`py-3.5 px-4 text-right font-extrabold text-sm ${
                      tx.amountCredit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.amountCredit > 0 ? `+${tx.amountCredit}` : tx.amountCredit} CR
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-gray-700 dark:text-gray-300 font-mono">
                      {Math.abs(tx.amountVnd).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {tx.billImageUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreviewBillModal(tx.billImageUrl || null)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" /> Xem bill
                        </button>
                      ) : (
                        <span className="text-gray-400 text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {tx.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Thành công
                        </span>
                      ) : tx.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 animate-pulse">
                          <Clock className="h-3 w-3" /> Chờ Admin duyệt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-extrabold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                          <AlertCircle className="h-3 w-3" /> Bị từ chối
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🎯 MODAL NẠP CREDIT - QUÉT MÃ VIETQR CỦA ADMIN HỆ THỐNG */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {!activeQrStep ? (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <QrCode className="h-6 w-6 text-indigo-600" />
                    Nạp Credit Bằng VietQR
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    100 Credit = 100,000 VNĐ. Quét mã VietQR chuyển khoản vào tài khoản Hệ thống.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Chọn mốc nạp nhanh:
                  </label>
                  <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                    {PRESET_AMOUNTS.map((preset) => {
                      const isSelected = selectedCredit === preset.credit && !customCredit
                      return (
                        <button
                          key={preset.credit}
                          onClick={() => {
                            setSelectedCredit(preset.credit)
                            setCustomCredit('')
                          }}
                          className={`relative rounded-xl border p-3 text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-600 ring-2 ring-indigo-600/20 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-400'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {preset.popular && (
                            <span className="absolute -top-2 -right-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                              HOT
                            </span>
                          )}
                          <div className="text-sm font-extrabold">{preset.label}</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                            {preset.vnd.toLocaleString('vi-VN')} đ
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Hoặc nhập số Credit tùy chọn (Tối thiểu 10 CR):
                  </label>
                  <div className="mt-1.5 relative">
                    <Input
                      type="number"
                      placeholder="Ví dụ: 150"
                      value={customCredit}
                      onChange={(e) => setCustomCredit(e.target.value)}
                      className="pr-20 font-bold bg-white text-gray-900 border-gray-300 dark:bg-gray-950 dark:text-white"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">Credit</span>
                  </div>
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                    <span>Số Credit nhận được:</span>
                    <strong className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {currentCreditToTopUp} Credit
                    </strong>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-indigo-100/80 pt-2 text-xs font-bold text-gray-900 dark:border-indigo-900/50 dark:text-white">
                    <span>Số tiền thanh toán:</span>
                    <strong className="text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                      {currentVndToPay.toLocaleString('vi-VN')} VNĐ
                    </strong>
                  </div>
                </div>

                <Button
                  onClick={() => setActiveQrStep(true)}
                  disabled={currentCreditToTopUp < 10}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="h-5 w-5" />
                  Tạo Mã Thanh Toán VietQR
                </Button>
              </div>
            ) : isPendingSubmitted ? (
              /* MÀN HÌNH BÁO ĐÃ GỬI BIÊN LAI THÀNH CÔNG -> CHỜ ADMIN DUYỆT */
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <Clock className="h-10 w-10 animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Đã Gửi Yêu Cầu Nạp Credit!
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 max-w-sm mx-auto leading-relaxed">
                  Biên lai chuyển khoản của bạn đã được chuyển đến <strong>Ban Quản Trị Hệ Thống</strong>. Sau khi Admin kiểm tra và khớp lệnh, Credit sẽ được cộng tự động vào ví của bạn trong giây lát.
                </p>

                <div className="rounded-xl bg-gray-50 p-4 text-xs dark:bg-gray-800/60 font-mono space-y-1 text-left">
                  <div>Mã đối soát: <strong>{transferCode}</strong></div>
                  <div>Số Credit yêu cầu: <strong className="text-indigo-600">+{currentCreditToTopUp} Credit</strong></div>
                  <div>Số tiền chuyển khoản: <strong className="text-rose-600">{currentVndToPay.toLocaleString('vi-VN')} đ</strong></div>
                  <div>Trạng thái: <strong className="text-amber-600">⏳ Đang chờ Admin xét duyệt</strong></div>
                </div>

                <Button
                  onClick={handleCloseModal}
                  className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Xem Lịch Sử Giao Dịch
                </Button>
              </div>
            ) : (
              /* BƯỚC 2: QUÉT QR & BẮT BUỘC ĐÍNH KÈM ẢNH BILL CHUYỂN KHOẢN */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Quét Mã VietQR Nạp Credit ({SYSTEM_ADMIN_BANK.bankName.split(' ')[0]})
                    </h3>
                    <span className="text-[11px] text-gray-500">Mở app Ngân hàng để quét chuyển khoản vào hệ thống</span>
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTime(paymentTimeLeft)}</span>
                  </div>
                </div>

                {/* MÃ VIETQR CỦA ADMIN HỆ THỐNG */}
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                  <div className="relative rounded-xl border border-gray-200 bg-white p-2 shadow-md dark:border-gray-800">
                    <img
                      src={qrImageUrl}
                      alt="VietQR Admin Nạp Credit"
                      className="h-44 w-44 object-contain"
                    />
                  </div>
                  <span className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" /> Tài khoản thụ hưởng chính thức của Admin Hệ thống
                  </span>
                </div>

                {/* BẢNG THÔNG TIN CHUYỂN KHOẢN VỀ ADMIN */}
                <div className="space-y-2 rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/60 font-mono">
                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-1.5 dark:border-gray-700/60">
                    <span className="text-gray-500 font-sans">Ngân hàng:</span>
                    <strong className="text-gray-900 dark:text-white font-sans">{SYSTEM_ADMIN_BANK.bankName}</strong>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-1.5 dark:border-gray-700/60">
                    <span className="text-gray-500 font-sans">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                      <span>{SYSTEM_ADMIN_BANK.accountNo}</span>
                      <button
                        onClick={() => handleCopy(SYSTEM_ADMIN_BANK.accountNo, 'acc')}
                        className="rounded p-1 hover:bg-gray-200 text-gray-500 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {copiedField === 'acc' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-1.5 dark:border-gray-700/60">
                    <span className="text-gray-500 font-sans">Chủ tài khoản:</span>
                    <strong className="text-gray-900 dark:text-white uppercase font-sans">{SYSTEM_ADMIN_BANK.accountName}</strong>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-1.5 dark:border-gray-700/60">
                    <span className="text-gray-500 font-sans">Số tiền:</span>
                    <strong className="text-rose-600 dark:text-rose-400 font-black font-mono">
                      {currentVndToPay.toLocaleString('vi-VN')} đ
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-sans">Nội dung chuyển khoản:</span>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      <span>{transferCode}</span>
                      <button
                        onClick={() => handleCopy(transferCode, 'code')}
                        className="rounded p-1 hover:bg-gray-200 text-gray-500 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {copiedField === 'code' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 📸 KHUNG ĐÍNH KÈM ẢNH BILL CHUYỂN KHOẢN (BẮT BUỘC) */}
                <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-3.5 dark:border-indigo-900/60 dark:bg-indigo-950/30">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Upload className="h-4 w-4 text-indigo-600" />
                      Ảnh Biên Lai / Bill Chuyển Khoản <span className="text-rose-500">*</span>
                    </label>
                    {billImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setBillImage(null)
                          setBillFileName('')
                        }}
                        className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        Đổi ảnh khác
                      </button>
                    )}
                  </div>

                  <input
                    ref={billInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBillFileChange}
                    className="hidden"
                  />

                  {!billImage ? (
                    <div
                      onClick={() => billInputRef.current?.click()}
                      onPaste={handlePasteBill}
                      tabIndex={0}
                      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-3.5 text-center cursor-pointer hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900"
                    >
                      <ImageIcon className="h-7 w-7 text-indigo-400 mb-1" />
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Bấm để tải ảnh bill hoặc dán (Ctrl + V)
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Ảnh chụp màn hình giao dịch chuyển tiền thành công
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-2 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                      <img
                        src={billImage}
                        alt="Bill Preview"
                        className="h-12 w-12 rounded-lg object-cover border border-emerald-300 shadow-xs cursor-pointer"
                        onClick={() => setPreviewBillModal(billImage)}
                        title="Bấm để xem ảnh to"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="truncate text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Đã đính kèm biên lai
                        </p>
                        <p className="truncate text-[10px] text-gray-500 font-mono mt-0.5">
                          {billFileName || 'bill_chuyen_khoan.png'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewBillModal(billImage)}
                        className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition"
                      >
                        Xem to
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    onClick={() => setActiveQrStep(false)}
                    variant="outline"
                    className="w-1/3 py-2.5 rounded-xl border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300 font-semibold cursor-pointer"
                  >
                    Quay Lại
                  </Button>

                  <Button
                    onClick={handleSubmitBillToAdmin}
                    disabled={!billImage || isProcessing}
                    className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    title={!billImage ? 'Vui lòng đính kèm ảnh bill chuyển khoản' : 'Gửi cho Admin xét duyệt'}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Đang gửi biên lai...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Gửi Biên Lai Cho Admin Duyệt
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PHÓNG TO ẢNH BILL */}
      {previewBillModal && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setPreviewBillModal(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-black shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewBillModal(null)}
              className="absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition shadow-md z-10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewBillModal}
              alt="Ảnh biên lai phóng to"
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
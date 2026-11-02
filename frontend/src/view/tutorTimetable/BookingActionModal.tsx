import { useState, useEffect, useRef } from 'react'
import type { BookingResponse } from '@/apis/fe2/booking.types'
import { bookingApi } from '@/apis/fe2/booking.api'
import {
  Star,
  QrCode,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Building2,
  Send,
  CreditCard,
  Camera,
  Upload,
} from 'lucide-react'

// KHAI BÁO TYPE ĐỘC LẬP
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

const POPULAR_BANKS = [
  { id: 'MB', name: 'MBBank (NH Quân Đội)' },
  { id: 'VCB', name: 'Vietcombank (Ngoại Thương)' },
  { id: 'TCB', name: 'Techcombank (Kỹ Thương)' },
  { id: 'ICB', name: 'VietinBank (Công Thương)' },
  { id: 'BIDV', name: 'BIDV (Đầu Tư & Phát Triển)' },
  { id: 'ACB', name: 'ACB (Á Châu)' },
  { id: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)' },
  { id: 'TPB', name: 'TPBank (Tiên Phong)' },
  { id: 'VBA', name: 'Agribank (Nông Nghiệp)' },
  { id: 'STB', name: 'Sacombank' },
  { id: 'MSB', name: 'MSB (Hàng Hải)' },
  { id: 'OCB', name: 'OCB (Phương Đông)' },
  { id: 'HDB', name: 'HDBank' },
]

interface Props {
  isOpen: boolean
  booking: BookingResponse | null
  onClose: () => void
  onUpdated: (updated: BookingResponse) => void
}

const STATUS_COLOR: Record<string, string> = {
  Pending:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Rejected:  'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400',
  Cancelled: 'bg-slate-100 text-slate-500 dark:bg-slate-800    dark:text-slate-400',
  Completed: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400',
}

function fmtUtc(iso: string) {
  if (!iso) return ''
  const utcStr = iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`
  return new Date(utcStr).toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
}

function formatBookingCode(id: number, isoDateStr: string): string {
  const utcStr = isoDateStr.endsWith('Z') || isoDateStr.includes('+') ? isoDateStr : `${isoDateStr}Z`
  const d = new Date(utcStr)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const formattedId = String(id).padStart(3, '0')
  return `BK-${yyyy}${mm}${dd}-${formattedId}`
}

function getSlotGroupKey(tutorSubjectId: number, startTimeUtc: string): string {
  const dateKey = startTimeUtc ? startTimeUtc.slice(0, 16) : 'default_slot'
  return `slot_group_meet_${tutorSubjectId}_${dateKey}`
}

export function BookingActionModal({ isOpen, booking, onClose, onUpdated }: Props) {
  const [meetingUrl, setMeetingUrl] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [tutorComment, setTutorComment] = useState('')
  const [goalProgress, setGoalProgress] = useState(100)
  const [studentRating, setStudentRating] = useState(5)
  const [hoverStudentRating, setHoverStudentRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subjectDisplay, setSubjectDisplay] = useState<string>('')
  const [studentDisplay, setStudentDisplay] = useState<string>('')

  // 🎯 QUẢN LÝ YÊU CẦU NHẬN 90% THÙ LAO TỪ ADMIN CHO CA HỌC NÀY
  const [payoutRequest, setPayoutRequest] = useState<TutorSessionPayoutRequest | null>(null)
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)
  const [previewProofModal, setPreviewProofModal] = useState<string | null>(null)

  // 📸 STATE CHỨA ẢNH CHỤP MÀN HÌNH CA HỌC (MINH CHỨNG THỰC TẾ)
  const [sessionProofImage, setSessionProofImage] = useState<string | null>(null)
  const sessionProofInputRef = useRef<HTMLInputElement | null>(null)

  // Thông tin ngân hàng của Gia sư
  const [tutorBank, setTutorBank] = useState(() => {
    const saved = localStorage.getItem('tutor_saved_bank_payout_info')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {}
    }
    return {
      bankId: 'MB',
      bankName: 'MBBank (NH Quân Đội)',
      accountNo: '',
      accountName: '',
    }
  })

  const syncPayoutForThisBooking = () => {
    if (!booking) return
    const saved = localStorage.getItem('tutor_session_payout_requests')
    if (saved) {
      try {
        const list: TutorSessionPayoutRequest[] = JSON.parse(saved)
        const found = list.find((p) => p.bookingId === booking.id)
        setPayoutRequest(found || null)
        if (found?.sessionProofImageUrl) {
          setSessionProofImage(found.sessionProofImageUrl)
        }
      } catch (e) {
        console.error(e)
      }
    } else {
      setPayoutRequest(null)
    }
  }

  useEffect(() => {
    if (isOpen && booking) {
      setRejectReason('')
      setTutorComment('')
      setGoalProgress(100)
      setStudentRating(5)
      setError(null)
      setLoading(false)

      if (booking.subjectName) setSubjectDisplay(booking.subjectName)

      const initialStudentName =
        (booking as any).studentName ||
        (booking as any).student?.fullName ||
        (booking as any).student?.user?.fullName ||
        (booking as any).studentUser?.fullName ||
        ''

      setStudentDisplay(initialStudentName)

      const slotGroupKey = getSlotGroupKey(booking.tutorSubjectId, booking.startTimeUtc)
      const sharedMeetLink = localStorage.getItem(slotGroupKey)

      if (sharedMeetLink) {
        setMeetingUrl(sharedMeetLink)
      } else {
        setMeetingUrl(booking.meetingUrl || '')
      }
      const docKey = `slot_doc_${booking.id}`
      const savedDoc = localStorage.getItem(docKey) || ''
      setDocumentUrl(savedDoc)

      syncPayoutForThisBooking()

      bookingApi.getBookingById(booking.id)
        .then((res: any) => {
          if (res.subjectName) setSubjectDisplay(res.subjectName)

          const fetchedStudentName =
            res.studentName ||
            res.student?.fullName ||
            res.student?.user?.fullName ||
            res.studentUser?.fullName ||
            initialStudentName

          if (fetchedStudentName) {
            setStudentDisplay(fetchedStudentName)
          }

          if (!sharedMeetLink && res.meetingUrl) {
            setMeetingUrl(res.meetingUrl)
          }
        })
        .catch(() => {})
    }
  }, [isOpen, booking])

  useEffect(() => {
    window.addEventListener('storage', syncPayoutForThisBooking)
    return () => window.removeEventListener('storage', syncPayoutForThisBooking)
  }, [booking])

  if (!isOpen || !booking) return null

  const isCompleted = booking.status === 'Completed' || (booking.status as any) === 5
  const canConfirm  = booking.status === 'Pending' || (booking.status as any) === 1
  const canReject   = booking.status === 'Pending' || (booking.status as any) === 1
  const canComplete = booking.status === 'Confirmed' || (booking.status as any) === 2
  const isConfirmed = booking.status === 'Confirmed' || (booking.status as any) === 2

  const totalCostCredit = booking.creditCost || 80
  const totalCostVnd = totalCostCredit * 1000
  const platformFeeVnd = Math.round(totalCostVnd * 0.1)
  const netPayoutVnd = Math.round(totalCostVnd * 0.9)
  const bookingCode = formatBookingCode(booking.id, booking.startTimeUtc)

  function resetState() {
    setError(null)
    setLoading(false)
  }

  const handleAutoGenerateMeetLink = () => {
    const randomCode = Math.random().toString(36).substring(2, 5) + '-' +
                       Math.random().toString(36).substring(2, 6) + '-' +
                       Math.random().toString(36).substring(2, 5)
    const newLink = `https://meet.google.com/${randomCode}`
    setMeetingUrl(newLink)

    const slotGroupKey = getSlotGroupKey(booking.tutorSubjectId, booking.startTimeUtc)
    localStorage.setItem(slotGroupKey, newLink)
  }

  async function handleConfirm() {
    let linkToUse = meetingUrl.trim()
    const slotGroupKey = getSlotGroupKey(booking!.tutorSubjectId, booking!.startTimeUtc)

    if (!linkToUse) {
      const existingSharedLink = localStorage.getItem(slotGroupKey)
      if (existingSharedLink) {
        linkToUse = existingSharedLink
      } else {
        const randomCode = Math.random().toString(36).substring(2, 5) + '-' +
                           Math.random().toString(36).substring(2, 6) + '-' +
                           Math.random().toString(36).substring(2, 5)
        linkToUse = `https://meet.google.com/${randomCode}`
      }
      setMeetingUrl(linkToUse)
    }

    localStorage.setItem(slotGroupKey, linkToUse)

    setLoading(true)
    setError(null)
    try {
      await bookingApi.confirmBooking(booking!.id, { meetingUrl: linkToUse })
      const updated = await bookingApi.getBookingById(booking!.id)
      onUpdated(updated)
      resetState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xác nhận booking thất bại')
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      setError('Vui lòng nhập lý do từ chối.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await bookingApi.rejectBooking(booking!.id, { reason: rejectReason.trim() })

      const studentUserId =
        (booking as any).studentUserId ||
        (booking as any).student?.userId ||
        (booking as any).studentId ||
        (booking as any).student?.id

      const creditKey = studentUserId ? `tutor_student_credit_${studentUserId}` : 'tutor_student_credit'
      const txKey = studentUserId ? `tutor_student_transactions_${studentUserId}` : 'tutor_student_transactions'

      const refundCost = booking?.creditCost || 80
      const currentStudentCredit = Number(localStorage.getItem(creditKey) || 0)
      localStorage.setItem(creditKey, (currentStudentCredit + refundCost).toString())

      const savedTx = localStorage.getItem(txKey)
      const txs = savedTx ? JSON.parse(savedTx) : []
      const refundTx = {
        id: `RF-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'REFUND',
        title: `[HOÀN TIỀN 100%] Gia sư từ chối ca học (${rejectReason.trim()})`,
        amountCredit: +refundCost,
        amountVnd: +(refundCost * 1000),
        date: new Date().toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'COMPLETED',
        referenceCode: `REFUND-100%`,
      }
      localStorage.setItem(txKey, JSON.stringify([refundTx, ...txs]))

      const updated = await bookingApi.getBookingById(booking!.id)
      onUpdated(updated)
      resetState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Từ chối booking thất bại')
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete() {
    setLoading(true)
    setError(null)
    try {
      const commentText = tutorComment.trim()
      if (!commentText) {
        setError('Vui lòng nhập lời nhận xét cho Học viên.')
        setLoading(false)
        return
      }

      await bookingApi.completeBooking(booking!.id, {
        learningGoalId: 1,
        score: 10,
        maxScore: 10,
        goalProgressPercent: goalProgress,
        tutorComment: commentText,
      })

      localStorage.setItem(`tutor_eval_${booking!.id}`, JSON.stringify({
        rating: studentRating,
        comment: commentText,
        progress: goalProgress,
        createdAt: new Date().toISOString(),
      }))

      const totalCost = booking?.creditCost || 80
      const tutorNetPayout = Math.round(totalCost * 0.9)

      const currentTutorCredit = Number(localStorage.getItem('tutor_income_credit') || 1500)
      localStorage.setItem('tutor_income_credit', (currentTutorCredit + tutorNetPayout).toString())

      const savedTutorTx = localStorage.getItem('tutor_income_transactions')
      const tutorTxs = savedTutorTx ? JSON.parse(savedTutorTx) : []
      const newTutorTx = {
        id: `EARN-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'EARNING',
        title: `Thù lao ca học hoàn thành (Đã trừ 10% phí nền tảng TutorConnect)`,
        amountCredit: +tutorNetPayout,
        amountVnd: +(tutorNetPayout * 1000),
        date: new Date().toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'COMPLETED',
      }
      localStorage.setItem('tutor_income_transactions', JSON.stringify([newTutorTx, ...tutorTxs]))

      const updated = await bookingApi.getBookingById(booking!.id)
      onUpdated(updated)
      resetState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hoàn thành booking thất bại.')
    } finally {
      setLoading(false)
    }
  }

  // 🎯 XỬ LÝ TẢI VÀ PASTE ẢNH CHỤP MÀN HÌNH BUỔI HỌC
  const handleSessionProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (PNG, JPG, JPEG)!')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setSessionProofImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handlePasteSessionProof = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item && item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile()
        if (blob) {
          const reader = new FileReader()
          reader.onload = (event) => {
            setSessionProofImage(event.target?.result as string)
          }
          reader.readAsDataURL(blob)
        }
        break
      }
    }
  }

  // 🎯 GIA SƯ GỬI YÊU CẦU NHẬN 90% KÈM QR & ẢNH CHỤP BUỔI HỌC CHO ADMIN
  const handleSendPayoutRequestToAdmin = () => {
    if (!tutorBank.accountNo.trim()) {
      alert('Vui lòng nhập Số tài khoản ngân hàng của bạn!')
      return
    }
    if (!tutorBank.accountName.trim()) {
      alert('Vui lòng nhập Tên chủ tài khoản ngân hàng!')
      return
    }
    if (!sessionProofImage) {
      alert('⚠️ Bắt buộc: Để chắc chắn buổi học đã diễn ra thực tế, vui lòng đính kèm ảnh chụp màn hình ca học (có Gia sư & Học viên) làm minh chứng cho Admin!')
      return
    }

    localStorage.setItem('tutor_saved_bank_payout_info', JSON.stringify(tutorBank))

    const newRequest: TutorSessionPayoutRequest = {
      id: `PAYOUT-${Date.now()}`,
      bookingId: booking.id,
      bookingCode,
      subjectName: subjectDisplay || booking.subjectName || 'Môn học',
      studentName: studentDisplay || 'Học viên',
      tutorId: booking.tutorSubjectId || 1,
      tutorName: tutorBank.accountName,
      tutorBankId: tutorBank.bankId,
      tutorBankName: tutorBank.bankName,
      tutorAccountNo: tutorBank.accountNo.trim(),
      tutorAccountName: tutorBank.accountName.trim().toUpperCase(),
      totalCostCredit,
      totalCostVnd,
      platformFeeVnd,
      netPayoutVnd,
      requestedAt: new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'PENDING',
      sessionProofImageUrl: sessionProofImage,
    }

    const saved = localStorage.getItem('tutor_session_payout_requests')
    const list: TutorSessionPayoutRequest[] = saved ? JSON.parse(saved) : []
    const updated = [newRequest, ...list.filter((p) => p.bookingId !== booking.id)]
    localStorage.setItem('tutor_session_payout_requests', JSON.stringify(updated))
    window.dispatchEvent(new Event('storage'))

    setPayoutRequest(newRequest)
    setIsPayoutModalOpen(false)
    alert(`✅ Đã gửi yêu cầu nhận 90% thù lao (${netPayoutVnd.toLocaleString('vi-VN')} đ) kèm mã VietQR và ảnh minh chứng ca học tới Admin thành công!`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Booking {bookingCode}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLOR[booking.status] ?? 'bg-slate-100'}`}>
                {(booking.status === 'Pending' || (booking.status as any) === 1) && '⏳ Pending'}
                {(booking.status === 'Confirmed' || (booking.status as any) === 2) && '✅ Confirmed'}
                {(booking.status === 'Completed' || (booking.status as any) === 5) && '🎉 Completed'}
                {(booking.status === 'Rejected' || (booking.status as any) === 3) && '❌ Rejected'}
                {(booking.status === 'Cancelled' || (booking.status as any) === 4) && '🚫 Cancelled'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {fmtUtc(booking.startTimeUtc)} → {fmtUtc(booking.endTimeUtc)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm">
          <InfoRow label="Credit Cost" value={`${booking.creditCost} credits`} />
          <InfoRow
            label="Học Viên"
            value={
              studentDisplay ||
              (booking as any).studentName ||
              (booking as any).student?.fullName ||
              `Học viên #${booking.studentId}`
            }
          />
          <InfoRow label="Subject Name" value={subjectDisplay || booking.subjectName || `Môn #${booking.tutorSubjectId}`} />
          
          {booking.studentNote && (
            <div className="col-span-3">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">Student Note</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{booking.studentNote}"</p>
            </div>
          )}
        </div>

        {/* =========================================================================
            🎓 KHỐI TÀI CHÍNH & YÊU CẦU ADMIN CHUYỂN KHOẢN 90% THÙ LAO (KHI COMPLETED)
        ========================================================================= */}
        {isCompleted && (
          <div className="space-y-3 p-4 rounded-2xl border border-blue-200 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-950/30">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-blue-600" />
                <span>Thanh Toán Thù Lao Buổi Học (Admin CK 90%):</span>
              </h4>
              <span className="text-[10px] font-extrabold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">
                Hoa hồng sàn 10%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50 text-center">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Học Phí Buổi Học</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                  {totalCostVnd.toLocaleString('vi-VN')} đ
                </p>
              </div>
              <div>
                <p className="text-[9px] text-amber-500 font-bold uppercase">Phí Sàn Giữ (10%)</p>
                <p className="text-xs font-bold text-amber-600 font-mono mt-0.5">
                  -{platformFeeVnd.toLocaleString('vi-VN')} đ
                </p>
              </div>
              <div>
                <p className="text-[9px] text-emerald-600 font-bold uppercase">Gia Sư Nhận (90%)</p>
                <p className="text-xs font-black text-emerald-600 font-mono mt-0.5">
                  {netPayoutVnd.toLocaleString('vi-VN')} đ
                </p>
              </div>
            </div>

            {/* Trạng thái yêu cầu nhận tiền */}
            {payoutRequest?.status === 'COMPLETED' ? (
              <div className="space-y-2 rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Admin Đã Chuyển Khoản 90% Thù Lao!</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{payoutRequest.paidAt}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Số tiền <strong>{netPayoutVnd.toLocaleString('vi-VN')} VNĐ</strong> đã được Admin chuyển vào tài khoản ngân hàng của bạn.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  {payoutRequest.adminProofImageUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewProofModal(payoutRequest.adminProofImageUrl || null)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700 transition shadow-sm cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Xem Bill Admin</span>
                    </button>
                  )}
                  {payoutRequest.sessionProofImageUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewProofModal(payoutRequest.sessionProofImageUrl || null)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 transition shadow-sm cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Ảnh Ca Học Đã Nộp</span>
                    </button>
                  )}
                </div>
              </div>
            ) : payoutRequest?.status === 'PENDING' ? (
              <div className="rounded-xl bg-amber-500/10 p-3 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang chờ Admin quét mã QR & chuyển khoản...</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Đã gửi yêu cầu kèm minh chứng ca học lúc {payoutRequest.requestedAt}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Xem QR & Minh Chứng
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition shadow-md cursor-pointer"
              >
                <QrCode className="h-4 w-4" />
                <span>Yêu Cầu Admin Quét QR Chuyển Khoản 90% Thù Lao ({netPayoutVnd.toLocaleString('vi-VN')} đ)</span>
              </button>
            )}
          </div>
        )}

        {/* Ô KHUNG NHẬP HOẶC TỰ TẠO LINK GOOGLE MEET */}
        {(canConfirm || isConfirmed) && (
          <div className="space-y-1.5 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                🎥 Link phòng học Google Meet (Dùng CHUNG cho các HV cùng ca này):
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateMeetLink}
                className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                ✨ Tự động tạo link Meet chung
              </button>
            </div>
            <input
              type="text"
              value={meetingUrl}
              onChange={(e) => {
                const val = e.target.value
                setMeetingUrl(val)
                const slotGroupKey = getSlotGroupKey(booking.tutorSubjectId, booking.startTimeUtc)
                if (val.trim()) {
                  localStorage.setItem(slotGroupKey, val.trim())
                }
              }}
              placeholder="Dán link Meet cá nhân (https://meet.google.com/xxx-yyy-zzz) hoặc bấm Tạo tự động..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
        )}

        {/* 📂 KHUNG NHẬP LINK TÀI LIỆU BÀI HỌC */}
        {(canConfirm || isConfirmed) && (
          <div className="space-y-1.5 p-3.5 bg-sky-50/70 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-800/60">
            <label className="text-xs font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
              <span>📂</span> Link tài liệu học tập / File đề thi đọc trước (Google Drive, PDF, Notion...):
            </label>
            <input
              type="text"
              value={documentUrl}
              onChange={(e) => {
                const val = e.target.value
                setDocumentUrl(val)
                localStorage.setItem(`slot_doc_${booking.id}`, val.trim())
              }}
              placeholder="Dán link Google Drive, file PDF bài giảng cho Học viên xem..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
        )}

        {/* KHUNG GIA SƯ ĐÁNH GIÁ & CHẤM SAO HỌC VIÊN KHI HOÀN THÀNH CA HỌC */}
        {canComplete && (
          <div className="space-y-3 p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800/60">
            <h4 className="text-xs font-extrabold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              🎓 Đánh giá & Chấm sao Học viên (Bắt buộc):
            </h4>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Chấm điểm Học viên:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStudentRating(star)}
                    onMouseEnter={() => setHoverStudentRating(star)}
                    onMouseLeave={() => setHoverStudentRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= (hoverStudentRating || studentRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 ml-1">
                ({studentRating}/5 ⭐)
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Tiến độ bài học đạt được:</span>
                <span className="text-indigo-600 dark:text-indigo-400">{goalProgress}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={goalProgress}
                onChange={(e) => setGoalProgress(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Lời nhận xét / Đánh giá chi tiết (bắt buộc):
              </label>
              <textarea
                rows={2}
                value={tutorComment}
                onChange={(e) => setTutorComment(e.target.value)}
                placeholder="Nhập nhận xét của Gia sư về thái độ, bài tập, sự chuẩn bị của Học viên..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 dark:text-white resize-none"
              />
            </div>
          </div>
        )}

        {/* Ô NHẬP LÝ DO TỪ CHỐI */}
        {canReject && (
          <div className="space-y-1.5 p-3.5 bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800/60">
            <label className="block text-xs font-bold text-rose-800 dark:text-rose-300">
              ⚠️ Lý do từ chối nhận lớp (bắt buộc):
            </label>
            <textarea
              rows={2}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do gia sư muốn từ chối ca học này..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-900 dark:text-white resize-none"
            />
          </div>
        )}

        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-2">
          {canConfirm && (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Đang xác nhận...' : 'Xác nhận nhận lớp'}
            </button>
          )}

          {canComplete && (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Đang hoàn thành...' : 'Xác nhận hoàn thành & Đánh giá'}
            </button>
          )}

          {canReject && (
            <button
              onClick={handleReject}
              disabled={loading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
            >
              Từ chối nhận lớp
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>

      {/* =========================================================================
          🎯 POPUP GIA SƯ NHẬP TÀI KHOẢN, CHÈN ẢNH CHỤP CA HỌC & GỬI QR CHO ADMIN
      ========================================================================= */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 max-h-[94vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Gửi Mã QR Nhận 90% Thù Lao
                  </h4>
                  <p className="text-[11px] text-slate-500">Mã ca học: {bookingCode}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 1. KHUNG NHẬP TÀI KHOẢN NGÂN HÀNG CỦA GIA SƯ */}
            <div className="space-y-3 bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-200">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>Nhập Tài Khoản Thụ Hưởng (Của Bạn):</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  1. Ngân Hàng Thụ Hưởng:
                </label>
                <select
                  value={tutorBank.bankId}
                  onChange={(e) => {
                    const selected = POPULAR_BANKS.find((b) => b.id === e.target.value)
                    setTutorBank({
                      ...tutorBank,
                      bankId: e.target.value,
                      bankName: selected?.name || e.target.value,
                    })
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {POPULAR_BANKS.map((b) => (
                    <option key={b.id} value={b.id} className="text-slate-900 dark:text-white">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  2. Số Tài Khoản Ngân Hàng (STK):
                </label>
                <input
                  type="text"
                  value={tutorBank.accountNo}
                  onChange={(e) => setTutorBank({ ...tutorBank, accountNo: e.target.value })}
                  placeholder="Nhập số tài khoản ngân hàng của bạn..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-black text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  3. Tên Chủ Tài Khoản (In hoa không dấu):
                </label>
                <input
                  type="text"
                  value={tutorBank.accountName}
                  onChange={(e) => setTutorBank({ ...tutorBank, accountName: e.target.value.toUpperCase() })}
                  placeholder="VÍ DỤ: NGUYEN VAN A"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 placeholder:font-normal placeholder:normal-case"
                />
              </div>
            </div>

            {/* 2. 📸 KHU VỰC CHÈN ẢNH CHỤP MÀN HÌNH BUỔI HỌC (MINH CHỨNG THỰC TẾ) */}
            <div className="space-y-2 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-indigo-600" />
                  <span>Ảnh chụp màn hình buổi học (Minh chứng):</span>
                </label>
                <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-wider">* Bắt buộc</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Để chắc chắn buổi học đã diễn ra, vui lòng chèn ảnh chụp màn hình phòng Google Meet (có mặt Gia sư & Học viên) để Admin đối soát trước khi duyệt chuyển 90% thù lao.
              </p>

              <input
                ref={sessionProofInputRef}
                type="file"
                accept="image/*"
                onChange={handleSessionProofUpload}
                className="hidden"
              />

              {sessionProofImage ? (
                <div className="relative rounded-xl overflow-hidden border border-emerald-400 bg-white dark:bg-slate-900 p-2 flex items-center gap-3">
                  <img
                    src={sessionProofImage}
                    alt="Session Proof"
                    onClick={() => setPreviewProofModal(sessionProofImage)}
                    className="h-20 w-28 object-cover rounded-lg border border-slate-200 cursor-pointer hover:scale-105 transition"
                    title="Bấm để xem ảnh phóng to"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Đã chèn ảnh minh chứng
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">Bấm vào ảnh để xem lại.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSessionProofImage(null)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Đổi ảnh
                  </button>
                </div>
              ) : (
                <div
                  onPaste={handlePasteSessionProof}
                  tabIndex={0}
                  onClick={() => sessionProofInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-center space-y-1.5 cursor-pointer hover:bg-indigo-50/50 transition focus:ring-2 focus:ring-indigo-500"
                >
                  <div className="h-9 w-9 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center">
                    <Upload className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Bấm vào đây để tải ảnh chụp ca học lên
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      (Hoặc bấm vào ô này và nhấn <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-slate-700 font-bold border">Ctrl + V</kbd> để dán ảnh)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 3. MÃ VIETQR ĐỘNG ĐÚNG 90% TIỀN */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              {tutorBank.accountNo.trim() ? (
                <img
                  src={`https://img.vietqr.io/image/${tutorBank.bankId}-${tutorBank.accountNo.trim()}-compact2.png?amount=${netPayoutVnd}&addInfo=${encodeURIComponent(
                    bookingCode,
                  )}&accountName=${encodeURIComponent(tutorBank.accountName.trim() || 'GIA SU')}`}
                  alt="VietQR 90%"
                  className="h-44 w-44 object-contain rounded-xl border border-slate-100 p-1.5 shadow-xs"
                />
              ) : (
                <div className="h-44 w-44 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center p-3 text-slate-400">
                  <CreditCard className="h-8 w-8 mb-1 text-slate-400" />
                  <span className="text-[11px]">Vui lòng nhập Số tài khoản để tạo mã VietQR</span>
                </div>
              )}
              
              <div className="mt-2.5 text-center">
                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  Thù lao thực nhận: {netPayoutVnd.toLocaleString('vi-VN')} VNĐ
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Đã tự động trừ 10% phí nền tảng ({platformFeeVnd.toLocaleString('vi-VN')} đ)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="w-1/3 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleSendPayoutRequestToAdmin}
                className="w-2/3 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-black text-white transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Gửi Yêu Cầu & Mã QR Cho Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP XEM ẢNH PHÓNG TO */}
      {previewProofModal && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
          onClick={() => setPreviewProofModal(null)}
        >
          <div
            className="relative max-h-[92vh] max-w-[92vw] overflow-hidden rounded-2xl bg-black shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewProofModal(null)}
              className="absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition shadow-md z-10 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewProofModal}
              alt="Ảnh phóng to"
              className="max-h-[88vh] max-w-[88vw] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="font-extrabold text-slate-900 dark:text-white truncate">{value}</p>
    </div>
  )
}
import React, { useState, useMemo } from 'react'
import {
  Loader2,
  Send,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { RescheduleRequestStatus } from '@/constants/enums'

export interface RescheduleProposal {
  id: number | string
  proposedStartTimeUtc: string
  proposedEndTimeUtc: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected' | number
  createdAt?: string
}

interface RescheduleData {
  proposedStartTimeUtc: string
  proposedEndTimeUtc: string
  reason: string
}

interface RescheduleTabProps {
  bookingId: number | string
  pendingProposal?: RescheduleProposal | null
  rescheduleData: RescheduleData
  setRescheduleData: React.Dispatch<React.SetStateAction<RescheduleData>>
  submittingSchedule: boolean
  onSubmitCreateProposal: (e: React.FormEvent) => void
  onUpdateProposalStatus?: (
    proposalId: number | string,
    status: number,
    responseNote: string,
  ) => Promise<void>
}

export default function RescheduleTab({
  pendingProposal,
  rescheduleData,
  setRescheduleData,
  submittingSchedule,
  onSubmitCreateProposal,
  onUpdateProposalStatus,
}: RescheduleTabProps) {
  const [responseNote, setResponseNote] = useState('')
  const [processingStatus, setProcessingStatus] = useState<number | null>(null)

  // State quản lý Ngày, Giờ bắt đầu và Giờ kết thúc tách biệt
  const [selectedDate, setSelectedDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  // Ngày tối thiểu có thể chọn (Hôm nay)
  const minDateStr = useMemo(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }, [])

  // Helper format hiển thị ngày giờ
  const formatDateTime = (isoString: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return isNaN(date.getTime())
      ? isoString
      : date.toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
  }

  // Cập nhật giá trị vào state cha (rescheduleData) mỗi khi chọn Ngày / Giờ
  const updateParentState = (date: string, start: string, end: string) => {
    if (date && start) {
      const startIso = new Date(`${date}T${start}`).toISOString()
      const endIso = end ? new Date(`${date}T${end}`).toISOString() : ''

      setRescheduleData((prev) => ({
        ...prev,
        proposedStartTimeUtc: startIso,
        proposedEndTimeUtc: endIso,
      }))
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSelectedDate(val)
    updateParentState(val, startTime, endTime)
  }

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setStartTime(val)
    updateParentState(selectedDate, val, endTime)
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setEndTime(val)
    updateParentState(selectedDate, startTime, val)
  }

  // ==========================================
  // LOGIC VALIDATION
  // ==========================================
  const validation = useMemo(() => {
    if (!selectedDate || !startTime || !endTime) {
      return { isValid: false, errorMsg: null }
    }

    const startDateTime = new Date(`${selectedDate}T${startTime}`)
    const endDateTime = new Date(`${selectedDate}T${endTime}`)
    const now = new Date()

    // 1. Kiểm tra thời gian bắt đầu có trong tương lai không
    if (startDateTime <= now) {
      return {
        isValid: false,
        errorMsg: 'Thời gian bắt đầu dời lịch phải ở trong tương lai.',
      }
    }

    // 2. Kiểm tra giờ bắt đầu < giờ kết thúc
    if (endDateTime <= startDateTime) {
      return {
        isValid: false,
        errorMsg: 'Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.',
      }
    }

    // 3. Lý do dời lịch không được để trống
    if (!rescheduleData.reason.trim()) {
      return { isValid: false, errorMsg: null }
    }

    return { isValid: true, errorMsg: null }
  }, [selectedDate, startTime, endTime, rescheduleData.reason])

  // Handlers xử lý Đồng ý / Từ chối
  const handleAction = async (status: number) => {
    if (!pendingProposal || !onUpdateProposalStatus) return
    setProcessingStatus(status)
    try {
      await onUpdateProposalStatus(pendingProposal.id, status, responseNote)
      setResponseNote('')
    } finally {
      setProcessingStatus(null)
    }
  }

  // 💡 TRƯỜNG HỢP 1: CÓ YÊU CẦU ĐỔI LỊCH ĐANG CHỜ XỬ LÝ (PENDING)
  if (
    pendingProposal &&
    (pendingProposal.status === 'Pending' ||
      pendingProposal.status === RescheduleRequestStatus.Pending)
  ) {
    return (
      <div className="mt-5 space-y-4 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
          <Clock className="h-5 w-5 shrink-0" />
          <h4 className="text-sm font-bold">Đang có yêu cầu dời lịch học mới</h4>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-3.5 text-xs shadow-xs dark:border-amber-900/80 dark:bg-gray-900">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Bắt đầu mới đề xuất:
              </span>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                {formatDateTime(pendingProposal.proposedStartTimeUtc)}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Kết thúc mới đề xuất:
              </span>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                {formatDateTime(pendingProposal.proposedEndTimeUtc)}
              </p>
            </div>
          </div>

          {pendingProposal.reason && (
            <div className="mt-2.5 border-t border-gray-100 pt-2 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Lý do dời lịch:</span>
              <p className="mt-0.5 text-gray-700 italic dark:text-gray-300">
                "{pendingProposal.reason}"
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-gray-300">
            Ghi chú phản hồi (Không bắt buộc)
          </label>
          <input
            type="text"
            placeholder="Nhập ghi chú phản hồi..."
            value={responseNote}
            onChange={(e) => setResponseNote(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 outline-hidden focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            disabled={processingStatus !== null}
            onClick={() => handleAction(RescheduleRequestStatus.Accepted)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {processingStatus === RescheduleRequestStatus.Accepted ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Chấp nhận dời lịch
          </button>

          <button
            type="button"
            disabled={processingStatus !== null}
            onClick={() => handleAction(RescheduleRequestStatus.Rejected)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {processingStatus === RescheduleRequestStatus.Rejected ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            Từ chối
          </button>
        </div>
      </div>
    )
  }

  // 💡 TRƯỜNG HỢP 2: TẠO FORM ĐỀ XUẤT DỜI LỊCH MỚI
  return (
    <form onSubmit={onSubmitCreateProposal} className="mt-5 space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
        <CalendarCheck className="h-4 w-4 text-indigo-600" />
        <span>Đề xuất khung thời gian dời lịch mới</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* 1. CHỌN NGÀY DỜI LỊCH */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">
            Chọn ngày dời lịch <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            min={minDateStr}
            className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 outline-hidden transition focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
            value={selectedDate}
            onChange={handleDateChange}
            required
          />
        </div>

        {/* 2. CHỌN GIỜ BẮT ĐẦU */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">
            Giờ bắt đầu <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 outline-hidden transition focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
            value={startTime}
            onChange={handleStartTimeChange}
            required
          />
        </div>

        {/* 3. CHỌN GIỜ KẾT THÚC */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">
            Giờ kết thúc <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 outline-hidden transition focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
            value={endTime}
            onChange={handleEndTimeChange}
            required
          />
        </div>
      </div>

      {/* CẢNH BÁO VALIDATION NẾU CÓ LỖI */}
      {validation.errorMsg && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validation.errorMsg}</span>
        </div>
      )}

      {/* 4. LÝ DO DỜI LỊCH */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">
          Lý do dời lịch <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="Nhập lý do dời lịch gửi đến đối phương..."
          className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 outline-hidden transition focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
          value={rescheduleData.reason}
          onChange={(e) =>
            setRescheduleData({
              ...rescheduleData,
              reason: e.target.value,
            })
          }
          required
        />
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={submittingSchedule || !validation.isValid}
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submittingSchedule ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
        Gửi Yêu Cầu Dời Lịch
      </button>
    </form>
  )
}

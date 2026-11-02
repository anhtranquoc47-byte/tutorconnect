import React from 'react'
import { Loader2, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react'
import { BookingStatus } from '@/constants/enums'

interface ComplaintTabProps {
  complaintType: string
  setComplaintType: React.Dispatch<React.SetStateAction<string>>
  complaintDescription: string
  setComplaintDescription: React.Dispatch<React.SetStateAction<string>>
  complaintEvidenceUrl: string
  setComplaintEvidenceUrl: React.Dispatch<React.SetStateAction<string>>
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  myComplaint?: any
  againstMeComplaint?: any
  isLoading?: boolean
  bookingStatus?: number
}

export default function ComplaintTab({
  complaintType,
  setComplaintType,
  complaintDescription,
  setComplaintDescription,
  complaintEvidenceUrl,
  setComplaintEvidenceUrl,
  isSubmitting,
  onSubmit,
  myComplaint,
  againstMeComplaint,
  isLoading = false,
  bookingStatus,
}: ComplaintTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span className="text-xs">Đang kiểm tra khiếu nại...</span>
      </div>
    )
  }
  const isCompleted = bookingStatus === BookingStatus.Completed
  console.log(bookingStatus)
  if (!isCompleted) {
    return (
      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <AlertTriangle className="h-6 w-6 text-gray-500" />
        </div>

        <h4 className="mt-3 text-sm font-bold text-gray-800 dark:text-gray-200">
          Không thể khiếu nại
        </h4>

        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Chỉ những buổi học đã hoàn thành mới có thể khiếu nại.
        </p>
      </div>
    )
  }
  return (
    <div className="mt-5 space-y-4">
      {/* 1. HIỂN THỊ KHIẾU NẠI MÀ NGƯỜI KHÁC KHIẾU NẠI BẠN (Nếu có) */}
      {againstMeComplaint && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />

            <h4 className="text-xs font-bold">
              Bạn đang có khiếu nại trong buổi học này
            </h4>
          </div>

          <div className="mt-3 space-y-1 text-xs text-rose-700 dark:text-rose-400">
            <p>
              <strong>Người khiếu nại:</strong>{' '}
              {againstMeComplaint.createdBy?.fullName || 'Không xác định'}
            </p>

            <p>
              <strong>Loại:</strong> {againstMeComplaint.type || 'Không xác định'}
            </p>

            <p>
              <strong>Nội dung:</strong> {againstMeComplaint.description}
            </p>

            {againstMeComplaint.evidenceUrl && (
              <p>
                <strong>Minh chứng:</strong>{' '}
                <a
                  href={againstMeComplaint.evidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-purple-600 underline"
                >
                  Xem minh chứng
                </a>
              </p>
            )}

            <p>
              <strong>Trạng thái:</strong> {againstMeComplaint.status}
            </p>
          </div>
        </div>
      )}

      {/* 2. HIỂN THỊ KHIẾU NẠI BẠN ĐÃ GỬI (Nếu đã gửi rồi thì không hiện form nữa) */}
      {myComplaint ? (
        <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <CheckCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <h4 className="text-xs font-bold">Bạn đã gửi khiếu nại cho buổi học này</h4>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <strong>Mô tả:</strong> {myComplaint.description || myComplaint.reason}
          </p>
          {myComplaint.evidenceUrl && (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>Minh chứng:</strong>{' '}
              <a
                href={myComplaint.evidenceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 underline"
              >
                Xem liên kết
              </a>
            </p>
          )}
          <div className="text-[11px] font-semibold text-amber-600">
            Trạng thái xử lý:{' '}
            <span className="uppercase">{myComplaint.status || 'Đang xử lý'}</span>
          </div>
        </div>
      ) : (
        /* 3. FORM TẠO KHIẾU NẠI MỚI (Hiện khi bạn chưa gửi khiếu nại nào) */
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">
                Loại sự cố khiếu nại
              </label>
              <select
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 transition outline-none focus:border-purple-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                value={complaintType}
                onChange={(e) => setComplaintType(e.target.value)}
              >
                <option value="NoShow">Gia sư không vào lớp (No-Show)</option>
                <option value="Late">Gia sư vào lớp trễ nhiều phút</option>
                <option value="Quality">Chất lượng giảng dạy kém</option>
                <option value="InappropriateBehavior">
                  Thái độ / Hành vi không phù hợp
                </option>
                <option value="Other">Sự cố khác</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">
                Link minh chứng (Nếu có)
              </label>
              <input
                type="url"
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 transition outline-none focus:border-purple-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                value={complaintEvidenceUrl}
                onChange={(e) => setComplaintEvidenceUrl(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">
              Mô tả chi tiết sự cố
            </label>
            <textarea
              rows={3}
              placeholder="Hãy mô tả rõ tình huống đã xảy ra..."
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 transition outline-none focus:border-purple-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
              value={complaintDescription}
              onChange={(e) => setComplaintDescription(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5" />
            )}
            Gửi Khiếu Nại Mới
          </button>
        </form>
      )}
    </div>
  )
}

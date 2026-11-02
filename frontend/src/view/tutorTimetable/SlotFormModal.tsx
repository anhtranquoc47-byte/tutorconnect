import { useState, useEffect } from 'react'
import type { DayOfWeek, TutorAvailabilityResponse } from '@/apis/fe2/tutorAvailability.types'

const DAY_LABELS: Record<number, string> = {
  0: 'Chủ Nhật',
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
  6: 'Thứ Bảy',
}

interface Props {
  isOpen: boolean
  initialDay?: DayOfWeek
  editing?: TutorAvailabilityResponse | null
  onClose: () => void
  onSave: (day: DayOfWeek, startTime: string, endTime: string) => Promise<void>
}

export function SlotFormModal({ isOpen, initialDay, editing, onClose, onSave }: Props) {
  const [day, setDay] = useState<DayOfWeek>(initialDay ?? 1)
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('10:00')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (editing) {
      setDay(editing.dayOfWeek)
      setStartTime(editing.startTime.slice(0, 5))
      setEndTime(editing.endTime.slice(0, 5))
    } else {
      setDay(initialDay ?? 1)
      setStartTime('08:00')
      setEndTime('10:00')
    }
    setError(null)
  }, [isOpen, editing, initialDay])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (startTime >= endTime) {
      setError('Giờ kết thúc phải sau giờ bắt đầu.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(day, `${startTime}:00`, `${endTime}:00`)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu khung giờ rảnh.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editing ? 'Chỉnh sửa Khung giờ' : 'Thêm Khung giờ rảnh'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {editing ? 'Cập nhật khung giờ giảng dạy rảnh của bạn.' : 'Cài đặt khung giờ rảnh hàng tuần mà bạn có thể dạy.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Ngày trong tuần
            </label>
            <div className="grid grid-cols-7 gap-1">
              {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  className={`
                    py-2 rounded-xl text-xs font-bold transition-all
                    ${day === d
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {d === 0 ? 'CN' : `T${d + 1}`}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5 text-center">
              Đã chọn: <span className="font-semibold text-slate-600 dark:text-slate-300">{DAY_LABELS[day]}</span>
            </p>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Giờ bắt đầu
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Giờ kết thúc
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Duration preview */}
          {startTime < endTime && (
            <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-brand-700 dark:text-brand-300 font-medium">
                Thời lượng: {getDuration(startTime, endTime)}
              </p>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-md shadow-brand-500/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const totalMin = (eh * 60 + em) - (sh * 60 + sm)
  if (totalMin <= 0) return ''
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m} phút`
  if (m === 0) return `${h} giờ`
  return `${h}h ${m}p`
}

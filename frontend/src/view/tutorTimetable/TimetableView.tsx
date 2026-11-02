import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  PauseCircle,
  Play,
  X,
  Check,
  AlertCircle,
  Hourglass,
  XCircle,
  Flag,
  Calendar,
  ClipboardList,
} from 'lucide-react'

import { tutorAvailabilityApi } from '@/apis/fe2/tutorAvailability.api'
import { bookingApi } from '@/apis/fe2/booking.api'
import type { TutorAvailabilityResponse, DayOfWeek } from '@/apis/fe2/tutorAvailability.types'
import type { BookingResponse, BookingStatus } from '@/apis/fe2/booking.types'
import { SlotFormModal } from './SlotFormModal'
import { BookingActionModal } from './BookingActionModal'
import { tutorCard } from '../tutorProfile/profileTheme'

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS: { value: DayOfWeek; short: string }[] = [
  { value: 1, short: 'Thứ 2' },
  { value: 2, short: 'Thứ 3' },
  { value: 3, short: 'Thứ 4' },
  { value: 4, short: 'Thứ 5' },
  { value: 5, short: 'Thứ 6' },
  { value: 6, short: 'Thứ 7' },
  { value: 0, short: 'Chủ Nhật' },
]

const BOOKING_STATUS_STYLE: Record<BookingStatus, string> = {
  Pending: 'bg-amber-500/10 text-amber-200 border-amber-500/20',
  Confirmed: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20',
  Rejected: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  Cancelled: 'bg-red-500/10 text-red-200 border-red-500/20',
  Completed: 'bg-sky-500/10 text-sky-200 border-sky-500/20',
}

const BOOKING_CARD_THEME: Record<
  BookingStatus,
  {
    strip: string
    iconBg: string
    icon: ReactNode
    tagBg: string
    tagText: string
    priceColor: string
    cardBorder: string
  }
> = {
  Pending: {
    strip: 'bg-amber-500',
    iconBg: 'bg-amber-500/15 border-amber-500/25',
    icon: <Hourglass className="h-6 w-6 text-amber-400" strokeWidth={1.75} />,
    tagBg: 'bg-amber-500/20 border-amber-500/30',
    tagText: 'text-amber-300',
    priceColor: 'text-amber-400',
    cardBorder: 'border-amber-500/15',
  },
  Confirmed: {
    strip: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/15 border-emerald-500/25',
    icon: <CheckCircle2 className="h-6 w-6 text-emerald-400" strokeWidth={1.75} />,
    tagBg: 'bg-emerald-500/20 border-emerald-500/30',
    tagText: 'text-emerald-300',
    priceColor: 'text-emerald-400',
    cardBorder: 'border-emerald-500/15',
  },
  Rejected: {
    strip: 'bg-slate-500',
    iconBg: 'bg-slate-500/15 border-slate-500/25',
    icon: <XCircle className="h-6 w-6 text-slate-400" strokeWidth={1.75} />,
    tagBg: 'bg-slate-500/20 border-slate-500/30',
    tagText: 'text-slate-300',
    priceColor: 'text-slate-400',
    cardBorder: 'border-slate-500/15',
  },
  Cancelled: {
    strip: 'bg-red-500',
    iconBg: 'bg-red-500/15 border-red-500/25',
    icon: <XCircle className="h-6 w-6 text-red-400" strokeWidth={1.75} />,
    tagBg: 'bg-red-500/20 border-red-500/30',
    tagText: 'text-red-300',
    priceColor: 'text-red-400',
    cardBorder: 'border-red-500/15',
  },
  Completed: {
    strip: 'bg-sky-500',
    iconBg: 'bg-sky-500/15 border-sky-500/25',
    icon: <Flag className="h-6 w-6 text-sky-400" strokeWidth={1.75} />,
    tagBg: 'bg-sky-500/20 border-sky-500/30',
    tagText: 'text-sky-300',
    priceColor: 'text-sky-400',
    cardBorder: 'border-sky-500/15',
  },
}

const BOOKING_STATUS_ICON: Record<BookingStatus, ReactNode> = {
  Pending: <Clock className="h-3.5 w-3.5" />,
  Confirmed: <CheckCircle2 className="h-3.5 w-3.5" />,
  Rejected: <X className="h-3.5 w-3.5" />,
  Cancelled: <X className="h-3.5 w-3.5" />,
  Completed: <FileText className="h-3.5 w-3.5" />,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(t: string) {
  if (!t) return ''
  if (t.includes('T')) {
    const utcStr = t.endsWith('Z') || t.includes('+') ? t : `${t}Z`
    const d = new Date(utcStr)
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh',
    })
  }
  return t.slice(0, 5)
}

function getDuration(start: string, end: string): string {
  const [shStr, smStr] = start.slice(0, 5).split(':')
  const [ehStr, emStr] = end.slice(0, 5).split(':')
  const sh = Number(shStr)
  const sm = Number(smStr)
  const eh = Number(ehStr)
  const em = Number(emStr)
  if (![sh, sm, eh, em].every(Number.isFinite)) return ''
  const totalMin = eh * 60 + em - (sh * 60 + sm)
  if (totalMin <= 0) return ''
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m} phút`
  if (m === 0) return `${h} giờ`
  return `${h}h ${m}p`
}

function getDayOfWeekVN(iso: string): number {
  const d = new Date(iso)
  const vnStr = d.toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  const map: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  }
  return map[vnStr] ?? -1
}

function formatBookingDateTime(iso: string) {
  if (!iso) return ''
  const utcStr = iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`
  const d = new Date(utcStr)
  const time = d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  const date = d.toLocaleDateString('vi-VN', {
    weekday: 'short',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  return `${time} • ${date}`
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

function getWeekRangeLabel(weekOffset: number): string {
  const now = new Date()
  const currentDay = now.getDay()
  const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay
  const monday = new Date(now)
  monday.setDate(now.getDate() + distanceToMon + weekOffset * 7)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const fmtDateMonth = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`
  const monYear = monday.getFullYear()
  const sunYear = sunday.getFullYear()

  if (monYear !== sunYear) {
    return `${fmtDateMonth(monday)}/${monYear} - ${fmtDateMonth(sunday)}/${sunYear}`
  }

  return `${fmtDateMonth(monday)} - ${fmtDateMonth(sunday)}/${monYear}`
}

function getDayDateString(dayOfWeek: DayOfWeek, weekOffset: number): string {
  const now = new Date()
  const currentDay = now.getDay()
  const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay
  const monday = new Date(now)
  monday.setDate(now.getDate() + distanceToMon + weekOffset * 7)

  const addDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const targetDate = new Date(monday)
  targetDate.setDate(monday.getDate() + addDays)

  return `${targetDate.getDate()} Thg ${targetDate.getMonth() + 1}`
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
}: {
  label: string
  value: string
  icon: ReactNode
  iconBg: string
}) {
  return (
    <div className={`${tutorCard} flex items-center gap-3.5 px-5 py-4`}>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-2xl font-extrabold leading-tight text-white">{value}</p>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function TimetableView() {
  const [slots, setSlots] = useState<TutorAvailabilityResponse[]>([])
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)

  // Slot modal
  const [slotModalOpen, setSlotModalOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<TutorAvailabilityResponse | null>(null)
  const [modalInitialDay, setModalInitialDay] = useState<DayOfWeek>(1)

  // Slot delete
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  // Booking modal
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null)

  // Tab + filter
  const [activeTab, setActiveTab] = useState<'timetable' | 'bookings'>('timetable')
  const [bookingFilter, setBookingFilter] = useState<BookingStatus | 'All'>('All')

  async function loadAll() {
    setLoading(true)
    setError(null)
    try {
      const [slotData, bookingData] = await Promise.all([
        tutorAvailabilityApi.getMyAvailabilities(),
        bookingApi.getMyBookings(),
      ])
      setSlots(slotData)
      setBookings(bookingData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu lịch giảng dạy.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  // ── Slot CRUD ────────────────────────────────────────────────────────────────

  function openAddSlotModal(day: DayOfWeek) {
    setEditingSlot(null)
    setModalInitialDay(day)
    setSlotModalOpen(true)
  }

  function openEditSlotModal(slot: TutorAvailabilityResponse) {
    setEditingSlot(slot)
    setModalInitialDay(slot.dayOfWeek)
    setSlotModalOpen(true)
  }

  async function handleSaveSlot(day: DayOfWeek, startTime: string, endTime: string) {
    if (editingSlot) {
      const updated = await tutorAvailabilityApi.updateAvailability(editingSlot.id, {
        dayOfWeek: day,
        startTime,
        endTime,
      })
      setSlots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    } else {
      const created = await tutorAvailabilityApi.createAvailability({ dayOfWeek: day, startTime, endTime })
      setSlots((prev) => [...prev, created])
    }
  }

  async function handleToggleSlot(slot: TutorAvailabilityResponse) {
    setTogglingId(slot.id)
    try {
      const updated = await tutorAvailabilityApi.setAvailabilityStatus(slot.id, { isActive: !slot.isActive })
      setSlots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDeleteSlot(id: number) {
    setDeletingId(id)
    try {
      await tutorAvailabilityApi.setAvailabilityStatus(id, { isActive: false })
      setSlots((prev) => prev.filter((s) => s.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  function handleBookingUpdated(updated: BookingResponse) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    setSelectedBooking(null)
  }

  const pendingCount = useMemo(() => bookings.filter((b) => b.status === 'Pending').length, [bookings])
  const confirmedCount = useMemo(() => bookings.filter((b) => b.status === 'Confirmed').length, [bookings])
  const activeSlotCount = useMemo(() => slots.filter((s) => s.isActive).length, [slots])

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'All') return bookings
    return bookings.filter((b) => b.status === bookingFilter)
  }, [bookingFilter, bookings])

  // ── Render guards ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Đang tải lịch giảng dạy...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[420px] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <AlertCircle className="h-6 w-6 text-red-300" />
          </div>
          <p className="mt-3 text-sm font-semibold text-white">{error}</p>
          <button type="button" onClick={loadAll} className="mt-2 text-xs font-semibold text-brand-300 hover:underline">
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full bg-[#0b0e14] px-2 sm:px-4 lg:px-6 py-6">
      <div className="mx-auto max-w-[1220px] space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-white sm:text-[1.65rem]">Lịch giảng dạy</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">Quản lý khung giờ rảnh hàng tuần và phản hồi yêu cầu đặt lịch từ học viên.</p>
          </div>

          {activeTab === 'timetable' && (
            <button
              type="button"
              onClick={() => openAddSlotModal(1)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-brand-600/30 transition hover:bg-brand-500"
            >
              <Plus className="h-4 w-4" />
              Thêm khung giờ rảnh
            </button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="KHUNG GIỜ RẢNH"
            value={String(activeSlotCount)}
            icon={<CalendarDays className="h-5 w-5 text-brand-300" />}
            iconBg="bg-brand-500/10 border-brand-500/20"
          />
          <StatCard
            label="LỊCH CHỜ XỬ LÝ"
            value={String(pendingCount)}
            icon={<Hourglass className="h-5 w-5 text-amber-300" />}
            iconBg="bg-amber-500/10 border-amber-500/20"
          />
          <StatCard
            label="ĐÃ XÁC NHẬN"
            value={String(confirmedCount)}
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-300" />}
            iconBg="bg-emerald-500/10 border-emerald-500/20"
          />
          <StatCard
            label="TỔNG LỊCH HỌC"
            value={String(bookings.length)}
            icon={<ClipboardList className="h-5 w-5 text-sky-300" />}
            iconBg="bg-sky-500/10 border-sky-500/20"
          />
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 border-b border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab('timetable')}
            className={`relative flex items-center gap-2 px-4 py-3 text-xs font-extrabold transition ${
              activeTab === 'timetable'
                ? 'text-brand-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Lịch rảnh hàng tuần
            {activeTab === 'timetable' && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`relative flex items-center gap-2 px-4 py-3 text-xs font-extrabold transition ${
              activeTab === 'bookings'
                ? 'text-brand-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            Danh sách Đặt lịch
            {pendingCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-extrabold text-white">
                {pendingCount}
              </span>
            )}
            {activeTab === 'bookings' && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-500" />
            )}
          </button>
        </div>

        {activeTab === 'timetable' ? (
          // ── Weekly availability panel ──
          <div className={`${tutorCard} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-brand-300" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    LỊCH RẢNH HÀNG TUẦN ({getWeekRangeLabel(weekOffset)})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setWeekOffset(0)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset((p) => p - 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] transition"
                  title="Tuần trước"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-300" />
                </button>
                <button
                  type="button"
                  onClick={() => setWeekOffset((p) => p + 1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] transition"
                  title="Tuần sau"
                >
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              </div>
            </div>

            <div className="px-3 py-4">
              <div className="space-y-1">
                {DAYS.map(({ value: dayValue, short }) => {
                  const daySlots = slots.filter((s) => s.dayOfWeek === dayValue)
                  const dayBookings = bookings.filter((b) => getDayOfWeekVN(b.startTimeUtc) === dayValue)

                  return (
                    <div key={dayValue} className="grid grid-cols-[98px_1fr_44px] items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-white/[0.02]">
                      <div>
                        <div className="text-xs font-extrabold tracking-wider text-slate-300">{short}</div>
                        <div className="mt-0.5 text-[11px] font-medium text-slate-500">{getDayDateString(dayValue, weekOffset)}</div>
                        {dayBookings.length > 0 && (
                          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5">
                            <Clock className="h-3 w-3 text-amber-300" />
                            <span className="text-[11px] font-extrabold text-amber-200">{dayBookings.length}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {daySlots.length === 0 ? (
                          <button
                            type="button"
                            onClick={() => openAddSlotModal(dayValue)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Thêm giờ
                          </button>
                        ) : (
                          daySlots.map((slot) => (
                            <SlotChip
                              key={slot.id}
                              slot={slot}
                              isDeleting={deletingId === slot.id}
                              isToggling={togglingId === slot.id}
                              onEdit={() => openEditSlotModal(slot)}
                              onToggle={() => handleToggleSlot(slot)}
                              onDelete={() => handleDeleteSlot(slot.id)}
                            />
                          ))
                        )}

                        {dayBookings.length > 0 &&
                          dayBookings.map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setSelectedBooking(b)}
                              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-extrabold transition hover:bg-white/[0.03] ${BOOKING_STATUS_STYLE[b.status]}`}
                              title={`Booking #${b.id}`}
                            >
                              {BOOKING_STATUS_ICON[b.status]}
                              <span className="whitespace-nowrap">{formatTime(b.startTimeUtc)} – {formatTime(b.endTimeUtc)}</span>
                            </button>
                          ))}

                        {daySlots.length > 0 && (
                          <button
                            type="button"
                            onClick={() => openAddSlotModal(dayValue)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Thêm giờ
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => openAddSlotModal(dayValue)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-slate-300 hover:bg-white/[0.08] hover:text-white transition"
                          title={`Thêm giờ rảnh cho ${short}`}
                          aria-label="Thêm giờ"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 border-t border-white/[0.06] px-6 py-4">
              <LegendItem tone="bg-emerald-500/20 border border-emerald-500/30" dot="bg-emerald-400" text="Khung giờ đang rảnh" />
              <LegendItem tone="bg-red-500/20 border border-red-500/30" dot="bg-red-400" text="Khung giờ tạm dừng" />
              <LegendItem tone="bg-amber-500/20 border border-amber-500/30" dot="bg-amber-400" text="Lịch học chờ duyệt" />
              <LegendItem tone="bg-emerald-500/20 border border-emerald-500/30" dot="bg-emerald-400" text="Đã xác nhận" />
            </div>
          </div>
        ) : (
          // ── Bookings tab ──
          <div className="space-y-4">
            {/* Status filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { key: 'All', label: 'Tất cả' },
                  { key: 'Pending', label: 'Chờ duyệt' },
                  { key: 'Confirmed', label: 'Đã xác nhận' },
                  { key: 'Completed', label: 'Hoàn thành' },
                  { key: 'Rejected', label: 'Đã hủy' },
                  { key: 'Cancelled', label: 'Bị từ chối' },
                ] as const
              ).map((f) => {
                const count = f.key === 'All' ? bookings.length : bookings.filter((b) => b.status === f.key).length
                const isActive = bookingFilter === f.key
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setBookingFilter(f.key)}
                    className={`rounded-full border px-4 py-2 text-xs font-extrabold transition ${
                      isActive
                        ? 'border-brand-500/40 bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                        : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.12] hover:text-slate-200'
                    }`}
                  >
                    {f.label} ({count})
                  </button>
                )
              })}
            </div>

            {filteredBookings.length === 0 ? (
              <div className={`${tutorCard} py-14 text-center`}>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                  <ClipboardList className="h-6 w-6 text-slate-500" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-300">Không tìm thấy lịch đặt nào cho bộ lọc này.</p>
                <p className="mt-1 text-xs text-slate-500">Các yêu cầu đặt lịch từ học viên sẽ hiển thị tại đây.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings
                  .slice()
                  .sort((a, b) => new Date(b.startTimeUtc).getTime() - new Date(a.startTimeUtc).getTime())
                  .map((b) => (
                    <BookingCard key={b.id} booking={b} onClick={() => setSelectedBooking(b)} />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <SlotFormModal
          isOpen={slotModalOpen}
          initialDay={modalInitialDay}
          editing={editingSlot}
          onClose={() => setSlotModalOpen(false)}
          onSave={handleSaveSlot}
        />
        <BookingActionModal
          isOpen={selectedBooking !== null}
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdated={handleBookingUpdated}
        />
      </div>
    </div>
  )
}

function LegendItem({ tone, dot, text }: { tone: string; dot: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`flex h-6 w-6 items-center justify-center rounded-xl ${tone}`}>
        <div className={`h-2 w-2 rounded-full ${dot}`} />
      </div>
      <span className="text-xs font-semibold text-slate-400">{text}</span>
    </div>
  )
}

function SlotChip({
  slot,
  isDeleting,
  isToggling,
  onEdit,
  onToggle,
  onDelete,
}: {
  slot: TutorAvailabilityResponse
  isDeleting: boolean
  isToggling: boolean
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const active = slot.isActive
  const base =
    'group relative flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-extrabold transition'

  return (
    <div className={`${base} ${active ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' : 'border-red-500/20 bg-red-500/10 text-red-200'}`}>
      <span className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-400' : 'bg-red-400'}`} />
      <span className="whitespace-nowrap">
        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
      </span>
      <span className="opacity-70 whitespace-nowrap">({getDuration(slot.startTime, slot.endTime)})</span>

      {/* actions - chỉ hiện khi hover */}
      <div className="ml-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onEdit}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${active ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-100' : 'border-red-500/20 bg-red-500/5 text-red-100'} hover:bg-white/[0.03]`}
          title="Chỉnh sửa"
          aria-label="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToggle}
          disabled={isToggling}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${
            active ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-100' : 'border-red-500/20 bg-red-500/5 text-red-100'
          } hover:bg-white/[0.03] disabled:opacity-60 disabled:cursor-not-allowed`}
          title={active ? 'Tạm dừng' : 'Bật rảnh'}
          aria-label="Toggle"
        >
          {isToggling ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : active ? (
            <PauseCircle className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>

        {confirmDelete ? (
          <>
            <button
              type="button"
              onClick={() => {
                onDelete()
                setConfirmDelete(false)
              }}
              disabled={isDeleting}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/15 text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              title="Xác nhận xóa"
              aria-label="Confirm delete"
            >
              {isDeleting ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-100 border-t-transparent" /> : <Check className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 hover:bg-white/[0.05]"
              title="Hủy"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-slate-300 hover:text-red-200 hover:bg-red-500/10 hover:border-red-500/20"
            title="Xóa"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

function BookingCard({ booking, onClick }: { booking: BookingResponse; onClick: () => void }) {
  const theme = BOOKING_CARD_THEME[booking.status]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full overflow-hidden rounded-2xl border bg-[#151921]/90 text-left transition hover:bg-[#151921] ${theme.cardBorder}`}
    >
      {/* Left status strip */}
      <div className={`w-1 shrink-0 ${theme.strip}`} />

      <div className="flex flex-1 items-start gap-4 p-4 sm:p-5">
        {/* Status icon */}
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${theme.iconBg}`}>
          {theme.icon}
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-white">Mã đặt lịch {formatBookingCode(booking.id, booking.startTimeUtc)}</span>

            <span className={`rounded-md border px-2 py-0.5 text-[11px] font-extrabold ${theme.tagBg} ${theme.tagText}`}>
              {booking.status === 'Pending'
                ? 'Chờ duyệt'
                : booking.status === 'Confirmed'
                ? 'Đã xác nhận'
                : booking.status === 'Completed'
                ? 'Hoàn thành'
                : booking.status === 'Rejected'
                ? 'Đã hủy'
                : 'Bị từ chối'}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span>{formatBookingDateTime(booking.startTimeUtc)}</span>
          </div>

          {booking.studentNote && (
            <p className="mt-1.5 text-xs italic text-slate-500">&ldquo;{booking.studentNote}&rdquo;</p>
          )}

          {booking.status === 'Pending' && (
            <p className="mt-3 text-[11px] font-semibold text-amber-400/90">
              Cần xử lý — bấm để xác nhận hoặc từ chối
            </p>
          )}
        </div>

        {/* Right: price + chevron */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <p className={`text-sm font-extrabold ${theme.priceColor}`}>{booking.creditCost} credits</p>
            {booking.meetingUrl && (
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">Đã có link phòng học</p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-slate-600 transition group-hover:text-slate-400" />
        </div>
      </div>
    </button>
  )
}
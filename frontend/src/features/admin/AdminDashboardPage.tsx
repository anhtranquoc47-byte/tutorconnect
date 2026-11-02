import { useEffect, useState } from 'react'
import { adminApi } from './admin.api'
import type { DashboardStats, TutorApplication, Complaint, AdminUser } from './admin.types'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { X, RefreshCw, ExternalLink, Video, Radio } from 'lucide-react'
import { http } from '@/lib/api/http'

interface RealBookingItem {
  id: number | string
  rawId: number | string
  studentName: string
  tutorName: string
  subjectName: string
  creditCost: number
  startTimeUtc: string
  endTimeUtc: string
  status: string
  statusReason?: string
  meetingUrl?: string
  isHappeningNow?: boolean
}

// Hàm kiểm tra xem ca học có đang trong khung giờ diễn ra hay không
function checkIsHappeningNow(startTimeUtc: string, endTimeUtc: string, status: string): boolean {
  const s = status.toLowerCase()
  if (!s.includes('đã xác nhận') && s !== 'confirmed') return false
  try {
    const now = Date.now()
    const startUtc = startTimeUtc.endsWith('Z') || startTimeUtc.includes('+') ? startTimeUtc : `${startTimeUtc}Z`
    const endUtc = endTimeUtc
      ? endTimeUtc.endsWith('Z') || endTimeUtc.includes('+')
        ? endTimeUtc
        : `${endTimeUtc}Z`
      : ''

    const startMs = new Date(startUtc).getTime()
    if (isNaN(startMs)) return false

    const endMs =
      endUtc && !isNaN(new Date(endUtc).getTime())
        ? new Date(endUtc).getTime()
        : startMs + 90 * 60 * 1000

    return now >= startMs - 15 * 60 * 1000 && now <= endMs + 15 * 60 * 1000
  } catch {
    return false
  }
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // State Modal và Dữ liệu ca học thực tế
  const [selectedStatusType, setSelectedStatusType] = useState<string | null>(null)
  const [selectedWeekKey, setSelectedWeekKey] = useState<string>('ALL')
  const [realBookings, setRealBookings] = useState<RealBookingItem[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)

  // State dữ liệu Hồ sơ chờ duyệt & Khiếu nại thực tế
  const [pendingTutors, setPendingTutors] = useState<TutorApplication[]>([])
  const [openComplaintsList, setOpenComplaintsList] = useState<Complaint[]>([])
  const [isLoadingPendingTutors, setIsLoadingPendingTutors] = useState(false)
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false)

  const loadStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await adminApi.getDashboardStats()
      setStats(data)
    } catch {
      setError('Không thể tải số liệu thống kê dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const getActualStudentName = (item: any, userList: AdminUser[]): string => {
    if (
      item.studentName &&
      typeof item.studentName === 'string' &&
      item.studentName.trim() &&
      item.studentName !== 'Học viên' &&
      item.studentName !== 'HV: Học viên'
    ) {
      return item.studentName
    }
    if (item.student?.fullName) return item.student.fullName
    if (item.studentUser?.fullName) return item.studentUser.fullName

    const sid = String(item.studentId || item.StudentId || item.userId || '')
    if (sid) {
      const matchedUser = userList.find((u) => String(u.id) === sid)
      if (matchedUser?.name) return matchedUser.name
    }

    if (sid) return `Học viên #${sid}`
    return 'Học viên đặt lớp'
  }

  const getActualTutorName = (
    item: any,
    tutorApps: TutorApplication[],
    userList: AdminUser[],
  ): string => {
    if (
      item.tutorName &&
      typeof item.tutorName === 'string' &&
      item.tutorName.trim()
    ) {
      return item.tutorName
    }
    if (item.tutor?.fullName) return item.tutor.fullName
    if (item.tutorSubject?.tutor?.user?.fullName) return item.tutorSubject.tutor.user.fullName
    if (item.tutorSubject?.tutor?.fullName) return item.tutorSubject.tutor.fullName

    const tid = String(
      item.tutorId ||
        item.TutorId ||
        item.tutorSubjectId ||
        item.TutorSubjectId ||
        '',
    )

    if (tid) {
      const matchedApp = tutorApps.find((t) => String(t.id) === tid)
      if (matchedApp?.fullName) return matchedApp.fullName

      const matchedUser = userList.find((u) => String(u.id) === tid)
      if (matchedUser?.name) return matchedUser.name
    }

    if (tid) return `Gia sư #${tid}`
    return 'Gia sư nhận lớp'
  }

  const extractSubjectName = (item: any): string => {
    const rawDirect =
      item.subjectName ||
      item.subject?.name ||
      item.tutorSubject?.subject?.name ||
      item.tutorSubjectName

    if (rawDirect && rawDirect !== 'Môn học') {
      return rawDirect
    }

    const title = item.title || item.description || ''
    if (title.includes('Toán')) return 'Toán'
    if (title.includes('Vật Lý') || title.includes('Vật lý')) return 'Vật lý'
    if (title.includes('Sinh')) return 'Sinh học'
    if (title.includes('Hóa')) return 'Hóa học'
    if (title.includes('Anh') || title.includes('English')) return 'Tiếng Anh'

    return rawDirect || 'Môn học'
  }

  const fetchAllBookingsData = async () => {
    try {
      let apiList: any[] = []
      let systemUsers: AdminUser[] = []
      let tutorApplicationsList: TutorApplication[] = []

      try {
        const [uRes, tRes] = await Promise.all([
          adminApi.getUsers({ pageSize: 1000 }).catch(() => []),
          adminApi.getTutorApplications({ status: 'all' }).catch(() => []),
        ])
        systemUsers = uRes
        tutorApplicationsList = tRes
      } catch (err) {
        console.warn('Đang đồng bộ người dùng từ hệ thống:', err)
      }

      try {
        const response = await http.get<any>('/api/v1/bookings')
        const raw = response.data
        if (Array.isArray(raw)) apiList = raw
        else if (Array.isArray(raw?.data)) apiList = raw.data
        else if (Array.isArray(raw?.items)) apiList = raw.items
      } catch (err) {
        console.warn('Đang đồng bộ dữ liệu ca học từ hệ thống:', err)
      }

      const mappedList: RealBookingItem[] = apiList.map((item) => {
        const dateStr = item.startTimeUtc
          ? new Date(item.startTimeUtc).toISOString().slice(0, 10).replace(/-/g, '')
          : '20261025'

        const fullBookingCode = `BK-${dateStr}-${item.id}`

        let statusText = 'Chờ xác nhận'
        const st = String(item.status).toLowerCase().trim()

        if (st === '1' || st === 'pending') {
          statusText = 'Chờ xác nhận'
        } else if (st === '2' || st === 'confirmed') {
          statusText = 'Đã xác nhận'
        } else if (st === '3' || st === 'rejected') {
          statusText = 'Gia sư từ chối'
        } else if (st === '4' || st === 'cancelled') {
          statusText = 'Học viên đã hủy'
        } else if (st === '5' || st === 'completed') {
          statusText = 'Đã hoàn thành'
        }

        let defaultReason = ''
        if (st === '5' || st === 'completed') defaultReason = 'Đã hoàn thành ca học & giải ngân 90%'
        else if (st === '4' || st === 'cancelled') defaultReason = 'Học viên đã hủy ca học'
        else if (st === '3' || st === 'rejected') defaultReason = 'Gia sư từ chối nhận ca học'

        // 🎯 NẾU ĐÃ HỦY HOẶC TỪ CHỐI -> TUYỆT ĐỐI KHÔNG CẤP LINK MEET
        const isCancelledOrRejected =
          st === '3' || st === 'rejected' || st === '4' || st === 'cancelled'

        let finalMeetingUrl = ''
        if (!isCancelledOrRejected) {
          const tutorSubId = item.tutorSubjectId || item.tutorSubject?.id
          const slotGroupKey = `slot_group_meet_${tutorSubId}_${(item.startTimeUtc || '').slice(0, 16)}`
          const storedSharedMeet =
            localStorage.getItem(slotGroupKey) || localStorage.getItem(`slot_meet_${item.id}`)

          finalMeetingUrl = item.meetingUrl || storedSharedMeet || ''
          if (!finalMeetingUrl && (st === '2' || st === 'confirmed')) {
            finalMeetingUrl = `https://meet.google.com/edu-${String(item.id).padStart(3, '0')}-cls`
          }
        }

        const isLive = checkIsHappeningNow(item.startTimeUtc, item.endTimeUtc, statusText)

        return {
          id: fullBookingCode,
          rawId: item.id,
          studentName: item.studentName || item.student?.fullName || getActualStudentName(item, systemUsers),
          tutorName: item.tutorName || item.tutorSubject?.tutor?.user?.fullName || getActualTutorName(item, tutorApplicationsList, systemUsers),
          subjectName: item.subjectName || extractSubjectName(item),
          creditCost: item.creditCost ?? 0,
          startTimeUtc: item.startTimeUtc || item.date || '15/09/2026 19:30',
          endTimeUtc: item.endTimeUtc || '',
          status: statusText,
          statusReason: item.statusReason || item.reason || defaultReason,
          meetingUrl: finalMeetingUrl,
          isHappeningNow: isLive,
        }
      })

      setRealBookings(mappedList)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    void loadStats()
    void fetchAllBookingsData()
    const interval = setInterval(fetchAllBookingsData, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleOpenModal = async (modalKey: string) => {
    setSelectedStatusType(modalKey)
    setSelectedWeekKey('ALL')
    setIsLoadingBookings(true)
    try {
      await fetchAllBookingsData()
      if (modalKey === 'PENDING_TUTORS') {
        setIsLoadingPendingTutors(true)
        try {
          const apps = await adminApi.getTutorApplications({ status: 'pending' })
          setPendingTutors(apps)
        } catch (err) {
          console.error('Lỗi khi tải danh sách hồ sơ:', err)
        } finally {
          setIsLoadingPendingTutors(false)
        }
      } else if (modalKey === 'OPEN_COMPLAINTS') {
        setIsLoadingComplaints(true)
        try {
          const complaints = await adminApi.getComplaints('open')
          setOpenComplaintsList(complaints)
        } catch (err) {
          console.error('Lỗi khi tải danh sách khiếu nại:', err)
        } finally {
          setIsLoadingComplaints(false)
        }
      }
    } finally {
      setIsLoadingBookings(false)
    }
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadStats()} />
  }

  const bookingStats = stats?.periodMetrics.bookingStatistics || {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
  }

  const goalMetrics = stats?.currentSnapshot.goalCompletionRate || {
    completedGoals: 0,
    eligibleGoals: 0,
    ratePercent: 0,
  }

  const realPendingCount = realBookings.filter((b) => b.status === 'Chờ xác nhận').length
  const realConfirmedCount = realBookings.filter((b) => b.status === 'Đã xác nhận').length
  const realCompletedCount = realBookings.filter((b) => b.status === 'Đã hoàn thành').length
  const realCancelledOrRejectedCount = realBookings.filter(
    (b) => b.status === 'Học viên đã hủy' || b.status === 'Gia sư từ chối',
  ).length
  const realLiveCount = realBookings.filter((b) => b.isHappeningNow).length

  const completedBookingsList = realBookings.filter(
    (b) => b.status.toLowerCase().includes('hoàn thành') || b.status.toLowerCase() === 'completed',
  )
  const totalCompletedCreditsSum = completedBookingsList.reduce(
    (acc, cur) => acc + (cur.creditCost || 0),
    0,
  )
  const platform10PercentCommissionCredits = Math.round(totalCompletedCreditsSum * 0.1)
  const platform10PercentCommissionVnd = platform10PercentCommissionCredits * 1000

  const getWeekKey = (isoStr: string) => {
    if (!isoStr) return 'Khác'
    try {
      const utcStr = isoStr.endsWith('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`
      const d = new Date(utcStr)
      if (isNaN(d.getTime())) return 'Khác'

      const day = d.getDay()
      const diffToMonday = d.getDate() - (day === 0 ? 6 : day - 1)
      const monday = new Date(d)
      monday.setDate(diffToMonday)

      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)

      const formatD = (date: Date) =>
        `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`

      return `${formatD(monday)} - ${formatD(sunday)}`
    } catch {
      return 'Khác'
    }
  }

  const uniqueWeeks = Array.from(
    new Set(realBookings.map((b) => getWeekKey(b.startTimeUtc))),
  ).filter((w) => w !== 'Khác')

  const filteredBookingsForModal = realBookings.filter((b) => {
    const s = b.status.toLowerCase().trim()
    let matchesStatus = true
    if (selectedStatusType === 'CONFIRMED') {
      matchesStatus = s === 'đã xác nhận' || s === 'confirmed'
    } else if (selectedStatusType === 'PENDING') {
      matchesStatus = s === 'chờ xác nhận' || s === 'pending'
    } else if (selectedStatusType === 'CANCELLED') {
      matchesStatus = s.includes('hủy') || s.includes('từ chối') || s === 'cancelled' || s === 'rejected'
    } else if (selectedStatusType === 'COMPLETED' || selectedStatusType === 'PLATFORM_REVENUE') {
      matchesStatus = s.includes('hoàn thành') || s === 'completed'
    }

    if (!matchesStatus) return false

    if (selectedWeekKey === 'LIVE_NOW') {
      return b.isHappeningNow === true
    }

    if (selectedWeekKey !== 'ALL') {
      const wKey = getWeekKey(b.startTimeUtc)
      if (wKey !== selectedWeekKey) return false
    }

    return true
  })

  const formatUtcTime = (iso: string) => {
    if (!iso) return 'N/A'
    if (iso.includes('/') || (iso.includes(':') && !iso.includes('T'))) return iso
    try {
      const utcStr = iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`
      return new Date(utcStr).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  const totalRealBookingsCount = realBookings.length > 0 ? realBookings.length : bookingStats.total

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="from-brand-700 via-brand-600 shadow-brand-600/15 relative overflow-hidden rounded-3xl bg-gradient-to-r to-indigo-600 p-6 text-white shadow-xl sm:p-8">
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Hệ thống quản trị GiaSưConnect
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Chào mừng trở lại, Quản trị viên! 👋
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-white/80">
              Theo dõi hiệu năng hệ thống, giám sát phòng học Google Meet, quản lý dòng tiền Escrow và xử lý khiếu nại.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button
              variant="gradient"
              onClick={() => navigate('/admin/tutor-applications')}
              className="shadow-lg shadow-black/20"
            >
              📋 Duyệt hồ sơ ({stats?.currentSnapshot.pendingTutorApprovals || 0})
            </Button>
          </div>
        </div>

        <div aria-hidden="true" className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      {/* KPI STAT CARDS DÒNG ĐẦU */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {isLoading ? (
          <>
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </>
        ) : (
          <>
            {/* CARD 1: TỔNG LƯỢT ĐẶT LỚP */}
            <div
              onClick={() => handleOpenModal('TOTAL_BOOKINGS')}
              className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-indigo-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                    Tổng lượt đặt lớp
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {totalRealBookingsCount} <span className="text-xs font-normal text-slate-400">lượt</span>
                  </h3>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-xs group-hover:scale-110 transition-transform">
                  👨‍🏫
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-full border border-indigo-200/60 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600 dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-300">
                <span className="flex items-center gap-1">📊 Chi tiết theo từng tuần</span>
                <span className="group-hover:translate-x-1 transition-transform">Xem →</span>
              </div>
            </div>

            {/* CARD 2: DOANH THU HOA HỒNG 10% PLATFORM */}
            <div
              onClick={() => handleOpenModal('PLATFORM_REVENUE')}
              className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500 dark:border-emerald-800 dark:from-emerald-950/40 dark:to-teal-950/20 ring-2 ring-emerald-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold tracking-wider text-emerald-800 dark:text-emerald-300 uppercase flex items-center gap-1">
                    <span>Doanh Thu Hoa Hồng 10%</span>
                    <span className="animate-ping h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {platform10PercentCommissionCredits} <span className="text-xs font-bold">CR</span>
                  </h3>
                  <p className="text-[10px] font-mono text-emerald-700/80 dark:text-emerald-300/80 font-bold">
                    ≈ {platform10PercentCommissionVnd.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-xs group-hover:scale-110 transition-transform">
                  💰
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-full border border-emerald-300 bg-emerald-100/60 px-2.5 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                <span className="flex items-center gap-1">✨ Từ {completedBookingsList.length} ca hoàn thành</span>
                <span>Xem →</span>
              </div>
            </div>

            {/* CARD 3: MỤC TIÊU ĐỦ ĐIỀU KIỆN */}
            <div
              onClick={() => handleOpenModal('ELIGIBLE_GOALS')}
              className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-sky-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-sky-400 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                    Mục tiêu đủ điều kiện
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-sky-600 dark:text-sky-400">
                    {goalMetrics.eligibleGoals} <span className="text-xs font-normal text-slate-400">mục tiêu</span>
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500">
                    🎯 Đạt: {goalMetrics.completedGoals} ({goalMetrics.ratePercent}%)
                  </p>
                </div>
                <div className="bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-xs group-hover:scale-110 transition-transform">
                  🎯
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-full border border-sky-200/60 bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-600 dark:border-sky-800/60 dark:bg-sky-950/60 dark:text-sky-300">
                <span>📋 Chi tiết tiêu chuẩn</span>
                <span>Xem →</span>
              </div>
            </div>

            {/* CARD 4: HỒ SƠ CHỜ DUYỆT */}
            <div
              onClick={() => handleOpenModal('PENDING_TUTORS')}
              className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-amber-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                    Hồ sơ chờ duyệt
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
                    {stats?.currentSnapshot.pendingTutorApprovals || 0} <span className="text-xs font-normal text-slate-400">hồ sơ</span>
                  </h3>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-xs group-hover:scale-110 transition-transform">
                  ⏳
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300">
                <span>⏱️ Cần xử lý ngay</span>
                <span>Xem →</span>
              </div>
            </div>

            {/* CARD 5: KHIẾU NẠI MỚI */}
            <div
              onClick={() => handleOpenModal('OPEN_COMPLAINTS')}
              className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-rose-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-rose-400 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                    Khiếu nại mới
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">
                    {stats?.currentSnapshot.openComplaints || 0} <span className="text-xs font-normal text-slate-400">khiếu nại</span>
                  </h3>
                </div>
                <div className="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-xs group-hover:scale-110 transition-transform">
                  ⚠️
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-full border border-rose-200/60 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 dark:border-rose-800/60 dark:bg-rose-950/60 dark:text-rose-300">
                <span>🔔 Đang chờ giải quyết</span>
                <span>Xem →</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* KHỐI 4 THẺ TRẠNG THÁI CA HỌC & DÒNG TIỀN ESCROW */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-blue-600">🛡️</span> Phân Tích Trạng Thái Đặt Lớp & Dòng Tiền Tạm Giữ Escrow
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              💡 Bấm vào từng thẻ bên dưới để xem dữ liệu ca học thực tế đang diễn ra trên hệ thống!
            </p>
          </div>
          <div className="flex items-center gap-2">
            {realLiveCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-black animate-pulse">
                <Radio className="h-3.5 w-3.5 animate-spin" /> {realLiveCount} lớp đang diễn ra
              </span>
            )}
            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              Tổng: {totalRealBookingsCount} ca học
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* THẺ 1: CHỜ XỬ LÝ (PENDING) */}
          <div
            onClick={() => handleOpenModal('PENDING')}
            className="group cursor-pointer rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-amber-400 dark:border-amber-950 dark:from-amber-950/20 dark:to-slate-900 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  ⏳ Chờ xử lý (Pending)
                </span>
                <span className="text-xl font-black text-amber-600 font-mono">
                  {realPendingCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Học viên vừa bấm đặt, đang chờ Gia sư xác nhận nhận lớp.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-100 dark:border-amber-950 flex items-center justify-between text-[11px] font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
              <span>Xem các ca chờ xử lý</span>
              <span>→</span>
            </div>
          </div>

          {/* THẺ 2: ĐÃ XÁC NHẬN (ESCROW HOLD) */}
          <div
            onClick={() => handleOpenModal('CONFIRMED')}
            className="group cursor-pointer rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-emerald-400 dark:border-emerald-950 dark:from-emerald-950/20 dark:to-slate-900 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  🔒 Đã xác nhận (Escrow Hold)
                </span>
                <span className="text-xl font-black text-emerald-600 font-mono">
                  {realConfirmedCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Gia sư đã nhận lớp. Tiền đang được hệ thống tạm giữ Escrow an toàn.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-100 dark:border-emerald-950 flex items-center justify-between text-[11px] font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>Xem các ca đang tạm giữ tiền</span>
              <span>→</span>
            </div>
          </div>

          {/* THẺ 3: HOÀN THÀNH (COMPLETED) */}
          <div
            onClick={() => handleOpenModal('COMPLETED')}
            className="group cursor-pointer rounded-2xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/50 to-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-indigo-400 dark:border-indigo-950 dark:from-indigo-950/20 dark:to-slate-900 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  🎉 Hoàn thành (Completed)
                </span>
                <span className="text-xl font-black text-indigo-600 font-mono">
                  {realCompletedCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Ca học dạy xong: Đã giải ngân 90% cho Gia sư & thu 10% hoa hồng.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-indigo-100 dark:border-indigo-950 flex items-center justify-between text-[11px] font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>Xem các ca đã hoàn thành</span>
              <span>→</span>
            </div>
          </div>

          {/* THẺ 4: ĐÃ HỦY / TỪ CHỐI (REFUND) */}
          <div
            onClick={() => handleOpenModal('CANCELLED')}
            className="group cursor-pointer rounded-2xl border border-rose-200/80 bg-gradient-to-b from-rose-50/50 to-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-rose-400 dark:border-rose-950 dark:from-rose-950/20 dark:to-slate-900 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  🚫 Đã Hủy / Từ chối (Refund)
                </span>
                <span className="text-xl font-black text-rose-600 font-mono">
                  {realCancelledOrRejectedCount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Ca học bị hủy: Hệ thống đã hoàn tiền 100% trở lại ví của Học viên.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-rose-100 dark:border-rose-950 flex items-center justify-between text-[11px] font-bold text-rose-600 group-hover:translate-x-1 transition-transform">
              <span>Xem các ca đã hoàn tiền</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          🎯 MODAL CHI TIẾT CA HỌC & GIÁM SÁT PHÒNG HỌC GOOGLE MEET
      ========================================================================= */}
      {selectedStatusType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedStatusType === 'TOTAL_BOOKINGS' && '📊 Danh Sách Toàn Bộ Ca Học Hệ Thống & Giám Sát Meet'}
                  {selectedStatusType === 'PLATFORM_REVENUE' && '💰 Doanh Thu Thu Phí Sàn 10% Nền Tảng GiaSưConnect'}
                  {selectedStatusType === 'ELIGIBLE_GOALS' && '🎯 Chi Tiết Tiêu Chuẩn Mục Tiêu Đủ Điều Kiện'}
                  {selectedStatusType === 'PENDING_TUTORS' && '👨‍🏫 Danh Sách Hồ Sơ Gia Sư Đang Chờ Phê Duyệt'}
                  {selectedStatusType === 'OPEN_COMPLAINTS' && '🚨 Danh Sách Khiếu Nại Mới Đang Mở'}
                  {selectedStatusType === 'CONFIRMED' && '🔒 Danh Sách Ca Học Đã Xác Nhận (Đang Tạm Giữ Escrow & Phòng Meet)'}
                  {selectedStatusType === 'CANCELLED' && '🚫 Danh Sách Ca Học Đã Hủy / Từ Chối (Đã Hoàn 100% Tiền)'}
                  {selectedStatusType === 'COMPLETED' && '🎉 Danh Sách Ca Học Đã Hoàn Thành (Giải Ngân 90%)'}
                  {selectedStatusType === 'PENDING' && '⏳ Danh Sách Ca Học Đang Chờ Xử Lý'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Admin có quyền giám sát, theo dõi link Google Meet và tham gia dự giờ trực tiếp vào các ca học đang diễn ra.
                </p>
              </div>

              <button
                onClick={() => setSelectedStatusType(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Thẻ 2: Doanh Thu Hoa Hồng 10% */}
            {selectedStatusType === 'PLATFORM_REVENUE' && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 p-4 border border-emerald-200 dark:border-emerald-800">
                  <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-slate-800">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase block">Tổng Ca Học Hoàn Thành</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">{completedBookingsList.length} ca</span>
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-slate-800">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase block">Tổng Học Phí Luân Chuyển</span>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{totalCompletedCreditsSum} CR</span>
                    <span className="block text-[10px] font-mono text-slate-500">≈ {(totalCompletedCreditsSum * 1000).toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="rounded-xl bg-emerald-100/80 p-3 shadow-xs dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                    <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase block">Doanh Thu 10% Admin</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{platform10PercentCommissionCredits} CR</span>
                    <span className="block text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">≈ {platform10PercentCommissionVnd.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                        <th className="py-3 px-4 font-semibold">Mã Ca Học</th>
                        <th className="py-3 px-4 font-semibold">Học Viên & Gia Sư</th>
                        <th className="py-3 px-4 font-semibold">Môn Học</th>
                        <th className="py-3 px-4 font-semibold text-right">Tổng Học Phí</th>
                        <th className="py-3 px-4 font-semibold text-right text-emerald-600">Hoa Hồng 10% Admin</th>
                        <th className="py-3 px-4 font-semibold text-right text-indigo-600">Thực Nhận 90% Gia Sư</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {completedBookingsList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                            Chưa có ca học hoàn thành nào ghi nhận hoa hồng 10%.
                          </td>
                        </tr>
                      ) : (
                        completedBookingsList.map((item) => {
                          const fee10 = Math.round(item.creditCost * 0.1)
                          const tutor90 = item.creditCost - fee10
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                                #{item.id}
                                <span className="block text-[10px] text-slate-400 font-normal">{formatUtcTime(item.startTimeUtc)}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-800 dark:text-slate-200">🎓 HV: {item.studentName}</div>
                                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">👨‍🏫 GS: {item.tutorName}</div>
                              </td>
                              <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                                {item.subjectName}
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">
                                {item.creditCost} CR
                              </td>
                              <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                +{fee10} CR
                                <span className="block text-[10px] font-normal text-emerald-600/80">{(fee10 * 1000).toLocaleString('vi-VN')}đ</span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                                {tutor90} CR
                                <span className="block text-[10px] font-normal text-slate-400">{(tutor90 * 1000).toLocaleString('vi-VN')}đ</span>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Thẻ 3: Mục Tiêu Đủ Điều Kiện */}
            {selectedStatusType === 'ELIGIBLE_GOALS' && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 p-4 border border-sky-200 dark:border-sky-800">
                  <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-slate-800">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase block">Mục Tiêu Đủ Điều Kiện</span>
                    <span className="text-xl font-black text-sky-600 dark:text-sky-400">{goalMetrics.eligibleGoals} mục tiêu</span>
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-xs dark:bg-slate-800">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase block">Mục Tiêu Đã Hoàn Thành</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{goalMetrics.completedGoals} mục tiêu</span>
                  </div>
                  <div className="rounded-xl bg-sky-100/80 p-3 shadow-xs dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800">
                    <span className="text-[11px] font-extrabold text-sky-800 dark:text-sky-300 uppercase block">Tỷ Lệ Đạt Tiêu Chuẩn</span>
                    <span className="text-xl font-black text-sky-600 dark:text-sky-400">{goalMetrics.ratePercent}%</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>🎯</span> Tiêu chuẩn đánh giá Mục Tiêu Đủ Điều Kiện (Eligible Learning Goals):
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Hồ sơ Gia sư đã xác thực:</strong> Đã kiểm duyệt bằng cấp, bằng đại học và chứng chỉ giảng dạy.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Đúng môn học & Khung giờ:</strong> Khớp nhu cầu Học viên và lịch rảnh của Gia sư.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Đảm bảo dòng tiền Escrow:</strong> Số dư ví đủ chi trả học phí ca học an toàn.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Modal Thẻ 4: Hồ Sơ Chờ Duyệt */}
            {selectedStatusType === 'PENDING_TUTORS' && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between bg-amber-50 p-3.5 rounded-2xl border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    📋 Hiện có {stats?.currentSnapshot.pendingTutorApprovals || pendingTutors.length} hồ sơ Gia sư đang chờ Admin kiểm duyệt.
                  </span>
                  <Button
                    onClick={() => {
                      setSelectedStatusType(null)
                      navigate('/admin/tutor-applications')
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs cursor-pointer"
                  >
                    <span>Mở trang duyệt hồ sơ</span>
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {isLoadingPendingTutors ? (
                    <div className="flex items-center justify-center py-10 text-xs font-bold text-slate-400">
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin text-amber-600" />
                      Đang tải danh sách hồ sơ gia sư...
                    </div>
                  ) : pendingTutors.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-medium">
                      Không có hồ sơ Gia sư nào đang chờ duyệt.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                          <th className="py-3 px-4 font-semibold">Họ & Tên Gia Sư</th>
                          <th className="py-3 px-4 font-semibold">Trình Độ</th>
                          <th className="py-3 px-4 font-semibold">Kinh Nghiệm</th>
                          <th className="py-3 px-4 font-semibold">Môn Đăng Ký</th>
                          <th className="py-3 px-4 font-semibold">Ngày Gửi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {pendingTutors.map((tutor) => (
                          <tr key={tutor.id} className="hover:bg-amber-50/40 transition">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                              👨‍🏫 {tutor.fullName}
                              <span className="block text-[10px] text-slate-400 font-normal">{tutor.email}</span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-indigo-600">{tutor.qualification}</td>
                            <td className="py-3 px-4 font-mono">{tutor.experienceYears} năm</td>
                            <td className="py-3 px-4">
                              {tutor.subjects.map((s, i) => (
                                <span key={i} className="inline-block bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px] mr-1 font-bold text-slate-700 dark:text-slate-300">
                                  {s}
                                </span>
                              ))}
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-mono">{formatUtcTime(tutor.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Modal Thẻ 5: Khiếu Nại Mới */}
            {selectedStatusType === 'OPEN_COMPLAINTS' && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between bg-rose-50 p-3.5 rounded-2xl border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                    ⚠️ Có {stats?.currentSnapshot.openComplaints || openComplaintsList.length} khiếu nại mới đang chờ giải quyết.
                  </span>
                  <Button
                    onClick={() => {
                      setSelectedStatusType(null)
                      navigate('/admin/complaints')
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs cursor-pointer"
                  >
                    <span>Mở trang xử lý khiếu nại</span>
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {isLoadingComplaints ? (
                    <div className="flex items-center justify-center py-10 text-xs font-bold text-slate-400">
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin text-rose-600" />
                      Đang tải danh sách khiếu nại...
                    </div>
                  ) : openComplaintsList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-medium">
                      Hiện tại không có khiếu nại mới nào.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                          <th className="py-3 px-4 font-semibold">Người Khiếu Nại</th>
                          <th className="py-3 px-4 font-semibold">Đối Tượng Bị Khiếu Nại</th>
                          <th className="py-3 px-4 font-semibold">Nội Dung</th>
                          <th className="py-3 px-4 font-semibold">Thời Gian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {openComplaintsList.map((c) => (
                          <tr key={c.id} className="hover:bg-rose-50/40 transition">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                              👤 {c.complainantName}
                              <span className="block text-[10px] text-rose-500 font-semibold">({c.complainantRole === 'tutor' ? 'Gia sư' : 'Học viên'})</span>
                            </td>
                            <td className="py-3 px-4 font-bold text-indigo-600">🎯 {c.targetName}</td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">{c.content}</td>
                            <td className="py-3 px-4 text-slate-400 font-mono">{formatUtcTime(c.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* BẢNG TỔNG QUÁT CA HỌC & CỘT GIÁM SÁT PHÒNG GOOGLE MEET */}
            {selectedStatusType !== 'PLATFORM_REVENUE' &&
              selectedStatusType !== 'ELIGIBLE_GOALS' &&
              selectedStatusType !== 'PENDING_TUTORS' &&
              selectedStatusType !== 'OPEN_COMPLAINTS' && (
                <div className="mt-4 space-y-3">
                  {/* BỘ LỌC CHỌN TUẦN & NÚT LỌC CA ĐANG DIỄN RA LIVE */}
                  <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                      🗓️ Bộ lọc:
                    </span>
                    <button
                      onClick={() => setSelectedWeekKey('ALL')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        selectedWeekKey === 'ALL'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      🌟 Tất cả các tuần ({realBookings.length} ca)
                    </button>

                    <button
                      onClick={() => setSelectedWeekKey('LIVE_NOW')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedWeekKey === 'LIVE_NOW'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900'
                      }`}
                    >
                      <Radio className="h-3.5 w-3.5 animate-pulse" />
                      <span>🔴 Đang diễn ra ({realBookings.filter((b) => b.isHappeningNow).length} ca)</span>
                    </button>

                    {uniqueWeeks.map((weekLabel) => {
                      const countInWeek = realBookings.filter((b) => getWeekKey(b.startTimeUtc) === weekLabel).length
                      return (
                        <button
                          key={weekLabel}
                          onClick={() => setSelectedWeekKey(weekLabel)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            selectedWeekKey === weekLabel
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          📅 Tuần {weekLabel} ({countInWeek} ca)
                        </button>
                      )
                    })}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {isLoadingBookings ? (
                      <div className="flex items-center justify-center py-12 text-xs font-bold text-slate-400">
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin text-indigo-600" />
                        Đang tải danh sách ca học thực tế...
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                            <th className="py-3 px-4 font-semibold">Mã Ca Học</th>
                            <th className="py-3 px-4 font-semibold">Học Viên & Gia Sư</th>
                            <th className="py-3 px-4 font-semibold">Môn Học</th>
                            <th className="py-3 px-4 font-semibold text-right">Học Phí</th>
                            <th className="py-3 px-4 font-semibold">Trạng Thái</th>
                            <th className="py-3 px-4 font-semibold text-center">Phòng Google Meet (Giám Sát)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredBookingsForModal.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                                Không có dữ liệu ca học phù hợp với bộ lọc này.
                              </td>
                            </tr>
                          ) : (
                            filteredBookingsForModal.map((item) => {
                              const isCancelledOrRejected =
                                item.status === 'Học viên đã hủy' ||
                                item.status === 'Gia sư từ chối' ||
                                item.status.toLowerCase().includes('hủy') ||
                                item.status.toLowerCase().includes('từ chối')

                              const isCompleted = item.status === 'Đã hoàn thành'

                              return (
                                <tr
                                  key={item.id}
                                  className={`transition ${
                                    item.isHappeningNow
                                      ? 'bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50/70'
                                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                                  }`}
                                >
                                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                                    <div className="flex items-center gap-1.5">
                                      <span>#{item.id}</span>
                                      {item.isHappeningNow && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black animate-pulse">
                                          <Radio className="h-2.5 w-2.5 animate-spin" /> LIVE
                                        </span>
                                      )}
                                    </div>
                                    <span className="block text-[10px] text-slate-400 font-normal">{formatUtcTime(item.startTimeUtc)}</span>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="font-bold text-slate-800 dark:text-slate-200">🎓 HV: {item.studentName}</div>
                                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">👨‍🏫 GS: {item.tutorName}</div>
                                  </td>
                                  <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                                    {item.subjectName}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-black text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                                    {item.creditCost} CR
                                    <span className="block text-[10px] font-normal text-slate-400">
                                      {(item.creditCost * 1000).toLocaleString('vi-VN')} đ
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="rounded-xl bg-slate-50 p-2 border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700/60 text-[11px] leading-relaxed font-medium">
                                      <div className="font-bold flex items-center gap-1.5">
                                        {item.status === 'Học viên đã hủy' && (
                                          <span className="inline-block rounded-md bg-rose-100 px-2.5 py-1 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold">
                                            🚫 Học viên đã hủy
                                          </span>
                                        )}
                                        {item.status === 'Gia sư từ chối' && (
                                          <span className="inline-block rounded-md bg-amber-100 px-2.5 py-1 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-bold">
                                            ⚠️ Gia sư từ chối
                                          </span>
                                        )}
                                        {item.status === 'Đã hoàn thành' && (
                                          <span className="inline-block rounded-md bg-indigo-100 px-2.5 py-1 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold">
                                            🎉 Đã hoàn thành
                                          </span>
                                        )}
                                        {item.status === 'Đã xác nhận' && (
                                          <span className="inline-block rounded-md bg-emerald-100 px-2.5 py-1 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                                            🔒 Đã xác nhận
                                          </span>
                                        )}
                                        {item.status === 'Chờ xác nhận' && (
                                          <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold">
                                            ⏳ Chờ xác nhận
                                          </span>
                                        )}
                                        {!['Học viên đã hủy', 'Gia sư từ chối', 'Đã hoàn thành', 'Đã xác nhận', 'Chờ xác nhận'].includes(item.status) && item.status}
                                      </div>

                                      {item.statusReason && (
                                        <span className="block mt-1.5 text-rose-500 font-semibold italic">
                                          📌 Lý do: {item.statusReason}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* 🎯 CỘT LINK PHÒNG GOOGLE MEET: NẾU ĐÃ HỦY THÌ ẨN LINK HOÀN TOÀN, KHÔNG BẤM ĐƯỢC */}
                                  <td className="py-3.5 px-4 text-center">
                                    {isCancelledOrRejected ? (
                                      <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-[11px] font-bold text-slate-400 select-none border border-slate-200/60 dark:border-slate-700/60 cursor-not-allowed">
                                        🚫 Đã hủy phòng
                                      </span>
                                    ) : isCompleted ? (
                                      <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 text-[11px] font-semibold text-slate-400 select-none">
                                        ✓ Đã kết thúc ca
                                      </span>
                                    ) : item.meetingUrl ? (
                                      <div className="flex flex-col items-center gap-1">
                                        <a
                                          href={item.meetingUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition cursor-pointer ${
                                            item.isHappeningNow
                                              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-md shadow-red-500/30 animate-pulse'
                                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                                          }`}
                                          title="Bấm để mở Google Meet và tham gia cùng lớp học"
                                        >
                                          <Video className="h-3.5 w-3.5" />
                                          <span>{item.isHappeningNow ? 'Vào Dự Giờ Ngay' : 'Vào Giám Sát'}</span>
                                          <ExternalLink className="h-3 w-3 opacity-70" />
                                        </a>
                                        <span
                                          className="text-[9px] text-slate-400 font-mono truncate max-w-[120px]"
                                          title={item.meetingUrl}
                                        >
                                          {item.meetingUrl.replace('https://', '')}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 text-[10px] italic">
                                        {item.status === 'Chờ xác nhận' ? 'Chờ GS tạo Meet' : 'Chưa có Meet'}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

            {/* Footer Modal */}
            <div className="mt-5 border-t border-slate-100 pt-3 flex justify-end dark:border-slate-800">
              <Button
                onClick={() => setSelectedStatusType(null)}
                className="bg-slate-900 text-white dark:bg-slate-800 font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
              >
                Đóng Cửa Sổ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
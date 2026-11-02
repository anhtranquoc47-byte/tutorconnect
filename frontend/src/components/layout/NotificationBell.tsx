import { useState, useEffect, useRef } from 'react'
import {
  Bell,
  Check,
  Trash2,
  Calendar,
  Star,
  DollarSign,
  CheckCircle2,
  X,
  AlertTriangle,
  XCircle,
  CreditCard,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/auth.store'
import { studentApi } from '@/features/student/api/studentApi'
import { bookingApi } from '@/apis/fe2/booking.api'
import { adminApi } from '@/features/admin/admin.api'
import { tutorProfileApi } from '@/apis/fe2/tutorProfile.api'
import { useNavigate } from 'react-router-dom'
import { http } from '@/lib/api/http'

export interface AppNotification {
  id: string
  title: string
  message: string
  time: string
  type: 'booking' | 'review' | 'credit' | 'status'
  read: boolean
  link: string
}

// 1. Hàm lưu cố định thời điểm nổ thông báo
function getOrSetNotifCreatedAt(id: string): string {
  const key = `notif_created_at_${id}`
  const saved = localStorage.getItem(key)

  if (saved) {
    const parts = saved.split(' ')
    if (parts.length === 2 && parts[0] && parts[1]) {
      const timePart = parts[0]
      const datePart = parts[1]
      const dateSubParts = datePart.split('/')
      if (dateSubParts.length === 3 && dateSubParts[0] && dateSubParts[1] && dateSubParts[2]) {
        const d = dateSubParts[0]
        const m = dateSubParts[1]
        const y = dateSubParts[2]
        const savedDate = new Date(`${y}-${m}-${d}T${timePart}:00`)
        if (!isNaN(savedDate.getTime()) && savedDate.getTime() > Date.now() + 5 * 60 * 1000) {
          localStorage.removeItem(key)
        } else {
          return saved
        }
      }
    } else {
      return saved
    }
  }

  const now = new Date()
  const timeStr = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  const dateStr = now.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  })

  const createdTime = `${timeStr} ${dateStr}`
  localStorage.setItem(key, createdTime)
  return createdTime
}

// 2. Chuyển chuỗi thời gian thành miligiây để sắp xếp
function parseNotifTime(timeStr: string): number {
  if (!timeStr) return 0
  try {
    const clean = timeStr.replace(',', '').trim()
    const tokens = clean.split(' ')

    let timePart = '00:00'
    let datePart = ''

    tokens.forEach((tok) => {
      if (tok.includes(':')) timePart = tok
      else if (tok.includes('/')) datePart = tok
    })

    if (datePart) {
      const dParts = datePart.split('/')
      if (dParts.length === 3) {
        const day = Number(dParts[0])
        const month = Number(dParts[1]) - 1
        const year = Number(dParts[2])

        const tParts = timePart.split(':')
        const h = Number(tParts[0] || 0)
        const m = Number(tParts[1] || 0)

        const parsedDate = new Date(year, month, day, h, m)
        return isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime()
      }
    }
    return 0
  } catch {
    return 0
  }
}

// 3. Format thời gian
function formatNotifTime(isoString?: string): string {
  if (!isoString) {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' })
    const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })
    return `${timeStr} ${dateStr}`
  }
  try {
    if (/^\d{2}:\d{2} \d{2}\/\d{2}\/\d{4}$/.test(isoString)) {
      return isoString
    }
    if (isoString.includes('/') && isoString.includes(':')) {
      const clean = isoString.replace(',', '').trim()
      const tokens = clean.split(' ')
      let timePart = ''
      let datePart = ''
      tokens.forEach((t) => {
        if (t.includes(':')) timePart = t
        if (t.includes('/')) datePart = t
      })
      if (timePart && datePart) {
        return `${timePart} ${datePart}`
      }
    }
    const utcStr = isoString.endsWith('Z') || isoString.includes('+') ? isoString : `${isoString}Z`
    const d = new Date(utcStr)
    if (isNaN(d.getTime())) return isoString

    const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' })
    const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' })
    return `${timeStr} ${dateStr}`
  } catch {
    return isoString
  }
}

export function NotificationBell() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  const storageKey = user ? `read_notifications_${user.id}` : 'read_notifications_guest'
  const dismissedStorageKey = user ? `dismissed_notifications_${user.id}` : 'dismissed_notifications_guest'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!user) return

    async function loadNotifications() {
      if (!user) return
      const currentUserId = String(user.id)
      const currentUserEmail = user.email || ''
      const userRole = String(user.role || '').toLowerCase().trim()

      try {
        const savedReadIds: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]')
        const savedDismissedIds: string[] = JSON.parse(localStorage.getItem(dismissedStorageKey) || '[]')
        const notifList: AppNotification[] = []

        if (userRole === 'student' || userRole === '3') {
          const bookings: any = await studentApi.getBookings()
          const list = Array.isArray(bookings) ? bookings : bookings?.data || []

          list.forEach((b: any) => {
            const dateStr = b.startTimeUtc
              ? new Date(b.startTimeUtc).toISOString().slice(0, 10).replace(/-/g, '')
              : '20261025'
            const formatCode = `BK-${dateStr}-${b.id}`
            const st = String(b.status).toLowerCase().trim()

            const getNotifTime = (id: string) =>
              b.createdAtUtc || b.createdAt
                ? formatNotifTime(b.createdAtUtc || b.createdAt)
                : getOrSetNotifCreatedAt(id)

            // 1. Học viên vừa đặt lịch
            if (st === 'pending' || st === '1') {
              const id = `st-pend-${b.id}`
              if (!savedDismissedIds.includes(id)) {
                notifList.push({
                  id,
                  title: '⏳ Đặt lịch ca học thành công',
                  message: `Bạn vừa đặt thành công ca học ${formatCode}. Đang chờ Gia sư xác nhận!`,
                  time: getNotifTime(id),
                  type: 'booking',
                  read: savedReadIds.includes(id),
                  link: `/student/schedule/${b.id}`,
                })
              }
            }

            // 2. Gia sư chấp nhận
            if (st === 'confirmed' || st === '2') {
              const id = `st-conf-${b.id}`
              if (!savedDismissedIds.includes(id)) {
                notifList.push({
                  id,
                  title: '✅ Gia sư đã chấp nhận ca học',
                  message: `Gia sư đã nhận lớp cho ca ${formatCode}. Bấm vào để xem thông tin phòng học!`,
                  time: getNotifTime(id),
                  type: 'status',
                  read: savedReadIds.includes(id),
                  link: `/student/schedule/${b.id}`,
                })
              }
            }

            // 3. Gia sư từ chối
            if (st === 'rejected' || st === '3') {
              const id = `st-rej-${b.id}`
              if (!savedDismissedIds.includes(id)) {
                notifList.push({
                  id,
                  title: '⚠️ Gia sư từ chối ca học',
                  message: `Gia sư đã từ chối nhận ca học ${formatCode}. Tiền đã được hoàn lại 100% về ví!`,
                  time: getNotifTime(id),
                  type: 'credit',
                  read: savedReadIds.includes(id),
                  link: `/student/schedule/${b.id}`,
                })
              }
            }

            // 4. Ca học bị hủy
            if (st === 'cancelled' || st === '4') {
              const id = `st-canc-${b.id}`
              if (!savedDismissedIds.includes(id)) {
                notifList.push({
                  id,
                  title: '🚫 Ca học đã bị hủy',
                  message: `Ca học ${formatCode} đã bị hủy. Bấm để xem thông tin chi tiết hoàn tiền.`,
                  time: getNotifTime(id),
                  type: 'credit',
                  read: savedReadIds.includes(id),
                  link: `/student/schedule/${b.id}`,
                })
              }
            }

            // 5. Ca học hoàn thành
            if (st === 'completed' || st === '5') {
              const id = `st-comp-${b.id}`
              if (!savedDismissedIds.includes(id)) {
                notifList.push({
                  id,
                  title: '🎓 Ca học đã hoàn thành',
                  message: `Ca học ${formatCode} đã hoàn thành. Bấm để xem nhận xét của Gia sư!`,
                  time: getNotifTime(id),
                  type: 'review',
                  read: savedReadIds.includes(id),
                  link: `/student/schedule/${b.id}`,
                })
              }
            }
          })

          // Cảnh báo rủi ro Học viên
          try {
            const riskItems = await adminApi.getRiskWatchlist()
            if (Array.isArray(riskItems)) {
              riskItems.forEach((r) => {
                if (String(r.userId) === currentUserId || (currentUserEmail && r.userEmail === currentUserEmail)) {
                  const id = `user-risk-${r.id}`
                  if (!savedDismissedIds.includes(id)) {
                    const violText = r.violations ? r.violations.map((v) => v.label).join(', ') : 'Hành vi bất thường'
                    notifList.push({
                      id,
                      title: '⚠️ Cảnh báo tài khoản',
                      message: `Hệ thống ghi nhận dấu hiệu vi phạm: ${violText}. Vui lòng tuân thủ quy định!`,
                      time: formatNotifTime(r.detectedAt),
                      type: 'status',
                      read: savedReadIds.includes(id),
                      link: '/student/profile',
                    })
                  }
                }
              })
            }
          } catch {}

        } else if (userRole === 'tutor' || userRole === '2') {
          const bookings: any = await bookingApi.getMyBookings()
          const list = Array.isArray(bookings) ? bookings : bookings?.data || []

          try {
            const myProf = await tutorProfileApi.getMyProfile()
            const appSt = String(myProf?.approvalStatus || '').toLowerCase()

            if (appSt === 'approved' || appSt === '3') {
              const id = `tu-appr-${currentUserId}`
              if (!savedDismissedIds.includes(id)) {
                notifList.push({
                  id,
                  title: '🎉 Hồ sơ gia sư đã được phê duyệt!',
                  message: 'Chúc mừng bạn! Quản trị viên đã duyệt hồ sơ giảng dạy. Giờ đây bạn đã có thể bắt đầu nhận học viên trên hệ thống.',
                  time: getOrSetNotifCreatedAt(id),
                  type: 'status',
                  read: savedReadIds.includes(id),
                  link: '/tutor/profile',
                })
              }
            }

            if (appSt === 'rejected' || appSt === '4') {
              const id = `tu-rejt-${currentUserId}`
              if (!savedDismissedIds.includes(id)) {
                notifList.push({
                  id,
                  title: '❌ Hồ sơ gia sư bị từ chối xét duyệt',
                  message: myProf.reviewNote
                    ? `Lý do từ Admin: "${myProf.reviewNote}". Vui lòng cập nhật lại thông tin.`
                    : 'Hồ sơ chưa đạt yêu cầu kiểm định. Vui lòng kiểm tra lại thông tin và nộp lại.',
                  time: getOrSetNotifCreatedAt(id),
                  type: 'status',
                  read: savedReadIds.includes(id),
                  link: '/tutor/profile',
                })
              }
            }
          } catch {}

          list.forEach((b: any) => {
            const bTutorId = String(b.tutorId || b.tutor?.id || b.tutorSubject?.tutorId || '')
            if (bTutorId && bTutorId !== currentUserId) return

            const dateStr = b.startTimeUtc
              ? new Date(b.startTimeUtc).toISOString().slice(0, 10).replace(/-/g, '')
              : '20261025'
            const formatCode = `BK-${dateStr}-${b.id}`
            const st = String(b.status).toLowerCase().trim()

            const getNotifTime = (id: string) =>
              b.createdAtUtc || b.createdAt
                ? formatNotifTime(b.createdAtUtc || b.createdAt)
                : getOrSetNotifCreatedAt(id)

            if (st === 'pending' || st === '1') {
              const id = `tu-pend-${b.id}`
              if (!savedDismissedIds.includes(id)) {
                notifList.push({
                  id,
                  title: '📅 Yêu cầu đặt lịch mới',
                  message: `Học viên vừa đặt ca học ${formatCode}. Bấm để xem chi tiết & nhận lớp!`,
                  time: getNotifTime(id),
                  type: 'booking',
                  read: savedReadIds.includes(id),
                  link: `/tutor/timetable`,
                })
              }
            }

            if (st === 'confirmed' || st === '2') {
              const id = `tu-conf-${b.id}`
              if (!savedDismissedIds.includes(id)) {
                notifList.push({
                  id,
                  title: '🔒 Ca học đã được xác nhận',
                  message: `Bạn đã nhận ca học ${formatCode}. Tiền đang tạm giữ Escrow an toàn.`,
                  time: getNotifTime(id),
                  type: 'status',
                  read: savedReadIds.includes(id),
                  link: `/tutor/timetable`,
                })
              }
            }

            if (st === 'rejected' || st === '3') {
              const id = `tu-rej-${b.id}`
              if (!savedDismissedIds.includes(id)) {
                notifList.push({
                  id,
                  title: '⚠️ Ca học đã bị hủy (Bạn từ chối)',
                  message: `Bạn đã hủy/từ chối nhận ca học ${formatCode}.`,
                  time: getNotifTime(id),
                  type: 'status',
                  read: savedReadIds.includes(id),
                  link: `/tutor/timetable`,
                })
              }
            }

            if (st === 'cancelled' || st === '4') {
              const id = `tu-canc-${b.id}`
              if (!savedDismissedIds.includes(id)) {
                notifList.push({
                  id,
                  title: '🚫 Ca học đã bị hủy bởi Học viên',
                  message: `Ca học ${formatCode} đã bị hủy bởi Học viên.`,
                  time: getNotifTime(id),
                  type: 'status',
                  read: savedReadIds.includes(id),
                  link: `/tutor/timetable`,
                })
              }
            }

            if (st === 'completed' || st === '5') {
              const netPayout = Math.round((b.creditCost || 80) * 0.9)
              const id = `tu-earn-${b.id}`
              if (!savedDismissedIds.includes(id)) {
                notifList.push({
                  id,
                  title: '💰 Cộng thù lao ca học (+90% CR)',
                  message: `Bạn vừa nhận được +${netPayout} CR (đã trừ 10% phí nền tảng) từ ca học ${formatCode}!`,
                  time: getNotifTime(id),
                  type: 'credit',
                  read: savedReadIds.includes(id),
                  link: `/tutor/timetable`,
                })
              }
            }

            if ((st === 'completed' || st === '5') && (b.studentRating || b.studentReviewComment)) {
              const id = `tu-rev-${b.id}`
              if (!savedDismissedIds.includes(id)) {
                notifList.push({
                  id,
                  title: '⭐ Học viên vừa đánh giá bạn',
                  message: `Học viên ca ${formatCode} vừa gửi đánh giá (${b.studentRating || 5}⭐): "${b.studentReviewComment || 'Rất tốt'}".`,
                  time: getNotifTime(id),
                  type: 'review',
                  read: savedReadIds.includes(id),
                  link: `/tutor/timetable`,
                })
              }
            }
          })

        } else if (userRole === 'admin' || userRole === '1') {
          // =========================================================================
          // 🛡️ DÀNH RIÊNG CHO QUẢN TRỊ VIÊN (ADMIN) - BẮT TRỌN VẸN MỌI SỰ KIỆN HỆ THỐNG
          // =========================================================================

          // 1. TẤT CẢ BIẾN ĐỘNG CA HỌC TỪ HỌC VIÊN & GIA SƯ
          try {
            const res = await http.get<any>('/api/v1/bookings')
            const rawData = res.data
            const list = Array.isArray(rawData)
              ? rawData
              : rawData?.data || rawData?.$values || []

            list.forEach((b: any) => {
              const dateStr = b.startTimeUtc
                ? new Date(b.startTimeUtc).toISOString().slice(0, 10).replace(/-/g, '')
                : '20261025'
              const formatCode = `BK-${dateStr}-${b.id}`
              const st = String(b.status).toLowerCase().trim()

              const studentName =
                b.studentName ||
                b.student?.fullName ||
                b.student?.user?.fullName ||
                b.studentUser?.fullName ||
                `Học viên #${b.studentId || ''}`

              const tutorName =
                b.tutorName ||
                b.tutor?.fullName ||
                b.tutorSubject?.tutor?.fullName ||
                b.tutorSubject?.tutor?.user?.fullName ||
                `Gia sư #${b.tutorId || ''}`

              const subjectName =
                b.subjectName ||
                b.subject?.name ||
                b.tutorSubject?.subject?.name ||
                'Môn học'

              const getNotifTime = (id: string) =>
                b.updatedAtUtc || b.updatedAt || b.createdAtUtc || b.createdAt
                  ? formatNotifTime(b.updatedAtUtc || b.updatedAt || b.createdAtUtc || b.createdAt)
                  : getOrSetNotifCreatedAt(id)

              // 1.1. 🚫 HỌC VIÊN HỦY BUỔI HỌC ĐỘT XUẤT (Cancelled = 4)
              if (st === 'cancelled' || st === '4') {
                const id = `adm-bk-canc-${b.id}`
                if (!savedDismissedIds.includes(id)) {
                  const reason = b.cancelReason || b.cancellationReason || 'Lý do đột xuất'
                  notifList.push({
                    id,
                    title: `🚫 [Học Viên Hủy Đột Xuất] ${formatCode}`,
                    message: `${studentName} đã hủy ca học môn ${subjectName} (Gia sư: ${tutorName}). Lý do: "${reason}". Hệ thống đã tự động hoàn 100% học phí về ví.`,
                    time: getNotifTime(id),
                    type: 'credit',
                    read: savedReadIds.includes(id),
                    link: '/admin/dashboard',
                  })
                }
              }

              // 1.2. 📅 HỌC VIÊN BOOK LỊCH MỚI (Pending = 1)
              if (st === 'pending' || st === '1') {
                const id = `adm-bk-pend-${b.id}`
                if (!savedDismissedIds.includes(id)) {
                  notifList.push({
                    id,
                    title: `📅 [Đặt Lịch Mới] ${formatCode}`,
                    message: `${studentName} vừa đặt lịch mới môn ${subjectName} với Gia sư ${tutorName}. Đang chờ Gia sư xác nhận.`,
                    time: getNotifTime(id),
                    type: 'booking',
                    read: savedReadIds.includes(id),
                    link: '/admin/dashboard',
                  })
                }
              }

              // 1.3. 🔒 GIA SƯ XÁC NHẬN NHẬN LỚP (Confirmed = 2)
              if (st === 'confirmed' || st === '2') {
                const id = `adm-bk-conf-${b.id}`
                if (!savedDismissedIds.includes(id)) {
                  notifList.push({
                    id,
                    title: `🔒 [Gia Sư Nhận Lớp] ${formatCode}`,
                    message: `Gia sư ${tutorName} đã nhận ca học môn ${subjectName} của ${studentName}. Tiền học phí đang tạm giữ Escrow an toàn.`,
                    time: getNotifTime(id),
                    type: 'status',
                    read: savedReadIds.includes(id),
                    link: '/admin/dashboard',
                  })
                }
              }

              // 1.4. ⚠️ GIA SƯ TỪ CHỐI NHẬN LỚP (Rejected = 3)
              if (st === 'rejected' || st === '3') {
                const id = `adm-bk-rej-${b.id}`
                if (!savedDismissedIds.includes(id)) {
                  notifList.push({
                    id,
                    title: `⚠️ [Gia Sư Từ Chối Lớp] ${formatCode}`,
                    message: `Gia sư ${tutorName} đã từ chối nhận ca học ${formatCode}. Tiền đã hoàn 100% lại cho ${studentName}.`,
                    time: getNotifTime(id),
                    type: 'credit',
                    read: savedReadIds.includes(id),
                    link: '/admin/dashboard',
                  })
                }
              }

              // 1.5. 🎓 CA HỌC ĐÃ HOÀN THÀNH (Completed = 5)
              if (st === 'completed' || st === '5') {
                const id = `adm-bk-comp-${b.id}`
                if (!savedDismissedIds.includes(id)) {
                  const cost = Number(b.creditCost || 80)
                  const comm = Math.round(cost * 1000 * 0.1)
                  notifList.push({
                    id,
                    title: `🎓 [Ca Học Hoàn Thành] ${formatCode}`,
                    message: `Ca học môn ${subjectName} (${studentName} & ${tutorName}) đã hoàn thành. Hệ thống thu +${comm.toLocaleString('vi-VN')}đ (10% phí sàn).`,
                    time: getNotifTime(id),
                    type: 'credit',
                    read: savedReadIds.includes(id),
                    link: '/admin/dashboard',
                  })
                }
              }
            })
          } catch (e) {
            console.error('Lỗi lấy bookings cho admin notif:', e)
          }

          // 2. YÊU CẦU NẠP CREDIT CỦA HỌC VIÊN CẦN ADMIN DUYỆT
          try {
            const savedTopupStr = localStorage.getItem('system_credit_topup_requests')
            if (savedTopupStr) {
              const topups = JSON.parse(savedTopupStr)
              if (Array.isArray(topups)) {
                topups.forEach((t: any) => {
                  if (t.status === 'PENDING') {
                    const id = `adm-topup-${t.id}`
                    if (!savedDismissedIds.includes(id)) {
                      notifList.push({
                        id,
                        title: '💳 [Yêu Cầu Nạp Credit] Chờ Duyệt',
                        message: `Học viên ${t.studentName} đã gửi ảnh bill CK nạp +${t.amountCredit} CR (${(t.amountVnd || 0).toLocaleString('vi-VN')}đ). Mã: ${t.referenceCode}. Vui lòng kiểm tra bill để duyệt!`,
                        time: formatNotifTime(t.createdAt),
                        type: 'credit',
                        read: savedReadIds.includes(id),
                        link: '/admin/dashboard',
                      })
                    }
                  }
                })
              }
            }
          } catch {}

          // 3. YÊU CẦU CHUYỂN KHOẢN 90% THÙ LAO TỪ GIA SƯ
          try {
            const savedPayoutStr = localStorage.getItem('tutor_session_payout_requests')
            if (savedPayoutStr) {
              const payouts = JSON.parse(savedPayoutStr)
              if (Array.isArray(payouts)) {
                payouts.forEach((p: any) => {
                  if (p.status === 'PENDING') {
                    const id = `adm-payout-${p.id}`
                    if (!savedDismissedIds.includes(id)) {
                      notifList.push({
                        id,
                        title: '💸 [Yêu Cầu CK 90%] Gia Sư Chờ Tiền',
                        message: `Gia sư ${p.tutorName} đã gửi mã QR nhận 90% thù lao (${(p.netPayoutVnd || 0).toLocaleString('vi-VN')}đ) cho ca học ${p.bookingCode}.`,
                        time: formatNotifTime(p.requestedAt),
                        type: 'booking',
                        read: savedReadIds.includes(id),
                        link: '/admin/dashboard',
                      })
                    }
                  }
                })
              }
            }
          } catch {}

          // 4. HỒ SƠ GIA SƯ MỚI CHỜ DUYỆT
          try {
            const pendingTutors = await adminApi.getTutorApplications({ status: 'pending' })
            if (Array.isArray(pendingTutors)) {
              pendingTutors.forEach((app) => {
                const id = `adm-tut-${app.id}`
                if (!savedDismissedIds.includes(id)) {
                  notifList.push({
                    id,
                    title: '📋 [Hồ Sơ Gia Sư Mới] Chờ Xét Duyệt',
                    message: `Gia sư ${app.fullName} (${app.email}) vừa nộp hồ sơ xét duyệt.`,
                    time: formatNotifTime(app.createdAt),
                    type: 'booking',
                    read: savedReadIds.includes(id),
                    link: '/admin/tutor-applications',
                  })
                }
              })
            }
          } catch {}

          // 5. KHIẾU NẠI MỞ
          try {
            const openComplaints = await adminApi.getComplaints('open')
            if (Array.isArray(openComplaints)) {
              openComplaints.forEach((c) => {
                const id = `adm-comp-${c.id}`
                if (!savedDismissedIds.includes(id)) {
                  notifList.push({
                    id,
                    title: `🚨 [Khiếu Nại Mới] Từ ${c.complainantRole === 'tutor' ? 'Gia sư' : 'Học viên'}`,
                    message: `${c.complainantName} khiếu nại ${c.targetName}: "${c.content}"`,
                    time: formatNotifTime(c.createdAt),
                    type: 'review',
                    read: savedReadIds.includes(id),
                    link: '/admin/complaints',
                  })
                }
              })
            }
          } catch {}

          // 6. CẢNH BÁO RỦI RO
          try {
            const riskItems = await adminApi.getRiskWatchlist()
            if (Array.isArray(riskItems)) {
              riskItems.forEach((r) => {
                const id = `adm-risk-${r.id}`
                if (!savedDismissedIds.includes(id)) {
                  const violText = r.violations ? r.violations.map((v) => v.label).join(', ') : 'Hành vi bất thường'
                  notifList.push({
                    id,
                    title: r.severity === 'critical' ? '🔥 [Cảnh Báo Nguy Hiểm] Rủi Ro Rất Cao' : '⚠️ [Cảnh Báo] Rủi Ro Tài Khoản',
                    message: `Phát hiện rủi ro từ ${r.userName} (${r.userRole === 'tutor' ? 'Gia sư' : 'Học viên'}): ${violText}`,
                    time: formatNotifTime(r.detectedAt),
                    type: 'status',
                    read: savedReadIds.includes(id),
                    link: '/admin/watchlist',
                  })
                }
              })
            }
          } catch {}
        }

        notifList.sort((a, b) => parseNotifTime(b.time) - parseNotifTime(a.time))
        setNotifications(notifList.slice(0, 30))
      } catch (err) {
        console.error('Lỗi tải thông báo:', err)
      }
    }

    loadNotifications()
    window.addEventListener('storage', loadNotifications)
    const interval = setInterval(loadNotifications, 5000)
    return () => {
      window.removeEventListener('storage', loadNotifications)
      clearInterval(interval)
    }
  }, [user, storageKey, dismissedStorageKey])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleNotificationClick = (item: AppNotification) => {
    const savedReadIds: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]')
    if (!savedReadIds.includes(item.id)) {
      savedReadIds.push(item.id)
      localStorage.setItem(storageKey, JSON.stringify(savedReadIds))
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
    )
    setIsOpen(false)
    if (item.link) {
      navigate(item.link)
    }
  }

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id)
    const savedReadIds: string[] = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const updatedIds = Array.from(new Set([...savedReadIds, ...allIds]))
    localStorage.setItem(storageKey, JSON.stringify(updatedIds))
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const clearAll = () => {
    const allIds = notifications.map((n) => n.id)
    const savedDismissedIds: string[] = JSON.parse(localStorage.getItem(dismissedStorageKey) || '[]')
    const updatedIds = Array.from(new Set([...savedDismissedIds, ...allIds]))
    localStorage.setItem(dismissedStorageKey, JSON.stringify(updatedIds))
    setNotifications([])
  }

  const deleteSingleNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const savedDismissedIds: string[] = JSON.parse(localStorage.getItem(dismissedStorageKey) || '[]')
    if (!savedDismissedIds.includes(id)) {
      savedDismissedIds.push(id)
      localStorage.setItem(dismissedStorageKey, JSON.stringify(savedDismissedIds))
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const renderIcon = (title: string, type: AppNotification['type']) => {
    if (title.includes('🚫') || title.includes('❌')) {
      return <XCircle className="h-4 w-4 text-rose-500" />
    }
    if (title.includes('⚠️') || title.includes('🚨') || title.includes('🔥')) {
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    }
    if (title.includes('💳')) {
      return <CreditCard className="h-4 w-4 text-indigo-500" />
    }
    if (title.includes('💸') || title.includes('💰')) {
      return <DollarSign className="h-4 w-4 text-emerald-500" />
    }
    if (title.includes('📅') || type === 'booking') {
      return <Calendar className="h-4 w-4 text-blue-500" />
    }
    if (type === 'review') {
      return <Star className="h-4 w-4 text-amber-500" />
    }
    return <CheckCircle2 className="h-4 w-4 text-blue-500" />
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
        title="Thông báo hệ thống"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl z-50 dark:border-slate-800 dark:bg-slate-900 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-500" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Thông báo mới
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={markAllAsRead}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                title="Đánh dấu tất cả đã đọc"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={clearAll}
                className="rounded-lg p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/60 cursor-pointer"
                title="Xóa tất cả"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Chưa có thông báo mới nào.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative flex cursor-pointer items-start gap-3 rounded-xl p-3 transition ${
                    item.read
                      ? 'bg-slate-50/50 hover:bg-slate-100/60 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 opacity-60'
                      : 'bg-indigo-50/70 border border-indigo-100 hover:bg-indigo-100/70 dark:bg-indigo-950/40 dark:border-indigo-900/50'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {renderIcon(item.title, item.type)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5 text-xs pr-6">
                    <p className="font-bold text-slate-900 dark:text-white leading-tight">
                      {item.title}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-snug">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-slate-400 pt-0.5">{item.time}</p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => deleteSingleNotification(e, item.id)}
                    className="absolute right-2 top-2 p-1 rounded-md text-slate-400 opacity-60 hover:opacity-100 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/60 transition cursor-pointer"
                    title="Xóa thông báo này"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
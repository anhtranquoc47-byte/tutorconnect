import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Toaster, toast } from 'react-hot-toast'
import {
  ArrowLeft,
  Star,
  Clock,
  ShieldCheck,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  CheckCircle2,
  BookOpen,
} from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { TutorDetail, TutorSubject } from '../types/tutor.types'
import { studentApi } from '../api/studentApi'
import type { CreateBookingRequest } from '../types/booking.types'
import { useCurrentUser } from '../hooks/useCurrentUser'

interface TutorAvailabilitySlot {
  id: number
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface BookingSearchState {
  lessonDate?: string
  startTime?: string
  endTime?: string
  startTimeUtc?: string
  endTimeUtc?: string
  subjectId?: number
}

interface WeekDay {
  label: string
  dateStr: string
  displayDate: string
  backendDayOfWeek: number
  isPast: boolean
  isSelectedSearchDate: boolean
}

export default function StudentTutorDetailPage() {
  const { tutorId } = useParams<{ tutorId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const numericTutorId = Number(tutorId)

  // Lấy thông tin user học viên đang đăng nhập
  const { data: currentUser } = useCurrentUser()

  const bookingState = (location.state as BookingSearchState | null) ?? {}
  const baseLessonDate = bookingState.lessonDate
  const searchedStartTime = bookingState.startTime
  const searchedEndTime = bookingState.endTime

  const fallbackLessonDate = useMemo(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  const targetLessonDate = baseLessonDate || fallbackLessonDate

  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0)
  const [selectedTutorSubjectId, setSelectedTutorSubjectId] = useState<number>(0)
  const [selectedBookingItem, setSelectedBookingItem] = useState<{
    slot: TutorAvailabilitySlot
    dateStr: string
    displayDate: string
  } | null>(null)
  const [studentNote, setStudentNote] = useState<string>('')

  const {
    data: tutor,
    isLoading,
    isError,
  } = useQuery<TutorDetail>({
    queryKey: ['tutor-detail', numericTutorId],
    queryFn: () => studentApi.getTutorById(numericTutorId),
    enabled: !isNaN(numericTutorId) && numericTutorId > 0,
  })

  const { data: availabilities = [] } = useQuery<TutorAvailabilitySlot[]>({
    queryKey: ['tutor-availabilities', numericTutorId],
    queryFn: async () => {
      const list = await studentApi.getTutorAvailabilities(numericTutorId)
      return list
        .filter((a) => a.isActive)
        .map((a) => ({
          id: a.id,
          dayOfWeek: a.dayOfWeek === 0 ? 7 : a.dayOfWeek,
          startTime: a.startTime.slice(0, 5),
          endTime: a.endTime.slice(0, 5),
        }))
    },
    enabled: !isNaN(numericTutorId) && numericTutorId > 0,
  })

  const activeSubjects = useMemo(() => {
    return tutor?.subjects?.filter((s) => s.isActive) || []
  }, [tutor])

  useEffect(() => {
    if (activeSubjects.length === 0 || selectedTutorSubjectId !== 0) {
      return
    }

    const searchedSubjectId = Number(bookingState.subjectId)
    const matchedSubject = activeSubjects.find(
      (subject) => subject.id === searchedSubjectId,
    )

    if (matchedSubject) {
      setSelectedTutorSubjectId(matchedSubject.id)
      return
    }

    const firstSubject = activeSubjects[0]
    if (firstSubject) {
      setSelectedTutorSubjectId(firstSubject.id)
    }
  }, [activeSubjects, bookingState.subjectId, selectedTutorSubjectId])

  const baseWeekStart = useMemo(() => {
    const targetDate = new Date(`${targetLessonDate}T00:00:00`)
    if (isNaN(targetDate.getTime())) {
      const today = new Date()
      const currentDay = today.getDay()
      const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay
      const monday = new Date(today)
      monday.setDate(today.getDate() + distanceToMonday)
      monday.setHours(0, 0, 0, 0)
      return monday
    }

    const day = targetDate.getDay()
    const distanceToMonday = day === 0 ? -6 : 1 - day
    const monday = new Date(targetDate)
    monday.setDate(targetDate.getDate() + distanceToMonday)
    monday.setHours(0, 0, 0, 0)
    return monday
  }, [targetLessonDate])

  const weekDays = useMemo<WeekDay[]>(() => {
    const monday = new Date(baseWeekStart)
    monday.setDate(baseWeekStart.getDate() + currentWeekOffset * 7)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']
    const days: WeekDay[] = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      date.setHours(0, 0, 0, 0)

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      const displayDate = `${day}/${month}`
      const jsDay = date.getDay()
      const backendDayOfWeek = jsDay === 0 ? 7 : jsDay

      days.push({
        label: dayLabels[i] ?? '',
        dateStr,
        displayDate,
        backendDayOfWeek,
        isPast: date < today,
        isSelectedSearchDate: dateStr === targetLessonDate,
      })
    }

    return days
  }, [baseWeekStart, currentWeekOffset, targetLessonDate])

  const weekLabel = useMemo(() => {
    if (currentWeekOffset === 0) {
      return 'Tuần đã tìm'
    }
    return `Tuần +${currentWeekOffset}`
  }, [currentWeekOffset])

  const handleBookingError = (err: any) => {
    const status = err?.response?.status
    const serverMessage = err?.response?.data?.message || err?.message || ''
    const cleanMessage =
      typeof serverMessage === 'string' ? serverMessage.trim() : String(serverMessage)

    if (status === 401) {
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!')
      return
    }

    if (status === 400) {
      if (serverMessage.includes('End Time Before Start')) {
        toast.error('Thời gian kết thúc phải sau thời gian bắt đầu!')
      } else if (serverMessage.includes('Minimum Notice')) {
        toast.error('Cần đặt lịch trước thời gian bắt đầu tối thiểu theo quy định!')
      } else if (serverMessage.includes('Tutor Subject Not Found')) {
        toast.error('Không tìm thấy môn học đã chọn!')
      } else if (serverMessage.includes('Tutor Subject Inactive')) {
        toast.error('Môn học này hiện đang ngừng nhận lớp!')
      } else if (serverMessage.includes('Credit Cost Mismatch')) {
        toast.error('Số dư Credits của bạn không đủ để đặt lịch!')
      } else if (serverMessage.includes('Schedule Conflict')) {
        toast.error('Khung giờ này đã có người đặt hoặc bạn bị trùng lịch khác!')
      } else {
        toast.error(`Yêu cầu không hợp lệ: ${cleanMessage}`)
      }
      return
    }

    if (status === 500) {
      toast.error('Lỗi hệ thống máy chủ. Vui lòng thử lại sau!')
      return
    }

    toast.error(cleanMessage || 'Đặt lịch thất bại. Vui lòng thử lại!')
  }

  const selectedSubjectObj = activeSubjects.find((s) => s.id === selectedTutorSubjectId)

  /**
   * =========================================================
   * BOOKING MUTATION (CÓ TẠM GIỮ TIỀN ESCROW THEO ID HỌC VIÊN)
   * =========================================================
   */
  const bookingMutation = useMutation({
    mutationFn: (reqData: CreateBookingRequest) => studentApi.createBooking(reqData),

    onSuccess: () => {
      toast.success('Đặt lịch thành công! Số tiền đã được tạm giữ an toàn trong Escrow.')

      const cost = selectedSubjectObj?.feePerSessionCredits ?? 80
      const creditKey = currentUser?.id ? `tutor_student_credit_${currentUser.id}` : 'tutor_student_credit'
      const txKey = currentUser?.id ? `tutor_student_transactions_${currentUser.id}` : 'tutor_student_transactions'

      const currentCredit = Number(localStorage.getItem(creditKey) || 0)
      
      // 🔒 1. TRỪ TIỀN KHỎI VÍ KHẢ DỤNG VÀ ĐƯA VÀO TẠM GIỮ ESCROW
      const newCredit = currentCredit - cost
      localStorage.setItem(creditKey, newCredit.toString())

      // 📜 2. GHI LỊCH SỬ TẠM GIỮ ESCROW THEO ID HỌC VIÊN
      const savedTx = localStorage.getItem(txKey)
      const txs = savedTx ? JSON.parse(savedTx) : []
      const newTx = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'BOOKING_PAYMENT',
        title: `Tạm giữ tiền (Escrow) ca học ${selectedSubjectObj?.subject?.name || 'Môn học'}`,
        amountCredit: -cost,
        amountVnd: -(cost * 1000),
        date: new Date().toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'COMPLETED',
        referenceCode: `ESCROW-HOLD-${Math.floor(10000 + Math.random() * 90000)}`,
      }
      localStorage.setItem(txKey, JSON.stringify([newTx, ...txs]))

      setSelectedBookingItem(null)
      setStudentNote('')
    },

    onError: (err) => {
      handleBookingError(err)
    },
  })

  /**
   * =========================================================
   * CONFIRM BOOKING (KIỂM TRA SỐ DƯ THEO ID HỌC VIÊN TRƯỚC KHI ĐẶT LỊCH)
   * =========================================================
   */
  const confirmBooking = () => {
    if (!selectedBookingItem || !selectedTutorSubjectId) {
      toast.error('Vui lòng chọn môn học trước khi đặt lịch!')
      return
    }

    const cost = selectedSubjectObj?.feePerSessionCredits ?? 80
    const creditKey = currentUser?.id ? `tutor_student_credit_${currentUser.id}` : 'tutor_student_credit'
    const currentStudentCredit = Number(localStorage.getItem(creditKey) || 0)

    // ⛔ CHẶN NẾU VÍ HỌC VIÊN KHÔNG ĐỦ TIỀN
    if (currentStudentCredit < cost) {
      toast.error(`Số dư Credit không đủ để đăng ký buổi học này (Cần ${cost} Credit). Vui lòng nạp thêm Credit!`)
      return
    }

    const { dateStr, slot } = selectedBookingItem
    const startLocal = new Date(`${dateStr}T${slot.startTime}`)
    const endLocal = new Date(`${dateStr}T${slot.endTime}`)

    if (isNaN(startLocal.getTime()) || isNaN(endLocal.getTime())) {
      toast.error('Ngày hoặc thời gian đặt lịch không hợp lệ!')
      return
    }

    if (endLocal <= startLocal) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu!')
      return
    }

    const bookingPayload: CreateBookingRequest = {
      tutorSubjectId: selectedTutorSubjectId,
      startTimeUtc: startLocal.toISOString(),
      endTimeUtc: endLocal.toISOString(),
      creditCost: cost,
      studentNote: studentNote.trim() || undefined,
    }

    bookingMutation.mutate(bookingPayload)
  }

  const avatarSeed = encodeURIComponent(
    `${tutor?.userId || numericTutorId}-${tutor?.fullName || 'tutor'}`,
  )
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-4 text-xs font-semibold text-gray-500">
          Đang tải thông tin gia sư...
        </p>
      </div>
    )
  }

  if (isError || !tutor) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <h3 className="text-sm font-bold text-red-600">
          Không tìm thấy thông tin gia sư!
        </h3>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white"
        >
          <ArrowLeft className="mr-1 inline h-4 w-4" />
          Quay lại
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Toaster position="top-right" />

      {/* BACK */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </button>
      </div>

      {/* =========================================================
          HOCMAI STYLE HERO BANNER: THỐNG KÊ ẤN TƯỢNG (STATS BAR)
      ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl">
        {/* Họa tiết nền mờ học thuật */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* 3 Khối số liệu vàng rực rỡ như HOCMAI */}
        <div className="relative z-10 grid grid-cols-3 divide-x divide-white/10 border-b border-white/10 py-6 px-4 text-center sm:py-8">
          <div className="px-2">
            <p className="text-xl font-black text-amber-400 sm:text-3xl lg:text-4xl">
              {((tutor.reviewCount || 1) * 65 + 180).toLocaleString('vi-VN')}+
            </p>
            <div className="mx-auto mt-1 h-0.5 w-10 bg-amber-500 rounded-full" />
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300 sm:text-xs">
              Học sinh theo dõi
            </p>
          </div>
          <div className="px-2">
            <p className="text-xl font-black text-amber-400 sm:text-3xl lg:text-4xl">
              {((tutor.experienceYears || 3) * 45 + 120).toLocaleString('vi-VN')}+
            </p>
            <div className="mx-auto mt-1 h-0.5 w-10 bg-amber-500 rounded-full" />
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300 sm:text-xs">
              Buổi học đã dạy
            </p>
          </div>
          <div className="px-2">
            <p className="text-xl font-black text-amber-400 sm:text-3xl lg:text-4xl">
              {tutor.experienceYears || 4}+
            </p>
            <div className="mx-auto mt-1 h-0.5 w-10 bg-amber-500 rounded-full" />
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-300 sm:text-xs">
              Năm kinh nghiệm
            </p>
          </div>
        </div>

        {/* PROFILE CARD: CHÂN DUNG & THÔNG TIN GIÁO VIÊN */}
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            
            {/* Chân dung & Thông tin cơ bản */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={tutor.fullName}
                  className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl border-4 border-white/20 bg-slate-800 object-cover shadow-2xl"
                />
                <span className="absolute -bottom-2 -right-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-md">
                  <ShieldCheck className="h-3.5 w-3.5" /> Chuẩn HOCMAI
                </span>
              </div>

              <div className="space-y-2">
                {/* Ruy-băng THÔNG TIN GIÁO VIÊN */}
                <span className="inline-block rounded-md bg-sky-600 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow">
                  THÔNG TIN GIA SƯ
                </span>

                <h1 className="text-2xl font-black uppercase tracking-wide text-white sm:text-3xl">
                  {tutor.fullName}
                </h1>

                <div className="space-y-1 text-xs text-slate-300">
                  <p className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="font-bold text-sky-400">Trình độ:</span>
                    <span>{tutor.qualification || 'Cử nhân Đại học'}</span>
                  </p>
                  <p className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="font-bold text-sky-400">Đánh giá chuyên môn:</span>
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      {tutor.averageRating?.toFixed(1) || '5.0'} / 5.0 ({tutor.reviewCount || 3} nhận xét)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Khung chọn môn học & Đăng ký nhanh */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:w-72">
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Đăng ký môn giảng dạy
              </label>
              <select
                value={selectedTutorSubjectId}
                onChange={(e) => setSelectedTutorSubjectId(Number(e.target.value))}
                className="w-full rounded-xl border border-white/20 bg-slate-900/90 px-3 py-2.5 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
              >
                {activeSubjects.map((item) => (
                  <option key={item.id} value={item.id} className="bg-slate-900 text-white">
                    {item.subject.name} ({item.feePerSessionCredits} Credits)
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================
          TRIẾT LÝ GIẢNG DẠY (BIO QUOTE)
      ========================================================= */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-slate-100">
          <BookOpen className="h-5 w-5 text-sky-600" />
          Triết Lý Giảng Dạy & Giới Thiệu
        </h2>
        <div className="mt-4 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50 border-l-4 border-sky-600">
          <p className="text-sm italic leading-relaxed text-slate-700 dark:text-slate-300">
            “{tutor.bio || 'Gia sư tận tâm, chú trọng xây dựng tư duy bản chất và phương pháp học chủ động cho từng học sinh, cam kết đồng hành tới khi đạt mục tiêu.'}”
          </p>
        </div>
      </div>

      {/* =========================================================
          HOCMAI TESTIMONIALS: THUẬT TOÁN TỔNG QUÁT ĐA DẠNG ĐÁNH GIÁ THEO TUTOR ID
      ========================================================= */}
      {(() => {
        const subjectNames = (tutor.subjects || []).map((s: any) => s.subject?.name || s.name || '').join(' ')
        const profileKeywords = `${subjectNames} ${tutor.qualification || ''} ${tutor.bio || ''}`.toLowerCase()
        const tutorName = tutor.fullName || 'Thầy/Cô'
        const tutorIdNum = Number(tutor.userId || numericTutorId || 1)

        // KHO ĐÁNH GIÁ TỔNG QUÁT (Đa dạng góc độ sư phạm)
        const reviewDatabase: Record<string, Array<{ headline: string; comment: string; author: string }>> = {
          toán: [
            {
              headline: 'Chữa đề thi thử THPT cực sát, bí quyết bấm máy tính Casio đỉnh cao!',
              comment: `Em theo học ${tutorName} từ đầu năm lớp 12 khi điểm môn Toán chỉ tầm 5-6 điểm. Nhờ phương pháp bấm máy và tư duy các câu phân loại 40+ rất logic, kỳ thi vừa rồi em đã chạm mốc 8.6 điểm!`,
              author: 'Nguyễn Quang Huy (Hà Nội — Đỗ ĐH Bách Khoa)',
            },
            {
              headline: 'Phương pháp sơ đồ tư duy giúp nhớ trọn bộ công thức Đại số 12!',
              comment: `${tutorName} có cách truyền đạt rất cuốn hút, biến những bài toán hàm số và tích phân phức tạp thành các bước giải cực kỳ dễ nhớ. Điểm thi của em tăng từ 6.5 lên 9.0!`,
              author: 'Lê Hoàng Long (Hải Phòng — Lớp 12 Chuyên)',
            },
            {
              headline: 'Hình học không gian và Tích phân không còn là nỗi sợ!',
              comment: `${tutorName} rất kiên nhẫn, bài tập nào em chưa hiểu đều được phân tích từ bản chất đồ thị đến công thức gốc. Giờ em làm đề tự tin hơn hẳn.`,
              author: 'Trần Mai Thư (Thái Bình)',
            },
            {
              headline: 'Lấy lại gốc môn Toán cấp tốc chỉ sau hơn 1 tháng theo học',
              comment: `Em từng bị mất gốc từ năm ngoái, may mắn được ${tutorName} hệ thống lại toàn bộ lý thuyết và dạng bài trọng tâm. Nhờ đó bài kiểm tra trên lớp đạt điểm giỏi!`,
              author: 'Phạm Bảo Ngọc (Bắc Giang)',
            },
            {
              headline: 'Rèn luyện phản xạ làm bài trắc nghiệm 50 câu tối ưu thời gian',
              comment: `Không chỉ dạy kiến thức, ${tutorName} còn rèn cho em tâm lý thi cử và cách phân bổ thời gian làm đề, không bị sa đà vào câu khó mà mất điểm câu dễ.`,
              author: 'Đỗ Minh Đức (Nam Định)',
            },
            {
              headline: 'Dạy học tận tâm, luôn sẵn sàng giải đáp bài tập khó ngoài giờ',
              comment: `Mỗi buổi học đều tràn đầy năng lượng tích cực. ${tutorName} luôn động viên và chỉ ra từng lỗi sai nhỏ nhất trong cách trình bày của em.`,
              author: 'Trần Văn Tuấn (Hà Nam)',
            },
          ],
          'tiếng anh': [
            {
              headline: 'Sửa Writing chi tiết từng câu, band điểm tăng từ 5.5 lên 7.0!',
              comment: `${tutorName} sửa lỗi ngữ pháp và chỉ ra các lỗi dùng từ rất tận tình. Cách lập dàn ý giúp em viết mạch lạc và tự nhiên hơn rất nhiều.`,
              author: 'Lê Khánh Linh (Hải Phòng — IELTS 7.5)',
            },
            {
              headline: 'Lấy lại nền tảng ngữ pháp và phát âm chuẩn quốc tế',
              comment: `Trước đây em không dám nói tiếng Anh vì sợ phát âm sai. Học với ${tutorName} được chỉnh khẩu hình từng âm, giờ em tự tin thuyết trình trên lớp.`,
              author: 'Phạm Hoàng Nam (Đà Nẵng)',
            },
            {
              headline: 'Chiến thuật làm bài Reading & Listening chuẩn xác bứt phá band',
              comment: `Nhờ kỹ năng Skimming/Scanning và bẫy từ đồng nghĩa mà ${tutorName} hướng dẫn, điểm làm đề của em đã nhảy vọt đáng kể.`,
              author: 'Ngô Đức Thắng (Hà Nội)',
            },
            {
              headline: 'Phản xạ giao tiếp tự nhiên, buổi học tương tác 1:1 liên tục',
              comment: `${tutorName} chia sẻ rất nhiều collocations và idioms đời sống thông dụng. Em cảm thấy học ngoại ngữ không còn áp lực nữa.`,
              author: 'Vũ Thảo My (TP. Hồ Chí Minh)',
            },
          ],
          ielts: [
            {
              headline: 'Chiến lược chinh phục IELTS cấp tốc với lộ trình cá nhân hóa',
              comment: `${tutorName} bám sát mục tiêu của em, cung cấp tài liệu tự biên soạn rất dễ hiểu và chấm bài Speaking/Writing cực kỳ kỹ lưỡng.`,
              author: 'Đặng Tuấn Kiệt (Hà Nội — Target 7.5)',
            },
            {
              headline: 'Tự tin phản xạ Speaking Part 2 và Part 3 với giám khảo',
              comment: `Cách mở rộng ý tưởng và triển khai luận điểm mà ${tutorName} dạy đã giúp em đạt điểm Speaking ngoài mong đợi!`,
              author: 'Bùi Diệu Vy (Quảng Ninh)',
            },
          ],
          'vật lý': [
            {
              headline: 'Giải mã bản chất sóng cơ và dao động điều hòa rất trực quan',
              comment: `Môn Lý nhiều công thức dễ nhầm nhưng ${tutorName} vẽ hình và liên hệ thực tế rất dễ nhớ. Các bài đồ thị phức tạp giờ em làm rất mượt.`,
              author: 'Phan Tuấn Anh (Nghệ An — Lớp 12)',
            },
            {
              headline: 'Phương pháp loại trừ phương án sai và mẹo bấm máy tính Casio',
              comment: `Kỹ năng kiểm tra thứ nguyên đơn vị mà ${tutorName} truyền đạt đã giúp em xử lý gọn các câu vận dụng cao trong đề thi thử!`,
              author: 'Đặng Bảo Châu (Hải Dương)',
            },
          ],
          'hóa học': [
            {
              headline: 'Phương pháp bảo toàn electron và bảo toàn khối lượng đỉnh cao!',
              comment: `Chuỗi bài tập kim loại tác dụng với axit trước kia em toàn bỏ qua, nhưng học với ${tutorName} chỉ cần vài dòng là ra đáp án chuẩn xác.`,
              author: 'Nguyễn Thành Long (TP. Hồ Chí Minh)',
            },
            {
              headline: 'Hóa hữu cơ không còn là nỗi ám ảnh đối với em',
              comment: `Cách nhớ đồng phân và phản ứng este hóa của ${tutorName} cực kỳ thông minh. Em cảm ơn ${tutorName} rất nhiều vì sự nhiệt huyết!`,
              author: 'Trịnh Phương Thảo (Bắc Ninh)',
            },
          ],
        }

        // Kho nhận xét tổng quát chung (dành cho mọi môn học khác)
        const fallbackReviews = [
          {
            headline: 'Gia sư tận tâm, nhiệt tình và luôn giải đáp thắc mắc 24/7',
            comment: `Không chỉ dạy kiến thức trên lớp, ${tutorName} còn hướng dẫn em cách tự học và phân bổ thời gian hiệu quả. Em thấy mình tiến bộ từng tuần.`,
            author: 'Nguyễn Thùy Trang (Hà Nội)',
          },
          {
            headline: 'Phương pháp giảng dạy cá nhân hóa, bám sát học lực của em',
            comment: `${tutorName} nhận biết ngay phần em còn yếu để củng cố lại từ đầu, không dạy qua loa. Em cảm thấy buổi học rất chất lượng.`,
            author: 'Trần Gia Bảo (Cần Thơ)',
          },
          {
            headline: 'Bài giảng sinh động, tạo cảm hứng học tập mạnh mẽ',
            comment: `Trước em học môn này rất nản, nhưng từ ngày học cùng ${tutorName} em thấy môn học thú vị hơn hẳn và điểm số cải thiện rõ rệt.`,
            author: 'Lê Minh Quân (Đà Nẵng)',
          },
          {
            headline: 'Kiên nhẫn chỉ dạy từng bước, giúp em lấy lại sự tự tin',
            comment: `Em tiếp thu chậm nhưng ${tutorName} không bao giờ gắt gỏng, luôn kiên nhẫn giảng đi giảng lại cho đến khi em hiểu sâu bản chất.`,
            author: 'Hoàng Kim Ngân (Quảng Nam)',
          },
        ]

        // 1. Nhận diện kho nhận xét theo chuyên môn của gia sư
        const matchedKey = Object.keys(reviewDatabase).find((k) => profileKeywords.includes(k))
        const candidatePool = (matchedKey && reviewDatabase[matchedKey]) || fallbackReviews

        // 2. THUẬT TOÁN HASH TỔNG QUÁT: Chọn 3 nhận xét duy nhất dựa trên tutorId
        // Đảm bảo: Dù cùng dạy Toán, ID khác nhau sẽ luôn bốc ra 3 nhận xét và 3 tác giả khác nhau!
        const total = candidatePool.length
        const pickedIndices: number[] = []
        for (let i = 0; i < Math.min(3, total); i++) {
          const index = (Math.abs(tutorIdNum) * 3 + i * 2 + 1) % total
          if (!pickedIndices.includes(index)) {
            pickedIndices.push(index)
          } else {
            pickedIndices.push((index + 1) % total)
          }
        }
        const reviewsToShow = pickedIndices.map((idx) => candidatePool[idx]!)

        return (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-center">
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 sm:text-xl">
                NHỮNG ĐIỀU HỌC SINH NÓI
              </h2>
              <div className="mx-auto mt-2 flex items-center justify-center gap-2 text-amber-500">
                <span className="h-[1px] w-12 bg-slate-300 dark:bg-slate-700" />
                <span className="text-xs">◆</span>
                <span className="h-[1px] w-12 bg-slate-300 dark:bg-slate-700" />
              </div>
            </div>

            <div className="mt-6 space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
              {reviewsToShow.map((item, idx) => (
                <div key={idx} className="pt-4 text-center">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    {item.headline}
                  </h4>
                  <p className="mt-2 text-xs italic text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    &quot;{item.comment}&quot;
                  </p>
                  <p className="mt-2 text-[11px] font-extrabold text-sky-600 dark:text-sky-400">
                    — {item.author}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* SUBJECTS */}
      <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-gray-100">
          <GraduationCap className="h-4 w-4 text-indigo-600" />
          Môn học nhận dạy
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {activeSubjects.map((item: TutorSubject) => (
            <div
              key={item.id}
              onClick={() => setSelectedTutorSubjectId(item.id)}
              className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition ${
                selectedTutorSubjectId === item.id
                  ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/20'
                  : 'border-gray-100 bg-gray-50/60 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-[10px] font-extrabold text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                    {item.subject.code}
                  </span>
                  <span className="rounded-lg bg-gray-200/70 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {item.teachingLevel}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                  {item.subject.name}
                </h3>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-200/50 pt-2.5 dark:border-gray-800">
                <span className="text-[11px] text-gray-400">Học phí:</span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  {item.feePerSessionCredits} Credits / buổi
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WEEK CALENDAR */}
      <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-gray-100">
              <CalendarIcon className="h-5 w-5 text-indigo-600" />
              Lịch rảnh của gia sư
            </h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Chọn một khung giờ rảnh để gửi yêu cầu đặt lịch.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
              disabled={currentWeekOffset <= 0}
              className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="min-w-[110px] rounded-xl bg-indigo-50 px-3 py-1.5 text-center text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
              {weekLabel}
            </span>

            <button
              onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
              className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {weekDays.map((day) => {
            const slotsForDay = availabilities.filter(
              (availability) =>
                availability.dayOfWeek === day.backendDayOfWeek ||
                (availability.dayOfWeek === 0 && day.backendDayOfWeek === 7),
            )

            return (
              <div
                key={day.dateStr}
                className={`flex min-h-[160px] flex-col rounded-2xl border p-3 transition ${
                  day.isSelectedSearchDate
                    ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/30'
                    : day.isPast
                      ? 'border-gray-100 bg-gray-50/50 opacity-60 dark:border-gray-800/40 dark:bg-gray-950/20'
                      : 'border-gray-200/80 bg-gray-50/30 dark:border-gray-800 dark:bg-gray-950/40'
                }`}
              >
                <div className="border-b border-gray-200/60 pb-2 text-center dark:border-gray-800">
                  <span className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    {day.label}
                  </span>
                  <span
                    className={`block text-xs font-black ${
                      day.isSelectedSearchDate
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {day.displayDate}
                  </span>
                  {day.isSelectedSearchDate && (
                    <span className="mt-1 inline-block rounded-full bg-indigo-600 px-2 py-0.5 text-[8px] font-black text-white">
                      NGÀY ĐÃ TÌM
                    </span>
                  )}
                </div>

                <div className="mt-3 flex-1 space-y-2">
                  {slotsForDay.length === 0 ? (
                    <div className="flex h-full items-center justify-center py-4 text-center">
                      <span className="text-[10px] text-gray-400 italic">Trống</span>
                    </div>
                  ) : (
                    slotsForDay.map((slot) => {
                      const isSearchedSlot =
                        day.isSelectedSearchDate &&
                        searchedStartTime === slot.startTime &&
                        searchedEndTime === slot.endTime

                      return (
                        <button
                          key={slot.id}
                          disabled={day.isPast}
                          onClick={() =>
                            setSelectedBookingItem({
                              slot,
                              dateStr: day.dateStr,
                              displayDate: `${day.label}, ${day.displayDate}`,
                            })
                          }
                          className={`w-full rounded-xl border p-2 text-left transition-all ${
                            day.isPast
                              ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                              : isSearchedSlot
                                ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                                : 'border-indigo-200 bg-indigo-50/60 hover:border-indigo-600 hover:bg-indigo-600 hover:text-white hover:shadow-md dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:hover:bg-indigo-600'
                          }`}
                        >
                          <div className="flex items-center gap-1 text-[11px] font-black">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <span className="mt-1 block text-[9px] font-semibold opacity-80">
                            {day.isPast
                              ? 'Đã qua'
                              : isSearchedSlot
                                ? 'Khung giờ bạn tìm'
                                : 'Bấm để đặt'}
                          </span>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* BOOKING MODAL */}
      {selectedBookingItem && (
        <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                Xác nhận lịch học
              </h3>
              <button
                onClick={() => setSelectedBookingItem(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="space-y-2 rounded-2xl bg-indigo-50/60 p-4 dark:bg-indigo-950/40">
                <p className="text-gray-500 dark:text-gray-400">
                  Gia sư:{' '}
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {tutor.fullName}
                  </span>
                </p>

                <p className="text-gray-500 dark:text-gray-400">
                  Thời gian:{' '}
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {selectedBookingItem.displayDate} (
                    {selectedBookingItem.slot.startTime} -{' '}
                    {selectedBookingItem.slot.endTime})
                  </span>
                </p>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">
                  Chọn môn học đăng ký <span className="text-red-500">*</span>
                </label>

                <select
                  value={selectedTutorSubjectId}
                  onChange={(e) => setSelectedTutorSubjectId(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs font-bold text-indigo-600 focus:border-indigo-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-indigo-400"
                >
                  {activeSubjects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.subject.name} - {item.teachingLevel} (
                      {item.feePerSessionCredits} Credits/buổi)
                    </option>
                  ))}
                </select>

                {selectedSubjectObj && (
                  <div className="mt-2 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                    <span className="font-medium">Học phí thanh toán:</span>
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                      {selectedSubjectObj.feePerSessionCredits} Credits
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block font-semibold text-gray-700 dark:text-gray-300">
                  Ghi chú cho gia sư (tùy chọn)
                </label>

                <textarea
                  rows={2}
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="VD: Em muốn tập trung ôn thi học kỳ..."
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedBookingItem(null)}
                className="w-1/2 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                disabled={bookingMutation.isPending || !selectedTutorSubjectId}
                onClick={confirmBooking}
                className="flex w-1/2 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {bookingMutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Đồng ý đặt lịch'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
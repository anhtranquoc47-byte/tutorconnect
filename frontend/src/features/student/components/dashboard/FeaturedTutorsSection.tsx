import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Star, Award, Clock, Play, Sparkles, X, Calendar } from 'lucide-react'
import { studentApi } from '@/features/student/api/studentApi'
import type { TutorSearchResult } from '@/features/student/types/tutor.types'

export default function FeaturedTutorsSection() {
  const navigate = useNavigate()
  const [selectedVideoTutor, setSelectedVideoTutor] = useState<TutorSearchResult | null>(null)

  // Gọi API lấy danh sách Gia sư thực tế từ CSDL Backend (đã tự động sắp xếp theo ReputationScore & Rating sao cao nhất)
  const { data: rawTutors = [], isLoading } = useQuery({
    queryKey: ['featured-top-tutors'],
    queryFn: () => studentApi.searchTutors({ subjectId: 1, teachingLevel: 'All Levels' }),
    select: (data: any) => {
      if (Array.isArray(data)) return data
      if (Array.isArray(data?.data)) return data.data
      if (Array.isArray(data?.items)) return data.items
      return []
    },
  })

  // Lấy Top Gia sư đứng đầu danh sách từ CSDL thực tế
  const featuredTutors: TutorSearchResult[] = rawTutors.slice(0, 6)

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className="mt-2 text-xs font-semibold text-slate-500">Đang tải danh sách Gia sư tiêu biểu từ CSDL...</p>
      </div>
    )
  }

  if (featuredTutors.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Title Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Gia sư Tiêu biểu & Nổi bật
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đội ngũ thầy cô uy tín hàng đầu được xếp hạng từ CSDL hệ thống
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/student/tutors')}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          Xem tất cả →
        </button>
      </div>

      {/* Grid Danh sách Gia sư Tiêu biểu */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featuredTutors.map((tutor) => {
          const avatarSeed = encodeURIComponent(`${tutor.tutorId}-${tutor.fullName}`)
          const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`
          const introVideo = (tutor as any)?.introVideoUrl

          return (
            <div
              key={`${tutor.tutorId}-${tutor.subjectId}`}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900/60"
            >
              <div>
                {/* Header Card: Avatar + Status Badge */}
                <div className="flex items-start gap-3.5">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-0.5 shadow-sm dark:border-amber-500/40 dark:bg-slate-800">
                    <img
                      src={avatarUrl}
                      alt={tutor.fullName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" title="Đang Online" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                        🏆 Top Gia sư
                      </span>
                      <span className="shrink-0 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        {tutor.subjectName}
                      </span>
                    </div>

                    <h3 className="mt-1.5 truncate text-sm font-black text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                      {tutor.fullName}
                    </h3>

                    {/* Rating & Review Count */}
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-0.5 font-bold text-amber-500">
                        <Star className="h-3 w-3 fill-amber-500" /> {(tutor.averageRating || 5.0).toFixed(1)}
                      </span>
                      <span>•</span>
                      <span>{tutor.reviewCount || 0} đánh giá</span>
                    </div>
                  </div>
                </div>

                {/* Bio Description */}
                <p className="mt-3.5 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {tutor.bio || 'Giảng viên giàu kinh nghiệm, nhiệt tình và chuyên nghiệp.'}
                </p>

                {/* Badges Info */}
                <div className="mt-3.5 space-y-1.5 rounded-2xl bg-slate-50/80 p-3 text-xs dark:bg-slate-950/50">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Award className="h-3.5 w-3.5 text-indigo-500" /> Bằng cấp:
                    </span>
                    <span className="max-w-[140px] truncate font-semibold text-slate-800 dark:text-slate-200">
                      {tutor.qualification || 'Cử nhân'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-emerald-500" /> Kinh nghiệm:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {tutor.experienceYears} năm
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Học phí / Buổi
                  </span>
                  <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {tutor.feePerSessionCredits} <span className="text-xs font-bold">Credits</span>
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Button Xem Video Shorts 30s */}
                  {introVideo && (
                    <button
                      onClick={() => setSelectedVideoTutor(tutor)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400"
                      title="Xem Video Giới thiệu 30s"
                    >
                      <Play className="h-3.5 w-3.5 fill-rose-600 dark:fill-rose-400" />
                    </button>
                  )}

                  {/* Button Đặt Lịch */}
                  <button
                    onClick={() => navigate(`/student/tutors/tutorDetail/${tutor.tutorId}`)}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Đặt lịch
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* POPUP MODAL VIDEO SHORTS 9:16 (TIKTOK STYLE) */}
      {selectedVideoTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 overflow-hidden shadow-2xl border border-slate-800 animate-in fade-in zoom-in duration-200">
            {/* Header Modal */}
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between rounded-2xl bg-black/40 p-2 backdrop-blur-md text-white">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="truncate text-xs font-bold">{selectedVideoTutor.fullName}</p>
              </div>
              <button
                onClick={() => setSelectedVideoTutor(null)}
                className="rounded-full bg-white/20 p-1 hover:bg-white/40 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-[9/16] w-full bg-black">
              <video
                src={(selectedVideoTutor as any)?.introVideoUrl}
                controls
                autoPlay
                className="h-full w-full object-cover"
              />
            </div>

            {/* Bottom Floating CTA Bar */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{selectedVideoTutor.fullName}</p>
                <p className="text-[10px] text-slate-400">{selectedVideoTutor.feePerSessionCredits} Credits / buổi</p>
              </div>
              <button
                onClick={() => {
                  const id = selectedVideoTutor.tutorId
                  setSelectedVideoTutor(null)
                  navigate(`/student/tutors/tutorDetail/${id}`)
                }}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-indigo-700 active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Đặt lịch ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Xuất cả Named Export hỗ trợ mọi kiểu import
export { FeaturedTutorsSection }
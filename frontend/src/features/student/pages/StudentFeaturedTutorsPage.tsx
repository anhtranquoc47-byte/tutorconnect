import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Star, Award, Clock, Play, Sparkles, X, Trophy, CheckCircle } from 'lucide-react'
import { studentApi } from '../api/studentApi'
import type { TutorSearchResult } from '../types/tutor.types'

export default function StudentFeaturedTutorsPage() {
  const navigate = useNavigate()
  const [selectedVideoTutor, setSelectedVideoTutor] = useState<TutorSearchResult | null>(null)
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All')

  // Quét danh sách Gia sư tiêu biểu trên TẤT CẢ các môn học từ CSDL SQL Server
  const { data: rawTutors = [], isLoading } = useQuery({
    queryKey: ['student-featured-tutors-page-all-subjects-sync'],
    queryFn: async () => {
      const subjects = await studentApi.getSubjects().catch(() => [])
      const activeSubjects = subjects.filter((s) => s.isActive)
      
      // Gọi API tìm kiếm cho tất cả các môn học hoạt động trong CSDL
      const results = await Promise.all(
        activeSubjects.map((sub) =>
          studentApi.searchTutors({ subjectId: sub.id, teachingLevel: 'All Levels' }).catch(() => [])
        )
      )
      
      const flattened = results.flat()
      // Loại bỏ trùng lặp ID gia sư
      const uniqueTutorsMap = new Map<number, TutorSearchResult>()
      flattened.forEach((t) => {
        if (t && t.tutorId && !uniqueTutorsMap.has(t.tutorId)) {
          uniqueTutorsMap.set(t.tutorId, t)
        }
      })
      return Array.from(uniqueTutorsMap.values())
    },
  })

  // Áp dụng BỘ ĐIỀU KIỆN TUYỂN CHỌN TIÊU BIỂU THỐNG NHẤT (Rating >= 4.0 & Lượt đánh giá >= 1 & Uy tín > 60)
  const featuredTutors: TutorSearchResult[] = rawTutors
    .filter((tutor: TutorSearchResult) => {
      const isQualified =
        tutor.averageRating >= 4.0 &&
        (tutor.reviewCount >= 1 || (tutor.reputationScore && tutor.reputationScore > 60))
      
      if (!isQualified) return false

      if (selectedSubjectFilter === 'All') return true
      return tutor.subjectName?.toLowerCase().includes(selectedSubjectFilter.toLowerCase())
    })
    .sort((a: TutorSearchResult, b: TutorSearchResult) => b.reputationScore - a.reputationScore || b.averageRating - a.averageRating)

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Tiêu đề Trang Bảng Vàng Gia Sư */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md">
            <Trophy className="h-4 w-4" />
            <span>Bảng Vàng Gia Sư Xuất Sắc (Đã Kiểm Duyệt)</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Gia Sư Tiêu Biểu & Nổi Bật
          </h1>
          <p className="text-sm font-medium text-indigo-100">
            Danh sách các thầy cô đạt chuẩn tiêu biểu (Rating từ 4.0 sao trở lên, có lượt đánh giá thật và điểm uy tín cao).
          </p>
        </div>

        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Bộ lọc Môn học */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Danh sách Gia Sư Tiêu Biểu Đạt Chuẩn ({featuredTutors.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cập nhật tự động từ CSDL khi gia sư đạt chuẩn đánh giá
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Toán', 'IELTS', 'Tiếng Anh', 'Vật Lý', 'Hóa Học'].map((subject: string) => (
            <button
              key={subject}
              onClick={() => setSelectedSubjectFilter(subject)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedSubjectFilter === subject
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {subject === 'All' ? 'Tất cả môn' : subject}
            </button>
          ))}
        </div>
      </div>

      {/* Lưới Thẻ Gia sư */}
      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Đang lọc danh sách Gia sư tiêu biểu đạt chuẩn từ tất cả môn...
          </p>
        </div>
      ) : featuredTutors.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            Chưa có gia sư tiêu biểu nào phù hợp bộ lọc này.
          </p>
          <button
            onClick={() => setSelectedSubjectFilter('All')}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
          >
            Xem tất cả gia sư
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTutors.map((tutor: TutorSearchResult) => {
            const hasVideo = Boolean((tutor as any)?.introVideoUrl)

            return (
              <div
                key={tutor.tutorId}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    <Sparkles className="h-3 w-3" />
                    Gia sư Tiêu biểu
                  </span>

                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-black text-white shadow-md">
                      {tutor.fullName ? tutor.fullName.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 dark:bg-slate-900">
                      <CheckCircle className="h-4 w-4 text-indigo-600 fill-indigo-100 dark:fill-indigo-950" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                      {tutor.fullName}
                    </h3>
                    <p className="truncate text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {tutor.subjectName} • {tutor.teachingLevel}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-xs font-extrabold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{tutor.averageRating ? tutor.averageRating.toFixed(1) : '5.0'}</span>
                      <span className="text-[11px] font-medium text-slate-400">
                        ({tutor.reviewCount || 0} đánh giá)
                      </span>
                    </div>
                  </div>
                </div>

                <p className="my-3.5 line-clamp-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {tutor.bio || 'Gia sư nhiều năm kinh nghiệm, tận tâm, cam kết hỗ trợ học viên nâng cao thành tích học tập.'}
                </p>

                <div className="mb-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                    <Award className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="truncate max-w-[120px]">{tutor.qualification || 'Cử nhân'}</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{tutor.experienceYears || 3} năm KN</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Học phí / buổi
                    </span>
                    <p className="text-base font-black text-indigo-600 dark:text-indigo-400">
                      {tutor.feePerSessionCredits?.toLocaleString('vi-VN')}{' '}
                      <span className="text-xs font-bold">Credits</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasVideo && (
                      <button
                        onClick={() => setSelectedVideoTutor(tutor)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition cursor-pointer"
                        title="Xem video giới thiệu"
                      >
                        <Play className="h-4 w-4 fill-amber-500" />
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/student/tutors/tutorDetail/${tutor.tutorId}`)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all duration-200 hover:bg-indigo-700 hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Đặt lịch
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Shorts Video */}
      {selectedVideoTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between rounded-2xl bg-black/40 p-2 text-white backdrop-blur-md">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="truncate text-xs font-bold">{selectedVideoTutor.fullName}</p>
              </div>
              <button
                onClick={() => setSelectedVideoTutor(null)}
                className="rounded-full bg-white/20 p-1 hover:bg-white/40 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative aspect-[9/16] w-full bg-black">
              <video
                src={(selectedVideoTutor as any)?.introVideoUrl}
                controls
                autoPlay
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{selectedVideoTutor.fullName}</p>
                <p className="text-[10px] text-slate-400">
                  {selectedVideoTutor.feePerSessionCredits?.toLocaleString('vi-VN')} Credits / buổi
                </p>
              </div>
              <button
                onClick={() => {
                  const id = selectedVideoTutor.tutorId
                  setSelectedVideoTutor(null)
                  navigate(`/student/tutors/tutorDetail/${id}`)
                }}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-indigo-700 active:scale-95 cursor-pointer"
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

export { StudentFeaturedTutorsPage }
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Search, Star, BookOpen, Award, Clock, Users, ChevronRight, SlidersHorizontal,
} from 'lucide-react'
import { studentApi } from '../api/studentApi'

import type { TutorSearchResult } from '../types/tutor.types'

export default function StudentAllTutorsPage() {
  const navigate = useNavigate()
  const [searchName, setSearchName] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0)
  const [selectedLevel, setSelectedLevel] = useState<string>('Tất cả')

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects-all-tutors'],
    queryFn: studentApi.getSubjects,
    select: (data: any) => {
      if (Array.isArray(data)) return data
      if (Array.isArray(data?.data)) return data.data
      if (Array.isArray(data?.items)) return data.items
      return []
    },
  })

  const activeSubjects = useMemo(
    () => (subjects as any[]).filter((s) => s.isActive !== false),
    [subjects],
  )

const { data: rawTutors = [], isLoading } = useQuery({
  queryKey: ['all-system-tutors', activeSubjects.map((s: any) => s.id).join(',')],
  queryFn: async () => {
    if (activeSubjects.length === 0) return []

    // 1. Quét gia sư theo từng môn học qua API học viên
    const results = await Promise.all(
      activeSubjects.map((sub: any) =>
        studentApi.searchTutors({ subjectId: sub.id, teachingLevel: 'All Levels' }).catch(() => []),
      ),
    )
    const flattened = results.flat()
    const tutorMap = new Map<number, TutorSearchResult & { allSubjects: string[] }>()

    flattened.forEach((t) => {
      if (!t || !t.tutorId) return
      if (tutorMap.has(t.tutorId)) {
        const existing = tutorMap.get(t.tutorId)!
        if (t.subjectName && !existing.allSubjects.includes(t.subjectName)) {
          existing.allSubjects.push(t.subjectName)
        }
      } else {
        tutorMap.set(t.tutorId, { ...t, allSubjects: t.subjectName ? [t.subjectName] : [] })
      }
    })

    const allCandidates = Array.from(tutorMap.values())

    // 2. KIỂM TRA TÍNH HỢP LỆ LINH HOẠT TỪ PROFILE CHÍNH THỨC
    // Lấy chi tiết từng gia sư để xác nhận họ có môn học đang hoạt động (đã được Admin duyệt)
    const verifiedTutors = await Promise.all(
      allCandidates.map(async (cand) => {
        try {
          const detail = await studentApi.getTutorById(cand.tutorId)
          // Gia sư đã được duyệt và hoạt động phải có ít nhất 1 môn học đang active
          const hasActiveSubject = Array.isArray(detail?.subjects) && detail.subjects.some((s) => s.isActive)
          return hasActiveSubject ? cand : null
        } catch {
          return null
        }
      }),
    )

    return verifiedTutors.filter(Boolean) as (TutorSearchResult & { allSubjects: string[] })[]
  },
  enabled: activeSubjects.length > 0,
})
  const filteredTutors = useMemo(() => {
    return rawTutors.filter((t: any) => {
      const matchName = searchName.trim()
        ? t.fullName?.toLowerCase().includes(searchName.toLowerCase()) : true
      const matchSubject = selectedSubjectId === 0 ? true : (() => {
        const subj = activeSubjects.find((s: any) => s.id === selectedSubjectId)
        return subj ? (t.allSubjects || []).includes(subj.name) || t.subjectId === selectedSubjectId : true
      })()
      const matchLevel = selectedLevel === 'Tất cả' ? true
        : t.teachingLevel?.toLowerCase().includes(selectedLevel.toLowerCase())
      return matchName && matchSubject && matchLevel
    })
  }, [rawTutors, searchName, selectedSubjectId, selectedLevel, activeSubjects])

  const levelOptions = ['Tất cả', 'Tiểu học', 'THCS', 'THPT', 'Đại học']

  return (
    <div className="space-y-6 pb-12">
      {/* BANNER */}
      {/* BANNER HỌC TẬP THỰC TẾ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 p-6 sm:p-8 lg:p-10 text-white shadow-2xl">
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
          
          {/* CỘT NỘI DUNG (Trái) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3.5 py-1.5 text-xs font-bold text-indigo-200 backdrop-blur-md">
              <Users className="h-3.5 w-3.5 text-amber-300" />
              <span>Đội ngũ Gia sư Chính thức — Đã Kiểm Duyệt</span>
            </div>
            
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-white leading-tight">
              Khám Phá Gia Sư Của Chúng Tôi
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Toàn bộ gia sư bên dưới đều là thành viên chính thức của hệ thống GiaSưConnect — đã được
              xét duyệt hồ sơ, bằng cấp chuyên môn và kinh nghiệm giảng dạy thực tế.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <Award className="h-4 w-4 text-amber-400" /> Bằng cấp được xác minh
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> Đánh giá thật từ học viên
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <BookOpen className="h-4 w-4 text-sky-400" /> Đa dạng môn học
              </span>
            </div>
          </div>

          {/* CỘT HÌNH ẢNH HỌC TẬP THỰC TẾ (Phải) */}
          <div className="relative hidden sm:block lg:col-span-5">
            <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl border-2 border-white/15 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop"
                alt="Buổi học kèm gia sư và học sinh"
                className="h-48 w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-56"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Thẻ nổi góc dưới ảnh */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2 text-[11px] backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-white">Buổi học tương tác 1:1</span>
                </div>
                <span className="font-extrabold text-amber-300">100% Uy tín</span>
              </div>
            </div>
          </div>

        </div>

        {/* Hiệu ứng nền nhẹ nhàng */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      </div>
      {/* BỘ LỌC */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tên gia sư..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value={0}>Tất cả môn học</option>
              {activeSubjects.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {levelOptions.map((lv) => (
                <option key={lv} value={lv}>{lv === 'Tất cả' ? 'Tất cả cấp độ' : lv}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          Đang hiển thị{' '}
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {isLoading ? '...' : filteredTutors.length}
          </span>{' '}
          gia sư trong hệ thống
        </p>
      </div>

      {/* LƯỚI THẺ GIA SƯ */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : filteredTutors.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <p className="font-bold text-slate-700 dark:text-slate-300">Không tìm thấy gia sư phù hợp</p>
          <p className="mt-1 text-xs text-slate-400">Hãy thử đổi bộ lọc hoặc xóa từ khóa tìm kiếm</p>
          <button
            onClick={() => { setSearchName(''); setSelectedSubjectId(0); setSelectedLevel('Tất cả') }}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
          >
            Xem tất cả gia sư
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTutors.map((tutor: any) => {
            const initial = tutor.fullName
              ? tutor.fullName.trim().split(' ').pop()?.charAt(0).toUpperCase() : 'G'
            const allSubjects: string[] = tutor.allSubjects || [tutor.subjectName].filter(Boolean)
            return (
              <div
                key={tutor.tutorId}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Ảnh / Avatar */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-50 dark:from-indigo-950/60 dark:via-purple-950/40 dark:to-slate-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl font-black text-white shadow-lg">
                      {initial}
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
                    {allSubjects.slice(0, 2).map((sub, i) => (
                      <span key={i} className="rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-bold text-indigo-700 shadow-sm backdrop-blur-md dark:bg-slate-900/90 dark:text-indigo-400">
                        {sub}
                      </span>
                    ))}
                    {allSubjects.length > 2 && (
                      <span className="rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-500 shadow-sm dark:bg-slate-900/90">
                        +{allSubjects.length - 2}
                      </span>
                    )}
                  </div>
                  {tutor.averageRating > 0 && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 shadow-sm backdrop-blur-md dark:bg-slate-900/90">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                        {tutor.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Nội dung */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-extrabold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                    {tutor.fullName}
                  </h3>
                  <p className="mt-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {tutor.qualification || 'Cử nhân'}
                  </p>
                  <p className="mt-2 line-clamp-2 flex-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {tutor.bio || 'Gia sư tận tâm, nhiều kinh nghiệm giảng dạy, cam kết giúp học viên đạt kết quả tốt nhất.'}
                  </p>
                  <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-[10px] font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-indigo-400" />
                      {tutor.experienceYears || 1} năm KN
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400" />
                      {tutor.reviewCount || 0} đánh giá
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Học phí / buổi</p>
                      <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {(tutor.feePerSessionCredits || 0).toLocaleString('vi-VN')}{' '}
                        <span className="text-[11px] font-bold">CR</span>
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/student/tutors/tutorDetail/${tutor.tutorId}`)}
                      className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-2 text-[11px] font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95"
                    >
                      Chi tiết <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
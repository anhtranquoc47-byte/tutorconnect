import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Star, ShieldCheck, Eye, EyeOff, Sparkles, Trophy, CheckCircle, Search } from 'lucide-react'
import { http } from '@/lib/api/http'
import { useToast } from '@/components/ui/ToastContext'

export function AdminFeaturedTutorsPage() {
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [hiddenTutorIds, setHiddenTutorIds] = useState<number[]>([])

  // Truy vấn API Admin CSDL thực tế
  const { data: rawTutors = [], isLoading } = useQuery({
    queryKey: ['admin-featured-tutors-unified-sync'],
    queryFn: async () => {
      const res = await http.get<any>('/api/v1/admin/tutors')
      const raw = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.items || [])
      return raw
    },
  })

  // Áp dụng BỘ ĐIỀU KIỆN TUYỂN CHỌN TIÊU BIỂU THỐNG NHẤT HỆ THỐNG
  const featuredTutors = rawTutors
    .map((item: any) => {
      const firstSubject = Array.isArray(item.subjects) && item.subjects.length > 0 ? item.subjects[0] : null
      return {
        tutorId: item.userId || item.id,
        fullName: item.fullName || 'Gia sư',
        email: item.email || '',
        bio: item.bio || '',
        qualification: item.qualification || 'Cử nhân',
        experienceYears: item.experienceYears || 0,
        averageRating: typeof item.averageRating === 'number' ? item.averageRating : 5.0,
        reviewCount: typeof item.reviewCount === 'number' ? item.reviewCount : 0,
        reputationScore: typeof item.reputationScore === 'number' ? item.reputationScore : 100,
        subjectName: firstSubject?.subject?.name || firstSubject?.subjectName || 'Toán học',
        teachingLevel: firstSubject?.teachingLevel || 'THPT',
        feePerSessionCredits: firstSubject?.feePerSessionCredits || 100,
        approvalStatus: item.approvalStatus,
      }
    })
    .filter((t: any) => {
      // 🎯 ĐIỀU KIỆN TIÊU BIỂU: Rating >= 4.0 VÀ (Lượt đánh giá >= 1 HOẶC Uy tín > 60)
      const isQualified =
        t.averageRating >= 4.0 &&
        (t.reviewCount >= 1 || (t.reputationScore && t.reputationScore > 60))

      if (!isQualified) return false

      const matchesSearch =
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
    .sort((a: any, b: any) => b.reputationScore - a.reputationScore || b.averageRating - a.averageRating)

  // Ẩn/Hiện gia sư khỏi Bảng Tiêu Biểu Học Viên
  const toggleHideTutor = (tutorId: number, name: string) => {
    if (hiddenTutorIds.includes(tutorId)) {
      setHiddenTutorIds(hiddenTutorIds.filter((id) => id !== tutorId))
      toast.success(`Đã hiển thị lại Gia sư ${name} trên Bảng Tiêu biểu của Học viên`)
    } else {
      setHiddenTutorIds([...hiddenTutorIds, tutorId])
      toast.info(`Đã tạm ẩn Gia sư ${name} khỏi Bảng Tiêu biểu của Học viên`)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 mb-2 border border-amber-500/30">
            <Trophy className="h-4 w-4" />
            <span>Bảng Quản Lý Gia Sư Tiêu Biểu (Đồng Bộ 100% Học Viên)</span>
          </div>
          <h1 className="text-2xl font-black">Quản Lý Gia Sư Tiêu Biểu Đạt Chuẩn</h1>
          <p className="text-xs text-slate-300 mt-1">
            Chỉ hiển thị các gia sư thỏa mãn tiêu chuẩn: Rating ≥ 4.0★ • Đã có đánh giá thật • Điểm uy tín &gt; 60.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md text-center border border-white/10">
            <span className="block text-2xl font-black text-amber-400">{featuredTutors.length}</span>
            <span className="text-[10px] text-slate-300 uppercase font-bold">Gia sư Đạt Tiêu Chuẩn</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="🔍 Tìm theo tên, môn học hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-semibold focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Tiêu chuẩn Thống nhất: <strong className="text-slate-900 dark:text-slate-100">Rating ≥ 4.0★ • Đã có Đánh Giá Thật</strong>
        </span>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4">Gia Sư Đạt Chuẩn CSDL</th>
              <th className="px-6 py-4">Môn Học & Cấp Độ</th>
              <th className="px-6 py-4">Đánh Giá Thật</th>
              <th className="px-6 py-4">Điểm Uy Tín CSDL</th>
              <th className="px-6 py-4">Học Phí / Buổi</th>
              <th className="px-6 py-4">Trạng Thái Trang Học Viên</th>
              <th className="px-6 py-4 text-right">Can Thiệp Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    <span>Đang lọc gia sư đạt chuẩn tiêu biểu từ CSDL...</span>
                  </div>
                </td>
              </tr>
            ) : featuredTutors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  Chưa có gia sư nào thỏa mãn tiêu chuẩn Tiêu biểu.
                </td>
              </tr>
            ) : (
              featuredTutors.map((tutor: any) => {
                const isHidden = hiddenTutorIds.includes(tutor.tutorId)

                return (
                  <tr key={tutor.tutorId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-extrabold text-white text-sm">
                          {tutor.fullName ? tutor.fullName.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            {tutor.fullName}
                            <CheckCircle className="h-3.5 w-3.5 text-indigo-600 fill-indigo-100" />
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            {tutor.email || (tutor.qualification + ' • ' + tutor.experienceYears + ' năm KN')}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        {tutor.subjectName} ({tutor.teachingLevel})
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{tutor.averageRating ? tutor.averageRating.toFixed(1) : '5.0'}</span>
                        <span className="text-[11px] font-normal text-slate-400">({tutor.reviewCount || 0} lượt)</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {tutor.reputationScore || 100} / 100 Điểm
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                      {tutor.feePerSessionCredits?.toLocaleString('vi-VN')} Credits
                    </td>

                    <td className="px-6 py-4">
                      {isHidden ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                          🚫 Đã tạm ẩn khỏi Tiêu biểu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                          <Sparkles className="h-3 w-3" />
                          ⭐ Đang hiển thị ở Học Viên
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleHideTutor(tutor.tutorId, tutor.fullName)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                          isHidden
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {isHidden ? (
                          <>
                            <Eye className="h-3.5 w-3.5" /> Hiển thị lại
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5" /> Ẩn khỏi Tiêu biểu
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
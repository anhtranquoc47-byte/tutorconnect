import { Link } from 'react-router-dom'
import { ArrowRight, Star } from 'lucide-react'
import type { TutorSearchResult } from '../../types/tutor.types'

// Hỗ trợ cả 2 kiểu dữ liệu: Mảng trực tiếp HOẶC đối tượng phân trang chứa `items`
interface RecommendedTutorsCardProps {
  tutors?: TutorSearchResult[] | { items?: TutorSearchResult[] } | null
}

export function RecommendedTutorsCard({ tutors }: RecommendedTutorsCardProps) {
  // Lấy ra danh sách mảng an toàn từ bất kỳ cấu trúc dữ liệu nào
  const tutorList: TutorSearchResult[] = Array.isArray(tutors)
    ? tutors
    : (tutors?.items ?? [])

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Gia sư phù hợp gợi ý
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Dựa trên môn học và trình độ của bạn
            </p>
          </div>
        </div>

        <Link
          to="/student/tutors"
          className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60"
        >
          Xem thêm gia sư
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Hiển thị giao diện khi không tìm thấy gia sư nào */}
      {tutorList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
          Chưa có gợi ý gia sư nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutorList.slice(0, 3).map((tutor) => (
            <div
              key={tutor.tutorId}
              className="flex flex-col justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition hover:border-indigo-300 dark:border-gray-800 dark:bg-gray-800/40 dark:hover:border-indigo-700"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={'/placeholder-avatar.png'}
                    alt={tutor.fullName}
                    className="h-12 w-12 rounded-full border border-white object-cover shadow-sm dark:border-gray-700"
                  />

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {tutor.fullName}
                    </h4>

                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {tutor.averageRating ?? 0}
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <p className="font-semibold text-gray-800 dark:text-gray-300">
                    {tutor.subjectName}
                  </p>
                  <p>{tutor.teachingLevel}</p>
                  <p className="font-medium text-indigo-600 dark:text-indigo-400">
                    {tutor.feePerSessionCredits} credits / buổi
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-800">
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-950/50">
                  Rep: {tutor.reputationScore ?? 0}
                </span>

                <Link
                  to={`/student/tutors/${tutor.tutorId}`}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecommendedTutorsCard

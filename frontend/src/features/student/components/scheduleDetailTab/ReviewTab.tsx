import React from 'react'
import { CheckCircle2, Loader2, Send, Star, UserCheck } from 'lucide-react'
import type { Review } from '../../types/review.types'

interface ReviewTabProps {
  rating: number
  setRating: React.Dispatch<React.SetStateAction<number>>
  hoverRating: number
  setHoverRating: React.Dispatch<React.SetStateAction<number>>
  reviewComment: string
  setReviewComment: React.Dispatch<React.SetStateAction<string>>
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void

  // Thêm props nhận thông tin review đã tồn tại
  myExistingReview?: Review | null
  tutorReview?: Review | null
  isLoadingReviews?: boolean
}

export default function ReviewTab({
  rating,
  setRating,
  hoverRating,
  setHoverRating,
  reviewComment,
  setReviewComment,
  isSubmitting,
  onSubmit,
  myExistingReview,
  tutorReview,
  isLoadingReviews,
}: ReviewTabProps) {
  // Hàm render số sao
  const renderStars = (currentRating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= currentRating
              ? 'fill-amber-400 text-amber-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
    </div>
  )

  if (isLoadingReviews) {
    return (
      <div className="mt-5 flex items-center justify-center gap-2 py-8 text-xs text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
        Đang kiểm tra thông tin đánh giá...
      </div>
    )
  }

  return (
    <div className="mt-5 space-y-6">
      {/* 1. HIỂN THỊ REVIEW TỪ GIA SƯ (NẾU CÓ) */}
      {tutorReview && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                Nhận xét từ gia sư ({tutorReview.reviewer?.fullName || 'Gia sư'})
              </span>
            </div>
            {renderStars(tutorReview.rating)}
          </div>
          <p className="text-xs text-gray-700 italic dark:text-gray-300">
            "{tutorReview.comment}"
          </p>
        </div>
      )}

      {/* 2. ĐÁNH GIÁ CỦA HỌC VIÊN */}
      {myExistingReview ? (
        /* TRƯỜNG HỢP A: ĐÃ ĐÁNH GIÁ -> HIỂN THỊ VÀ KHÓA CHỈNH SỬA */
        <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Bạn đã đánh giá buổi học này
            </div>
            {renderStars(myExistingReview.rating)}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
              Nhận xét của bạn:
            </label>
            <p className="rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
              {myExistingReview.comment}
            </p>
          </div>
        </div>
      ) : (
        /* TRƯỜNG HỢP B: CHƯA ĐÁNH GIÁ -> FORM TẠO REVIEW MỚI */
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold text-gray-700 dark:text-gray-300">
              Đánh giá gia sư (Số sao) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300">
              Nhận xét chi tiết <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Cảm nhận của bạn về buổi học và phương pháp giảng dạy..."
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 transition outline-none focus:border-amber-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Gửi Đánh Giá
          </button>
        </form>
      )}
    </div>
  )
}

import { useEffect, useState, type ReactNode } from 'react'
import {
  Star,
  MessageSquare,
  ShieldCheck,
  MessagesSquare,
  Clock,
  PauseCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react'
import { tutorProfileApi } from '@/apis/fe2/tutorProfile.api'
import { reviewApi } from '@/apis/fe2/review.api'
import { http } from '@/lib/api/http'
import type { TutorOwnerProfileResponse, TutorSubjectResponse, SubjectResponse } from '@/apis/fe2/tutorProfile.types'
import type { ReceivedReviewsPageResponse, ReviewResponse } from '@/apis/fe2/review.types'
import { ProfileInfoSection } from './ProfileInfoSection'
import { SubjectsSection } from './SubjectsSection'
import { getReputationLabel, tutorCard } from './profileTheme'

export function TutorProfileView() {
  const [profile, setProfile] = useState<TutorOwnerProfileResponse | null>(null)
  const [subjects, setSubjects] = useState<TutorSubjectResponse[]>([])
  const [allSubjects, setAllSubjects] = useState<SubjectResponse[]>([])
  const [reviews, setReviews] = useState<ReceivedReviewsPageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [profileData, subjectsData, allSubjectsData] = await Promise.all([
          tutorProfileApi.getMyProfile(),
          tutorProfileApi.getMySubjects(),
          http.get<SubjectResponse[]>('/api/v1/subjects').then((r) => r.data),
        ])
        setProfile(profileData)
        setSubjects(subjectsData)
        setAllSubjects(allSubjectsData)

        try {
          const reviewsData = await reviewApi.getMyReceivedReviews(1, 10)
          setReviews(reviewsData)
        } catch {
          // Fallback to profile stats if reviews API is unavailable
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center bg-[#0b0e14]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Đang tải hồ sơ gia sư...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[360px] items-center justify-center bg-[#0b0e14]">
        <div className="text-center">
          <p className="text-sm font-semibold text-white">{error ?? 'Không tìm thấy hồ sơ'}</p>
          <p className="mt-1 text-xs text-slate-400">Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
        </div>
      </div>
    )
  }

  const reviewStats = reviews
    ? reviews.summary
    : { averageRating: profile.averageRating, reviewCount: profile.reviewCount }
  const { averageRating, reviewCount } = reviewStats
  const latestReviews = reviews?.items.slice(0, 3) ?? []

  return (
    <div className="mx-auto min-h-full max-w-[1400px] py-2">
        <div className="grid grid-cols-12 items-start gap-5">
          {/* Left — Profile card */}
          <div className="col-span-12 lg:col-span-3">
            <ProfileInfoSection
              profile={profile}
              onUpdated={setProfile}
              averageRating={averageRating}
              reviewCount={reviewCount}
              reputationScore={profile.reputationScore}
            />
          </div>

          {/* Right — Title, stats, subjects, bottom panels */}
          <div className="col-span-12 space-y-5 lg:col-span-9">
            <div>
              <h1 className="text-2xl font-extrabold text-white sm:text-[1.65rem]">Hồ sơ Gia sư</h1>
              <p className="mt-1 text-sm text-slate-400">
                Quản lý thông tin hồ sơ và các môn học giảng dạy của bạn.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="ĐÁNH GIÁ TRUNG BÌNH"
                value={averageRating.toFixed(1)}
                subLabel={`${reviewCount} đánh giá`}
                icon={<Star className="h-[18px] w-[18px] fill-amber-400 text-amber-400" />}
                iconBg="bg-amber-500/10 border-amber-500/20"
              />
              <StatCard
                label="TỔNG ĐÁNH GIÁ"
                value={String(reviewCount)}
                subLabel={`${reviewCount} đánh giá`}
                icon={<MessageSquare className="h-[18px] w-[18px] text-sky-400" />}
                iconBg="bg-sky-500/10 border-sky-500/20"
              />
              <StatCard
                label="ĐIỂM UY TÍN"
                value={profile.reputationScore.toFixed(0)}
                subLabel={getReputationLabel(profile.reputationScore)}
                icon={<ShieldCheck className="h-[18px] w-[18px] text-violet-400" />}
                iconBg="bg-violet-500/10 border-violet-500/20"
              />
            </div>

            <SubjectsSection
              subjects={subjects}
              availableSubjects={allSubjects}
              onChanged={setSubjects}
            />

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 lg:col-span-7">
                <LatestReviewsPanel
                  reviews={latestReviews}
                  reviewCount={reviewCount}
                  totalPages={reviews?.totalPages ?? 0}
                />
              </div>
              <div className="col-span-12 lg:col-span-5">
                <RecentActivityPanel subjects={subjects} />
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  subLabel,
  icon,
  iconBg,
}: {
  label: string
  value: string
  subLabel: string
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
        <p className="mt-0.5 truncate text-[11px] text-slate-500">{subLabel}</p>
      </div>
    </div>
  )
}

function LatestReviewsPanel({
  reviews,
  reviewCount,
  totalPages,
}: {
  reviews: ReviewResponse[]
  reviewCount: number
  totalPages: number
}) {
  return (
    <div className={`${tutorCard} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <p className="text-sm font-bold text-white">Đánh giá mới nhất</p>
        {totalPages > 1 && (
          <button type="button" className="text-xs font-medium text-brand-400 transition hover:text-brand-300">
            Xem tất cả
          </button>
        )}
      </div>

      {reviewCount === 0 ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
            <MessagesSquare className="h-8 w-8 text-slate-600" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-slate-300">Chưa có đánh giá nào</p>
          <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-slate-500">
            Khi có học viên đánh giá, chúng sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-white/[0.05] px-2 py-2">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewItem({ review }: { review: ReviewResponse }) {
  const comment = review.comment?.trim()
  const initial = review.reviewer.fullName.charAt(0).toUpperCase()

  return (
    <div className="flex items-start gap-3 px-3 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-200">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-white">{review.reviewer.fullName}</p>
          <span className="shrink-0 text-[11px] text-slate-500">
            {formatRelativeTime(review.sessionStartTimeUtc)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
            />
          ))}
          <span className="ml-1.5 text-[11px] text-slate-500">{review.rating} sao</span>
        </div>
        {comment ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">{comment}</p>
        ) : (
          <p className="mt-1.5 text-xs italic text-slate-600">Không có nhận xét</p>
        )}
      </div>
    </div>
  )
}

function RecentActivityPanel({ subjects }: { subjects: TutorSubjectResponse[] }) {
  const paused = subjects.filter((s) => !s.isActive)
  const active = subjects.filter((s) => s.isActive)

  const activities: { title: string; time: string; icon: ReactNode; tone: string }[] = []

  if (paused[0]) {
    activities.push({
      title: `${paused[0].subject.name} đã được tạm dừng`,
      time: '2 giờ trước',
      icon: <PauseCircle className="h-4 w-4 text-orange-400" />,
      tone: 'bg-orange-500/10 border-orange-500/20',
    })
  }
  if (active[0]) {
    activities.push({
      title: `${active[0].subject.name} đã được cập nhật`,
      time: '5 giờ trước',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
      tone: 'bg-emerald-500/10 border-emerald-500/20',
    })
  }
  activities.push({
    title: 'Hồ sơ được tạo',
    time: '1 ngày trước',
    icon: <FileText className="h-4 w-4 text-brand-400" />,
    tone: 'bg-brand-500/10 border-brand-500/20',
  })

  return (
    <div className={`${tutorCard} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <p className="text-sm font-bold text-white">Hoạt động gần đây</p>
        <button type="button" className="text-xs font-medium text-brand-400 transition hover:text-brand-300">
          Xem tất cả
        </button>
      </div>

      <div className="space-y-1 px-3 py-3">
        {activities.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition hover:bg-white/[0.02]"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${item.tone}`}>
              {item.icon}
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-xs font-medium leading-snug text-slate-200">{item.title}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="h-3 w-3" />
                {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatRelativeTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60_000)
  if (diffMinutes < 1) return 'Vừa xong'
  if (diffMinutes < 60) return `${diffMinutes} phút trước`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays} ngày trước`

  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}


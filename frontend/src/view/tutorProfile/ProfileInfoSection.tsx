import { useState, type ReactNode } from 'react'
import {
  Pencil,
  Star,
  Briefcase,
  GraduationCap,
  User,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { tutorProfileApi } from '@/apis/fe2/tutorProfile.api'
import type { TutorApprovalStatus, TutorOwnerProfileResponse } from '@/apis/fe2/tutorProfile.types'
import { getRankBadge, tutorCard } from './profileTheme'

interface Props {
  profile: TutorOwnerProfileResponse
  onUpdated: (updated: TutorOwnerProfileResponse) => void
  averageRating?: number
  reviewCount?: number
  reputationScore?: number
}

const APPROVAL_LABELS: Record<TutorApprovalStatus, { label: string; color: string }> = {
  Draft: { label: 'Nháp', color: 'bg-slate-500/10 text-slate-300 border-slate-500/20' },
  Pending: { label: 'Đang chờ duyệt', color: 'bg-yellow-500/10 text-yellow-200 border-yellow-500/20' },
  Approved: { label: 'Đã duyệt', color: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20' },
  Rejected: { label: 'Từ chối', color: 'bg-rose-500/10 text-rose-200 border-rose-500/20' },
  Suspended: { label: 'Tạm khóa', color: 'bg-orange-500/10 text-orange-200 border-orange-500/20' },
}

const NUMERIC_APPROVAL_STATUS: Record<number, TutorApprovalStatus> = {
  1: 'Draft',
  2: 'Pending',
  3: 'Approved',
  4: 'Rejected',
  5: 'Suspended',
}

function normalizeApprovalStatus(status: TutorOwnerProfileResponse['approvalStatus']): TutorApprovalStatus {
  if (typeof status === 'number') return NUMERIC_APPROVAL_STATUS[status] ?? 'Draft'
  if (status in APPROVAL_LABELS) return status
  return 'Draft'
}

export function ProfileInfoSection({
  profile,
  onUpdated,
  averageRating,
  reviewCount,
  reputationScore = 50,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    bio: profile.bio ?? '',
    qualification: profile.qualification ?? '',
    experienceYears: profile.experienceYears,
    verificationDocumentUrl: profile.verificationDocumentUrl ?? '',
  })

  const approvalStatus = normalizeApprovalStatus(profile.approvalStatus)
  const approval = APPROVAL_LABELS[approvalStatus]
  const displayRating = averageRating ?? profile.averageRating
  const displayReviewCount = reviewCount ?? profile.reviewCount
  const rankLabel = getRankBadge(reputationScore)

  function handleChange(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

    async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const updated = await tutorProfileApi.updateMyProfile({
        bio: form.bio,
        qualification: form.qualification,
        experienceYears: Number(form.experienceYears),
        verificationDocumentUrl: form.verificationDocumentUrl || undefined,
      })
      onUpdated(updated)
      setEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const updated = await tutorProfileApi.submitMyProfile()
      onUpdated(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`${tutorCard} overflow-hidden`}>
      {/* Blue glow header */}
      <div className="relative overflow-hidden border-b border-white/[0.06] bg-gradient-to-b from-brand-600/20 via-brand-600/5 to-transparent px-6 pb-5 pt-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/60 to-transparent" />
        <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-2xl font-extrabold text-white shadow-[0_0_24px_rgba(59,130,246,0.35)]">
          {profile.fullName.charAt(0).toUpperCase()}
        </div>

        <div className="mt-4 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-base font-extrabold text-white">{profile.fullName}</p>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
                  aria-label="Chỉnh sửa hồ sơ"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              <span className="text-[11px] font-semibold text-brand-200">{rankLabel}</span>
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <StarRating rating={displayRating} />
              <span className="text-[11px] text-slate-500">({displayReviewCount} đánh giá)</span>
            </div>
          </div>
        </div>

        {approvalStatus !== 'Approved' && (
          <div className="mt-3">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${approval.color}`}>
              {approval.label}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4 px-5 py-5">
        {editing ? (
          <div className="space-y-4">
            <Field label="Giới thiệu bản thân">
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Chia sẻ đôi nét về bạn..."
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#0b0e14] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </Field>
                      <Field label="Trình độ giảng dạy">
              <Input
                value={form.qualification}
                onChange={(e) => handleChange('qualification', e.target.value)}
                placeholder="Ví dụ: Kỹ sư / Cử nhân / Thạc sĩ..."
                autoComplete="off"
                className="!bg-[#0b0e14] !text-white border-white/20 placeholder:text-slate-500"
              />
            </Field>
            <Field label="Số năm kinh nghiệm">
              <Input
                type="number"
                min={0}
                max={50}
                value={form.experienceYears}
                onChange={(e) => handleChange('experienceYears', e.target.value)}
                autoComplete="off"
                className="!bg-[#0b0e14] !text-white border-white/20 placeholder:text-slate-500"
              />
            </Field>
            <Field label="Tài liệu xác minh (không bắt buộc)">
              <Input
                value={form.verificationDocumentUrl}
                onChange={(e) => handleChange('verificationDocumentUrl', e.target.value)}
                placeholder="https://drive.google.com/..."
                autoComplete="off"
                className="!bg-[#0b0e14] !text-white border-white/20 placeholder:text-slate-500"
              />
            </Field>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} loading={saving} size="sm">
                Lưu thay đổi
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setEditing(false); setError(null) }}
                disabled={saving}
              >
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <InfoRow
              icon={<Briefcase className="h-4 w-4 text-slate-500" />}
              label="KINH NGHIỆM"
              value={profile.experienceYears > 0 ? `${profile.experienceYears} năm` : 'Chưa cập nhật'}
            />
            <InfoRow
              icon={<GraduationCap className="h-4 w-4 text-slate-500" />}
              label="TRÌNH ĐỘ GIẢNG DẠY"
              value={profile.qualification?.trim() ? profile.qualification : 'Chưa cập nhật'}
            />
            <InfoRow
              icon={<User className="h-4 w-4 text-slate-500" />}
              label="GIỚI THIỆU BẢN THÂN"
              value={profile.bio?.trim() ? profile.bio : 'Chưa cập nhật giới thiệu.'}
              multiline
            />
            {profile.reviewNote && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="mb-1 text-xs font-semibold text-amber-200">Ghi chú quản trị</p>
                <p className="text-xs text-amber-100">{profile.reviewNote}</p>
              </div>
            )}
          </div>
        )}

        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]"
          >
            <Pencil className="h-4 w-4" />
            Chỉnh sửa hồ sơ
          </button>
        )}

        {!editing && (approvalStatus === 'Draft' || approvalStatus === 'Rejected') && (
          <div className="border-t border-white/[0.06] pt-4">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white">Gửi hồ sơ để duyệt</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                  Sau khi gửi, quản trị sẽ xem xét trước khi hồ sơ công khai.
                </p>
              </div>
              <Button onClick={handleSubmit} loading={submitting} size="sm" className="shrink-0">
                Gửi
              </Button>
            </div>
            {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-300">{label}</label>
      {children}
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
  multiline,
}: {
  icon: ReactNode
  label: string
  value: ReactNode
  multiline?: boolean
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className={`mt-0.5 text-xs text-slate-300 ${multiline ? 'leading-relaxed whitespace-pre-wrap' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rounded ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
        />
      ))}
    </div>
  )
}

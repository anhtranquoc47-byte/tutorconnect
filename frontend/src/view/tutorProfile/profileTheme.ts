/** Shared dark-theme tokens for tutor profile pages (matches giaodienprofile.png). */
export const tutorCard =
  'rounded-2xl border border-white/[0.08] bg-[#151921]/90 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.24)]'

export const tutorCardInner =
  'rounded-xl border border-white/[0.06] bg-white/[0.03]'

export const tutorMuted = 'text-slate-400'
export const tutorText = 'text-slate-100'

export function getReputationLabel(score: number) {
  if (score >= 90) return 'Hạng: Xuất sắc'
  if (score >= 70) return 'Hạng: Nâng cao'
  if (score >= 50) return 'Hạng: Mới bắt đầu'
  return 'Hạng: Cần cải thiện'
}

export function getRankBadge(score: number) {
  if (score >= 90) return 'Xuất sắc'
  if (score >= 70) return 'Nâng cao'
  if (score >= 50) return 'Mới bắt đầu'
  return 'Cần cải thiện'
}

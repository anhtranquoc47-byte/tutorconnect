export const ComplaintStatus = {
  Open: 1,
  InReview: 2,
  Resolved: 3,
  Rejected: 4,
} as const

export type ComplaintStatus = (typeof ComplaintStatus)[keyof typeof ComplaintStatus]

export const TutorApprovalStatus = {
  Draft: 1,
  Pending: 2,
  Approved: 3,
  Rejected: 4,
  Suspended: 5,
} as const

export type TutorApprovalStatus =
  (typeof TutorApprovalStatus)[keyof typeof TutorApprovalStatus]

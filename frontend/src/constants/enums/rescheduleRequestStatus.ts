export const RescheduleRequestStatus = {
  Pending: 1,
  Accepted: 2,
  Rejected: 3,
  Cancelled: 4,
} as const

export type RescheduleRequestStatus =
  (typeof RescheduleRequestStatus)[keyof typeof RescheduleRequestStatus]

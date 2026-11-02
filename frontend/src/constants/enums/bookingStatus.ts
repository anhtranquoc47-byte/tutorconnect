export const BookingStatus = {
  Pending: 1,
  Confirmed: 2,
  Rejected: 3,
  Cancelled: 4,
  Completed: 5,
} as const

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus]

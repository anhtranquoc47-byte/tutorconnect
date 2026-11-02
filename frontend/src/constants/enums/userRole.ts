export const UserRole = {
  Admin: 1,
  Tutor: 2,
  Student: 3,
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const UserStatus = {
  Active: 1,
  Locked: 2,
  Inactive: 3,
} as const

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

export type Role = 'Admin' | 'Tutor' | 'Student'
export type UserStatus = 'Active' | 'Inactive' | 'Locked'

export interface ApiResponse<T> {
  message: string
  data: T
  code: number
}

export interface User {
  id: number
  email: string
  fullName: string
  phone: string | null
  role: number
  status: number
  timeZoneId: string
}

export interface UserLite {
  id: number
  fullName: string
  role: Role
}

export interface UserReputationSummary {
  averageRating: number
  reviewCount: number
  reputationScore: number
}

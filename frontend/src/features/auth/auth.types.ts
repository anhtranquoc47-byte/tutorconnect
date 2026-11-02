export type UserRole = 'student' | 'tutor' | 'admin'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
  status: 'active' | 'locked' | 'inactive'
  timeZoneId?: string
}


export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterStudentPayload {
  name: string
  email: string
  password: string
  phone: string
}

export interface RegisterTutorPayload {
  name: string
  email: string
  password: string
  phone: string

}

export interface LoginResponse {
  accessToken: string
  refreshToken?: string
  expiresIn?: string 
  user: AuthUser
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}
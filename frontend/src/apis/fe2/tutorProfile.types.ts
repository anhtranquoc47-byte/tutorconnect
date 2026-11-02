export type TutorApprovalStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Suspended'

export interface SubjectResponse {
  id: number
  code: string
  name: string
  description?: string
  isActive: boolean
}

export interface TutorSubjectSummaryResponse {
  id: number
  subject: SubjectResponse
  teachingLevel: string
  feePerSessionCredits: number
  isActive: boolean
}

export interface TutorOwnerProfileResponse {
  userId: number
  fullName: string
  bio?: string
  qualification?: string
  experienceYears: number
  averageRating: number
  reviewCount: number
  reputationScore: number
  subjects: TutorSubjectSummaryResponse[]
  phone?: string
  verificationDocumentUrl?: string
  /** API may return enum as string or numeric value (1=Draft … 5=Suspended). */
  approvalStatus: TutorApprovalStatus | number
  reviewNote?: string
  submittedAtUtc?: string
  reviewedAtUtc?: string
}

export interface TutorProfileUpdateRequest {
  bio: string
  qualification: string
  experienceYears: number
  verificationDocumentUrl?: string
}

export interface TutorSubjectResponse {
  id: number
  tutorId: number
  subject: SubjectResponse
  teachingLevel: string
  feePerSessionCredits: number
  isActive: boolean
}

export interface TutorSubjectCreateRequest {
  subjectId: number
  teachingLevel: string
  feePerSessionCredits: number
}

export interface TutorSubjectUpdateRequest {
  feePerSessionCredits: number
}

export interface TutorSubjectStatusRequest {
  isActive: boolean
}

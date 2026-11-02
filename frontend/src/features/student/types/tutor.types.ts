export interface TutorSubject {
  id: number
  subject: {
    id: number
    code: string
    name: string
    description: string
    isActive: boolean
  }
  teachingLevel: string
  feePerSessionCredits: number
  isActive: boolean
}

export interface TutorDetail {
  userId: number
  fullName: string
  bio: string
  qualification: string
  experienceYears: number
  averageRating: number
  reviewCount: number
  reputationScore: number
  subjects: TutorSubject[]
}

export interface MatchedAvailability {
  startTimeUtc: string
  endTimeUtc: string
}

export interface TutorSearchResult {
  tutorId: number
  fullName: string
  bio: string
  qualification: string
  experienceYears: number
  subjectId: number
  subjectName: string
  teachingLevel: string
  feePerSessionCredits: number
  averageRating: number
  reviewCount: number
  matchingScore: number
  matchedAvailability: MatchedAvailability | null
  reputationScore: number
}
export interface TutorAvailability {
  id: number
  tutorId: number
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

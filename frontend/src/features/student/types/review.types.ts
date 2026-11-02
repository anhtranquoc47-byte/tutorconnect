export interface Reviewer {
  id: number
  fullName: string
  role: number
}

export interface CreateReviewRequest {
  rating: number
  comment: string
}

export interface Review {
  id: number
  bookingId: number
  reviewer: Reviewer
  rating: number
  comment: string
  sessionStartTimeUtc: string
}

export interface ReviewSummary {
  averageRating: number
  reviewCount: number
  reputationScore: number
}

export interface ReviewListData {
  summary: ReviewSummary
  items: Review[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ApiResponse<T> {
  message: string
  data: T
  code: number
}

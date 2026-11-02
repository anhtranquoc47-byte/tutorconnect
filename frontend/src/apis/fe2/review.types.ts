export interface UserLiteResponse {
  id: number
  fullName: string
  role: string | number
}

export interface ReviewResponse {
  id: number
  bookingId: number
  reviewer: UserLiteResponse
  rating: number
  comment?: string | null
  sessionStartTimeUtc: string
}

export interface UserReputationSummaryResponse {
  averageRating: number
  reviewCount: number
  reputationScore: number
}

export interface ReceivedReviewsPageResponse {
  summary: UserReputationSummaryResponse
  items: ReviewResponse[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

type RawRecord = Record<string, unknown>

function readNumber(raw: RawRecord | undefined, camel: string, pascal: string, fallback = 0) {
  const value = raw?.[camel] ?? raw?.[pascal]
  return typeof value === 'number' ? value : Number(value ?? fallback)
}

function readString(raw: RawRecord | undefined, camel: string, pascal: string, fallback = '') {
  const value = raw?.[camel] ?? raw?.[pascal]
  return typeof value === 'string' ? value : fallback
}

function normalizeReviewer(raw: unknown): UserLiteResponse {
  const obj = (raw ?? {}) as RawRecord
  return {
    id: readNumber(obj, 'id', 'Id'),
    fullName: readString(obj, 'fullName', 'FullName', 'Học viên'),
    role: (obj.role ?? obj.Role ?? 'student') as string | number,
  }
}

function normalizeReview(raw: unknown): ReviewResponse {
  const obj = (raw ?? {}) as RawRecord
  return {
    id: readNumber(obj, 'id', 'Id'),
    bookingId: readNumber(obj, 'bookingId', 'BookingId'),
    reviewer: normalizeReviewer(obj.reviewer ?? obj.Reviewer),
    rating: readNumber(obj, 'rating', 'Rating'),
    comment: (obj.comment ?? obj.Comment ?? null) as string | null | undefined,
    sessionStartTimeUtc: readString(obj, 'sessionStartTimeUtc', 'SessionStartTimeUtc'),
  }
}

function normalizeSummary(raw: unknown): UserReputationSummaryResponse {
  const obj = (raw ?? {}) as RawRecord
  return {
    averageRating: readNumber(obj, 'averageRating', 'AverageRating'),
    reviewCount: readNumber(obj, 'reviewCount', 'ReviewCount'),
    reputationScore: readNumber(obj, 'reputationScore', 'ReputationScore'),
  }
}

/** Normalize BE payload (camelCase or PascalCase) into a stable FE shape. */
export function normalizeReceivedReviews(raw: unknown): ReceivedReviewsPageResponse {
  const obj = (raw ?? {}) as RawRecord
  const summaryRaw = obj.summary ?? obj.Summary
  const itemsRaw = (obj.items ?? obj.Items ?? []) as unknown[]

  return {
    summary: normalizeSummary(summaryRaw),
    items: itemsRaw.map(normalizeReview),
    pageNumber: readNumber(obj, 'pageNumber', 'PageNumber', 1),
    pageSize: readNumber(obj, 'pageSize', 'PageSize', 10),
    totalItems: readNumber(obj, 'totalItems', 'TotalItems'),
    totalPages: readNumber(obj, 'totalPages', 'TotalPages'),
  }
}

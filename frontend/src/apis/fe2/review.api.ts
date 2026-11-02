import { http } from '@/lib/api/http'
import { normalizeReceivedReviews, type ReceivedReviewsPageResponse } from './review.types'

function unwrapApiPayload(raw: unknown): unknown {
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if ('data' in obj && 'code' in obj) return obj.data
    if ('Data' in obj && 'Code' in obj) return obj.Data
  }
  return raw
}

export const reviewApi = {
  getMyReceivedReviews(page = 1, pageSize = 10): Promise<ReceivedReviewsPageResponse> {
    return http
      .get<unknown>('/api/v1/reviews/me/received', {
        params: { page, pageSize },
      })
      .then((r) => normalizeReceivedReviews(unwrapApiPayload(r.data)))
  },
}

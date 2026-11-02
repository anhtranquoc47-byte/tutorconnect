import { http } from '@/lib/api/http'
import type {
  TutorAvailabilityResponse,
  AvailabilityCreateRequest,
  AvailabilityUpdateRequest,
  AvailabilityStatusRequest,
} from './tutorAvailability.types'

export const tutorAvailabilityApi = {
  getMyAvailabilities(): Promise<TutorAvailabilityResponse[]> {
    return http.get<TutorAvailabilityResponse[]>('/api/v1/tutors/me/availabilities').then((r) => r.data)
  },

  createAvailability(payload: AvailabilityCreateRequest): Promise<TutorAvailabilityResponse> {
    return http.post<TutorAvailabilityResponse>('/api/v1/tutors/me/availabilities', payload).then((r) => r.data)
  },

  updateAvailability(
    availabilityId: number,
    payload: AvailabilityUpdateRequest,
  ): Promise<TutorAvailabilityResponse> {
    return http
      .put<TutorAvailabilityResponse>(`/api/v1/tutors/me/availabilities/${availabilityId}`, payload)
      .then((r) => r.data)
  },

  setAvailabilityStatus(
    availabilityId: number,
    payload: AvailabilityStatusRequest,
  ): Promise<TutorAvailabilityResponse> {
    return http
      .put<TutorAvailabilityResponse>(`/api/v1/tutors/me/availabilities/${availabilityId}/status`, payload)
      .then((r) => r.data)
  },
}

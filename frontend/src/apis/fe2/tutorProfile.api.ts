import { http } from '@/lib/api/http'
import type {
  TutorOwnerProfileResponse,
  TutorProfileUpdateRequest,
  TutorSubjectResponse,
  TutorSubjectCreateRequest,
  TutorSubjectUpdateRequest,
  TutorSubjectStatusRequest,
} from './tutorProfile.types'

export const tutorProfileApi = {
  getMyProfile(): Promise<TutorOwnerProfileResponse> {
    return http.get<TutorOwnerProfileResponse>('/api/v1/tutors/me').then((r) => r.data)
  },

  updateMyProfile(payload: TutorProfileUpdateRequest): Promise<TutorOwnerProfileResponse> {
    return http.put<TutorOwnerProfileResponse>('/api/v1/tutors/me', payload).then((r) => r.data)
  },

  submitMyProfile(): Promise<TutorOwnerProfileResponse> {
    return http.post<TutorOwnerProfileResponse>('/api/v1/tutors/me/submit').then((r) => r.data)
  },

  getMySubjects(): Promise<TutorSubjectResponse[]> {
    return http.get<TutorSubjectResponse[]>('/api/v1/tutors/me/subjects').then((r) => r.data)
  },

  createSubject(payload: TutorSubjectCreateRequest): Promise<TutorSubjectResponse> {
    return http.post<TutorSubjectResponse>('/api/v1/tutors/me/subjects', payload).then((r) => r.data)
  },

  updateSubject(tutorSubjectId: number, payload: TutorSubjectUpdateRequest): Promise<TutorSubjectResponse> {
    return http
      .put<TutorSubjectResponse>(`/api/v1/tutors/me/subjects/${tutorSubjectId}`, payload)
      .then((r) => r.data)
  },

  setSubjectStatus(tutorSubjectId: number, payload: TutorSubjectStatusRequest): Promise<TutorSubjectResponse> {
    return http
      .put<TutorSubjectResponse>(`/api/v1/tutors/me/subjects/${tutorSubjectId}/status`, payload)
      .then((r) => r.data)
  },
}

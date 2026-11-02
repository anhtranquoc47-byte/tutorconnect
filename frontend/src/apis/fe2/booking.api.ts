import { http } from '@/lib/api/http'
import type {
  BookingResponse,
  BookingCreateRequest,
  ConfirmBookingRequest,
  RejectBookingRequest,
  CancelBookingRequest,
  UpdateMeetingUrlRequest,
  CompleteBookingRequest,
  CompleteBookingResult,
  BookingStatus,
} from './booking.types'
import { normalizeBooking } from './booking.types'

export const bookingApi = {
  getMyBookings(status?: BookingStatus): Promise<BookingResponse[]> {
    const params = status ? `?status=${status}` : ''
    return http.get<BookingResponse[]>(`/api/v1/bookings${params}`).then((r) =>
      r.data.map(normalizeBooking),
    )
  },

  getBookingById(bookingId: number): Promise<BookingResponse> {
    return http.get<BookingResponse>(`/api/v1/bookings/${bookingId}`).then((r) =>
      normalizeBooking(r.data),
    )
  },

  createBooking(payload: BookingCreateRequest): Promise<BookingResponse> {
    return http.post<BookingResponse>('/api/v1/bookings', payload).then((r) => normalizeBooking(r.data))
  },

  confirmBooking(bookingId: number, payload?: ConfirmBookingRequest): Promise<{ message: string }> {
    return http.put<{ message: string }>(`/api/v1/bookings/${bookingId}/confirm`, payload ?? {}).then((r) => r.data)
  },

  rejectBooking(bookingId: number, payload: RejectBookingRequest): Promise<{ message: string }> {
    return http.put<{ message: string }>(`/api/v1/bookings/${bookingId}/reject`, payload).then((r) => r.data)
  },

  cancelBooking(bookingId: number, payload: CancelBookingRequest): Promise<{ message: string }> {
    return http.post<{ message: string }>(`/api/v1/bookings/${bookingId}/cancel`, payload).then((r) => r.data)
  },

  updateMeetingUrl(bookingId: number, payload: UpdateMeetingUrlRequest): Promise<{ message: string }> {
    return http.put<{ message: string }>(`/api/v1/bookings/${bookingId}/meeting-url`, payload).then((r) => r.data)
  },

  completeBooking(bookingId: number, payload?: CompleteBookingRequest): Promise<CompleteBookingResult | { message: string }> {
    return http.post<CompleteBookingResult | { message: string }>(`/api/v1/bookings/${bookingId}/complete`, payload ?? {}).then((r) => r.data)
  },
}

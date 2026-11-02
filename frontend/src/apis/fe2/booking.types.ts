export type BookingStatus = 'Pending' | 'Confirmed' | 'Rejected' | 'Cancelled' | 'Completed'

// BE serializes BookingStatus enum as integer (1-5), not string
const BOOKING_STATUS_MAP: Record<number, BookingStatus> = {
  1: 'Pending',
  2: 'Confirmed',
  3: 'Rejected',
  4: 'Cancelled',
  5: 'Completed',
}

export function normalizeBookingStatus(raw: BookingStatus | number): BookingStatus {
  if (typeof raw === 'number') return BOOKING_STATUS_MAP[raw] ?? 'Pending'
  return raw
}

export function normalizeBooking(raw: BookingResponse): BookingResponse {
  return { ...raw, status: normalizeBookingStatus(raw.status as BookingStatus | number) }
}

export interface BookingResponse {
  id: number
  studentId: number
  tutorSubjectId: number
  startTimeUtc: string
  endTimeUtc: string
  creditCost: number
  status: BookingStatus
  studentNote?: string
  meetingUrl?: string
  statusReason?: string
  cancelledByUserId?: number
  subjectName?: string 
  studentName?: string
}

export interface BookingCreateRequest {
  tutorSubjectId: number
  startTimeUtc: string
  endTimeUtc: string
  creditCost: number
  studentNote?: string
}

export interface ConfirmBookingRequest {
  meetingUrl?: string
}

export interface RejectBookingRequest {
  reason: string
}

export interface CancelBookingRequest {
  reason: string
}

export interface UpdateMeetingUrlRequest {
  meetingUrl: string
}

export interface CompleteBookingRequest {
  learningGoalId: number
  score?: number
  maxScore?: number
  goalProgressPercent: number
  tutorComment: string
}

export interface SessionProgressResponse {
  bookingId: number
  learningGoalId: number
  score?: number
  maxScore?: number
  goalProgressPercent: number
  tutorComment: string
}

export interface CompleteBookingResult {
  booking: BookingResponse
  sessionProgress: SessionProgressResponse
}

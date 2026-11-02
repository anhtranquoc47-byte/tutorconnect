export type BookingStatus =
  'Pending' | 'Confirmed' | 'Rejected' | 'Cancelled' | 'Completed'

export interface Booking {
  id: number
  studentId: number
  tutorSubjectId: number
  startTimeUtc: string
  endTimeUtc: string
  creditCost: number
  status: BookingStatus
  studentNote: string | null
  meetingUrl: string | null
  statusReason: string | null
  cancelledByUserId: number | null
    subjectName?: string | null
  tutorName?: string | null
    studentRating?: number | null
  studentReviewComment?: string | null
}
export interface ConfirmBookingPayload {
  meetingUrl: string
}

export interface RejectBookingPayload {
  reason: string
}

export interface CancelBookingPayload {
  reason: string
}

export interface UpdateMeetingUrlPayload {
  meetingUrl: string
}

export interface RescheduleBookingPayload {
  proposedStartTimeUtc: string
  proposedEndTimeUtc: string
  reason: string
}

export interface UpdateRescheduleStatusPayload {
  status: number // 1: Approve, 2: Reject, v.v.
  responseNote: string
}

export interface CompleteBookingPayload {
  learningGoalId: number
  score: number
  maxScore: number
  goalProgressPercent: number
  tutorComment: string
}
export interface CreateBookingRequest {
  tutorSubjectId: number
  startTimeUtc: string
  endTimeUtc: string
  creditCost: number
  studentNote?: string
}

export interface ApiResponse<T> {
  message: string
  data: T
  code: number
}

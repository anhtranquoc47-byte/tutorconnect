export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface TutorAvailabilityResponse {
  id: number
  tutorId: number
  dayOfWeek: DayOfWeek
  startTime: string // "HH:mm:ss"
  endTime: string   // "HH:mm:ss"
  isActive: boolean
}

export interface AvailabilityCreateRequest {
  dayOfWeek: DayOfWeek
  startTime: string // "HH:mm:ss"
  endTime: string   // "HH:mm:ss"
}

export interface AvailabilityUpdateRequest {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
}

export interface AvailabilityStatusRequest {
  isActive: boolean
}

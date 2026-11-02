export interface ComplaintUser {
  id: number
  fullName: string
  role: number
}

export interface Complaint {
  id: number
  createdBy: ComplaintUser
  againstUser: ComplaintUser
  bookingId: number
  type: string
  description: string
  evidenceUrl: string | null
  status: number
  adminResponse: string | null
  resolvedByAdmin: ComplaintUser | null
  submittedAtUtc: string
  resolvedAtUtc: string | null
}

export interface ComplaintCreateRequest {
  againstUserId: number
  bookingId: number
  type: string
  description: string
  evidenceUrl?: string
}

export interface PagedComplaints {
  items: Complaint[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

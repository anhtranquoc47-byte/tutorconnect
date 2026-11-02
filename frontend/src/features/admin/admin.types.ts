export type TutorApplicationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended'
export type SubjectStatus = 'active' | 'inactive'
export type ComplaintStatus = 'open' | 'in_review' | 'resolved' | 'rejected'

export interface DashboardStats {
  period: { fromUtc: string; toUtc: string }
  periodMetrics: {
    bookingStatistics: { total: number; pending: number; confirmed: number; completed: number; cancelled: number; rejected: number }
    popularSubjects: { subjectId: number; subjectName: string; bookingCount: number }[]
  }
  currentSnapshot: {
    goalCompletionRate: { completedGoals: number; eligibleGoals: number; ratePercent: number }
    pendingTutorApprovals: number
    openComplaints: number
  }
}

export interface TutorApplication {
  id: string
  fullName: string
  email: string
  phone: string
  avatar?: string
  qualification: string
  experienceYears: number
  subjects: string[]
  bio: string
  degrees: { name: string; url: string; verified: boolean }[]
  createdAt: string
  status: TutorApplicationStatus
  rejectionReason?: string
}

export interface Subject {
  id: string
  code: string
  name: string
  description: string
  status: SubjectStatus
}

export interface Complaint {
  id: string
  complainantName: string
  complainantRole: 'student' | 'tutor'
  targetName: string
  type: string
  content: string
  status: ComplaintStatus
  createdAt: string
  resolutionNotes?: string
  resolvedAt?: string | null
  evidenceUrl?: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'student' | 'tutor' | 'admin'
  status: 'active' | 'locked' | 'inactive'
  timeZoneId?: string
}
export type RiskSeverity = 'critical' | 'warning'

export interface RiskViolationRule {
  code: string
  label: string
  details: string
}

export interface RiskWatchitem {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  userRole: 'tutor' | 'student'
  severity: RiskSeverity
  violations: RiskViolationRule[]
  userStatus: 'active' | 'locked' | 'inactive'
  detectedAt: string
}

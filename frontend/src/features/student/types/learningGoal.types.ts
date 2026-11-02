export interface LearningGoal {
  id: number
  student: LearningGoalUser
  tutorSubjectId: number
  tutor: LearningGoalUser
  subject: SubjectInfo
  title: string
  description: string
  targetDate: string
  status: number
  currentProgressPercent: number
  milestones?: Milestone[]
}

export interface LearningGoalUser {
  id: number
  fullName: string
  role: number
}

export interface SubjectInfo {
  id: number
  code: string
  name: string
  description: string
  isActive: boolean
}

export interface Milestone {
  id: number
  learningGoalId: number
  title: string
  description?: string
  targetDate: string
  orderNumber: number
  status: number
}

export interface CreateLearningGoalRequest {
  studentId: number
  tutorSubjectId: number
  title: string
  description: string
  targetDate: string
}

export interface UpdateLearningGoalRequest {
  title: string
  description: string
  targetDate: string
}

export interface CreateMilestoneRequest {
  title: string
  description: string
  targetDate: string
  orderNumber: number
}

export interface UpdateMilestoneRequest {
  title: string
  description: string
  targetDate: string
  orderNumber: number
}

export interface UpdateMilestoneStatusRequest {
  status: number
}

export const LearningStatus = {
  NotStarted: 1,
  InProgress: 2,
  Completed: 3,
  Cancelled: 4,
} as const

export type LearningStatus = (typeof LearningStatus)[keyof typeof LearningStatus]

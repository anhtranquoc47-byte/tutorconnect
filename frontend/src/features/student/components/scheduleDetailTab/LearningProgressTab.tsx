import React, { useState } from 'react'
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Loader2,
  Pencil,
  Check,
  X,
  Target,
  Calendar,
  XCircle,
} from 'lucide-react'

import type {
  LearningGoal,
  Milestone,
  CreateLearningGoalRequest,
  CreateMilestoneRequest,
  UpdateLearningGoalRequest,
  UpdateMilestoneRequest,
} from '@/features/student/types/learningGoal.types'
import { BookingStatus } from '@/constants/enums'

interface LearningProgressTabProps {
  booking?: any
  goals: LearningGoal[]
  bookingGoals: LearningGoal[]
  selectedGoal: LearningGoal | null
  loadingGoals: boolean

  goalForm: CreateLearningGoalRequest
  setGoalForm: React.Dispatch<React.SetStateAction<CreateLearningGoalRequest>>

  milestoneForm: CreateMilestoneRequest
  setMilestoneForm: React.Dispatch<React.SetStateAction<CreateMilestoneRequest>>

  submittingGoal: boolean
  submittingMilestone: boolean

  handleCreateGoal: (e: React.FormEvent) => void
  handleSelectGoal: (id: number) => void
  handleCreateMilestone: (e: React.FormEvent) => void
  handleToggleMilestoneStatus: (milestone: Milestone) => void
  handleDeleteMilestone: (id: number) => void

  handleUpdateGoal?: (goalId: number, data: UpdateLearningGoalRequest) => Promise<void>
  handleUpdateMilestone?: (
    milestoneId: number,
    data: UpdateMilestoneRequest,
  ) => Promise<void>

  calculateProgress: (milestones?: Milestone[], goal?: LearningGoal | null) => number
  formatDisplayDate: (date?: string) => string
}

export default function LearningProgressTab({
  booking,
  goals,
  bookingGoals,
  selectedGoal,
  loadingGoals,
  goalForm,
  setGoalForm,
  milestoneForm,
  setMilestoneForm,
  submittingGoal,
  submittingMilestone,
  handleCreateGoal,
  handleSelectGoal,
  handleCreateMilestone,
  handleToggleMilestoneStatus,
  handleDeleteMilestone,
  handleUpdateGoal,
  calculateProgress,
  formatDisplayDate,
}: LearningProgressTabProps) {
  const [showCreateGoalForm, setShowCreateGoalForm] = useState(false)
  const isCancelled =
    booking?.status === 'Cancelled' ||
    booking?.status === BookingStatus.Cancelled ||
    booking?.status === 3

  if (isCancelled) {
    return (
      <div className="mx-auto mt-4 max-w-4xl rounded-2xl border border-rose-200 bg-rose-50/80 p-6 text-center shadow-xs dark:border-rose-900/50 dark:bg-rose-950/40">
        <div className="flex flex-col items-center justify-center gap-2">
          <XCircle className="h-10 w-10 text-rose-500" />
          <h3 className="text-sm font-extrabold text-rose-800 dark:text-rose-300">
            Buổi học này đã bị HỦY
          </h3>
          <p className="text-xs text-rose-600 dark:text-rose-400">
            Buổi học đã bị hủy nên không áp dụng theo dõi tiến độ hay tạo bài học nhỏ cho ca học này.
          </p>
        </div>
      </div>
    )
  }

  // Trạng thái Sửa Goal
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [editingGoalForm, setEditingGoalForm] = useState<UpdateLearningGoalRequest>({
    title: '',
    description: '',
    targetDate: '',
  })
  const [updatingGoal, setUpdatingGoal] = useState(false)

  const currentGoal = selectedGoal

  const startEditingGoal = () => {
    if (!currentGoal) return
    setIsEditingGoal(true)
    setEditingGoalForm({
      title: currentGoal.title,
      description: currentGoal.description || '',
      targetDate: currentGoal.targetDate?.split('T')[0] ?? '',
    })
  }

  const cancelEditingGoal = () => {
    setIsEditingGoal(false)
  }

  const onSubmitUpdateGoal = async () => {
    if (!currentGoal || !editingGoalForm.title.trim() || !handleUpdateGoal) return
    try {
      setUpdatingGoal(true)
      await handleUpdateGoal(currentGoal.id, editingGoalForm)
      setIsEditingGoal(false)
    } finally {
      setUpdatingGoal(false)
    }
  }

  const onAddGoalSubmit = async (e: React.FormEvent) => {
    await handleCreateGoal(e)
    setShowCreateGoalForm(false)
  }

  return (
    <div className="mx-auto mt-4 max-w-4xl space-y-6">
      {/* 🎯 PHẦN MỤC TIÊU HỌC TẬP */}
      {currentGoal ? (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          {isEditingGoal ? (
            /* FORM SỬA MỤC TIÊU */
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Chỉnh sửa Mục Tiêu Học Tập
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onSubmitUpdateGoal}
                    disabled={updatingGoal}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {updatingGoal ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" /> Lưu lại
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditingGoal}
                    className="rounded-xl bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  >
                    Hủy
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-gray-500">
                  Tên mục tiêu:
                </label>
                <input
                  type="text"
                  value={editingGoalForm.title}
                  onChange={(e) =>
                    setEditingGoalForm({ ...editingGoalForm, title: e.target.value })
                  }
                  placeholder="Tên mục tiêu học tập..."
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-gray-500">
                  Nội dung / Mục tiêu làm gì:
                </label>
                <textarea
                  rows={2}
                  value={editingGoalForm.description}
                  onChange={(e) =>
                    setEditingGoalForm({
                      ...editingGoalForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Mô tả nội dung học tập..."
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold text-gray-500">
                  Thời gian hoàn thành dự kiến:
                </label>
                <input
                  type="date"
                  value={editingGoalForm.targetDate}
                  onChange={(e) =>
                    setEditingGoalForm({
                      ...editingGoalForm,
                      targetDate: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                />
              </div>
            </div>
          ) : (
            /* HIỂN THỊ THẺ MỤC TIÊU */
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3.5 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                    {currentGoal.title}
                  </h3>
                  {handleUpdateGoal && (
                    <button
                      type="button"
                      onClick={startEditingGoal}
                      className="ml-1 rounded-lg bg-gray-100 p-1.5 text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                      title="Chỉnh sửa Mục Tiêu"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <span className="rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-black text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  {calculateProgress(currentGoal.milestones, currentGoal)}% Hoàn thành
                </span>
              </div>

              {currentGoal.description && (
                <p className="mt-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                  <strong className="text-gray-800 dark:text-gray-200">Nội dung: </strong>
                  {currentGoal.description}
                </p>
              )}

              {currentGoal.targetDate && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Thời gian hoàn thành dự kiến: </span>
                  <strong className="text-gray-800 dark:text-gray-200">
                    {formatDisplayDate(currentGoal.targetDate)}
                  </strong>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* NẾU CA HỌC CHƯA CÓ MỤC TIÊU -> HIỂN THỊ NÚT ĐỂ TẠO MỤC TIÊU MỚI HOẶC CHỌN MỤC TIÊU CÓ SẴN */
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs text-gray-400">Buổi học này chưa có Mục tiêu học tập.</p>

          {bookingGoals.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Chọn mục tiêu đã có:</span>
              {bookingGoals.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleSelectGoal(g.id)}
                  className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100"
                >
                  🎯 {g.title}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowCreateGoalForm(!showCreateGoalForm)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo Mục Tiêu Học Tập Mới</span>
          </button>
        </div>
      )}

      {/* FORM TẠO MỤC TIÊU ẨN/HIỆN (HỌC VIÊN TỰ ĐIỀN TÊN, NỘI DUNG, HẠN HOÀN THÀNH) */}
      {showCreateGoalForm && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
              Tạo Mục Tiêu Học Tập Mới
            </h4>
            <button
              type="button"
              onClick={() => setShowCreateGoalForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={onAddGoalSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Tên mục tiêu (VD: Học phần di truyền)..."
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
              required
            />
            <textarea
              rows={2}
              placeholder="Mục tiêu làm gì (Mô tả chi tiết)..."
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
              value={goalForm.description}
              onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
            />
            <div>
              <label className="mb-1 block text-[11px] font-bold text-gray-500">
                Thời gian hoàn thành dự kiến:
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                value={goalForm.targetDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={submittingGoal}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {submittingGoal ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                'Xác Nhận Tạo Mục Tiêu'
              )}
            </button>
          </form>
        </div>
      )}

      {/* 📌 KHỐI CỘT MỐC BÀI HỌC */}
      {currentGoal && (
        <div className="space-y-4">
          {/* FORM THÊM CỘT MỐC NHỎ GỌN */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <h4 className="mb-3 text-xs font-bold text-gray-700 dark:text-gray-300">
              + Thêm Cột mốc / Bài học nhỏ:
            </h4>
            <form
              onSubmit={handleCreateMilestone}
              className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
            >
              <input
                type="text"
                placeholder="Nhập tên bài học / việc cần làm..."
                className="w-full flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                value={milestoneForm.title}
                onChange={(e) =>
                  setMilestoneForm({
                    ...milestoneForm,
                    title: e.target.value,
                  })
                }
                required
              />
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <input
                  type="date"
                  className="w-full min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-indigo-500 sm:w-auto dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                  value={milestoneForm.targetDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) =>
                    setMilestoneForm({
                      ...milestoneForm,
                      targetDate: e.target.value,
                    })
                  }
                />
                <button
                  type="submit"
                  disabled={submittingMilestone}
                  className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submittingMilestone ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    '+ Thêm'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* DANH SÁCH BÀI HỌC CỘT MỐC */}
          <div className="space-y-2">
            {currentGoal.milestones?.map((m) => {
              const isDone =
                m.status === 3 ||
                m.status === 2 ||
                (m as any).status === 'Completed' ||
                (m as any).isCompleted === true

              return (
                <div
                  key={m.id}
                  className="flex flex-col gap-2 rounded-2xl border border-gray-200/80 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleMilestoneStatus(m)}
                      className="shrink-0 text-indigo-600"
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 hover:text-indigo-500" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-semibold ${
                        isDone
                          ? 'text-gray-400 line-through'
                          : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {m.title}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    {m.targetDate && (
                      <span className="text-[11px] font-medium text-gray-400">
                        Hạn: {formatDisplayDate(m.targetDate)}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteMilestone(m.id)}
                      className="text-gray-300 transition hover:text-rose-500"
                      title="Xóa cột mốc"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
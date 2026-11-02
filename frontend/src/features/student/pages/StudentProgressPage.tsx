import { useEffect, useMemo, useState } from 'react'
import {
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Edit2,
  Flag,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'
import { studentApi } from '@/features/student/api/studentApi'
import type {
  CreateMilestoneRequest,
  LearningGoal,
  Milestone,
  UpdateLearningGoalRequest,
  UpdateMilestoneRequest,
} from '../types/learningGoal.types'
import { LearningStatus } from '@/constants/enums'

export default function StudentProgressPage() {
  const [goals, setGoals] = useState<LearningGoal[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // --- States quản lý Modal Edit Goal (Đổi tên/mô tả mục tiêu) ---
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDescription, setGoalDescription] = useState('')
  const [updatingGoal, setUpdatingGoal] = useState(false)
  // --- States quản lý Modal Create/Edit Milestone ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [goalTargetDate, setGoalTargetDate] = useState('')
  // --- States quản lý Xóa Goal ---
  const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form State cho Milestone
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [orderNumber, setOrderNumber] = useState(1)

  // Chuỗi ISO YYYY-MM-DD của hôm nay (theo local time)
  const todayString = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }, [])

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const response = await studentApi.getMyGoals()

      const data: LearningGoal[] = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : []

      setGoals(data)

      if (data.length > 0) {
        setSelectedGoalId((current) => current ?? data[0]?.id ?? null)
      } else {
        setSelectedGoalId(null)
      }
    } catch (error) {
      console.error('Không thể tải mục tiêu học tập:', error)
      toast.error('Không thể tải mục tiêu học tập!')
      setGoals([])
    } finally {
      setLoading(false)
    }
  }

  const selectedGoal = useMemo(() => {
    if (!selectedGoalId) return undefined
    return goals.find((goal) => goal.id === selectedGoalId)
  }, [goals, selectedGoalId])

  const milestones: Milestone[] = useMemo(() => {
    if (!selectedGoal?.milestones) return []
    return [...selectedGoal.milestones].sort((a, b) => a.orderNumber - b.orderNumber)
  }, [selectedGoal])

  // --- Handlers Cập nhật Goal (Đổi tên/mô tả) ---
  const handleOpenEditGoalModal = () => {
    if (!selectedGoal) return

    setGoalTitle(selectedGoal.title)
    setGoalDescription(selectedGoal.description || '')

    setGoalTargetDate(
      selectedGoal.targetDate ? (selectedGoal.targetDate.split('T')[0] ?? '') : '',
    )

    setIsGoalModalOpen(true)
  }

  const handleCloseGoalModal = () => {
    setIsGoalModalOpen(false)
  }

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedGoalId) return

    if (!goalTitle.trim()) {
      toast.error('Vui lòng nhập tên mục tiêu!')
      return
    }

    if (!goalTargetDate) {
      toast.error('Vui lòng chọn hạn hoàn thành!')
      return
    }

    if (goalTargetDate < todayString) {
      toast.error('Hạn hoàn thành không được nằm trong quá khứ!')
      return
    }

    try {
      setUpdatingGoal(true)

      const payload: UpdateLearningGoalRequest = {
        title: goalTitle.trim(),
        description: goalDescription.trim(),
        targetDate: goalTargetDate,
      }

      await studentApi.updateLearningGoal(selectedGoalId, payload)

      toast.success('Đã cập nhật mục tiêu!')

      await fetchGoals()
      handleCloseGoalModal()
    } catch (error) {
      console.error('Lỗi khi cập nhật mục tiêu:', error)
      toast.error('Không thể cập nhật mục tiêu!')
    } finally {
      setUpdatingGoal(false)
    }
  }
  // --- Handlers Xóa Goal ---
  const handleDeleteGoal = async () => {
    if (!deletingGoalId) return

    try {
      setIsDeleting(true)
      await studentApi.deleteLearningGoal(deletingGoalId)

      toast.success('Đã xóa mục tiêu học tập!')

      const updatedGoals = goals.filter((g) => g.id !== deletingGoalId)
      setGoals(updatedGoals)

      if (selectedGoalId === deletingGoalId) {
        setSelectedGoalId(updatedGoals.length > 0 ? (updatedGoals[0]?.id ?? null) : null)
      }

      setDeletingGoalId(null)
    } catch (error) {
      console.error('Lỗi khi xóa mục tiêu:', error)
      toast.error('Không thể xóa mục tiêu học tập!')
    } finally {
      setIsDeleting(false)
    }
  }

  // --- Handlers Modal & CRUD Milestone ---
  const handleOpenCreateModal = () => {
    setEditingMilestone(null)
    setTitle('')
    setDescription('')
    setTargetDate('')
    setOrderNumber(milestones.length + 1)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (milestone: Milestone) => {
    setEditingMilestone(milestone)
    setTitle(milestone.title)
    setDescription(milestone.description || '')
    const formattedDate = milestone.targetDate
      ? new Date(milestone.targetDate).toISOString().split('T')[0] || ''
      : ''

    setTargetDate(formattedDate)
    setOrderNumber(milestone.orderNumber)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingMilestone(null)
  }

  const handleSubmitMilestone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoalId) return

    if (!title.trim()) {
      toast.error('Vui lòng nhập tên cột mốc!')
      return
    }

    if (!targetDate) {
      toast.error('Vui lòng chọn hạn hoàn thành!')
      return
    }

    if (targetDate < todayString) {
      toast.error('Hạn hoàn thành không được nằm trong quá khứ!')
      return
    }

    try {
      setSubmitting(true)
      const payload: CreateMilestoneRequest | UpdateMilestoneRequest = {
        title: title.trim(),
        description: description.trim(),
        targetDate,
        orderNumber: Number(orderNumber),
      }

      if (editingMilestone) {
        await studentApi.updateMilestone(selectedGoalId, editingMilestone.id, payload)
        toast.success('Cập nhật cột mốc thành công!')
      } else {
        await studentApi.createMilestone(selectedGoalId, payload)
        toast.success('Thêm cột mốc mới thành công!')
      }

      await fetchGoals()
      handleCloseModal()
    } catch (error) {
      console.error('Lỗi khi lưu cột mốc:', error)
      toast.error('Có lỗi xảy ra khi lưu cột mốc!')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (milestone: Milestone) => {
    if (!selectedGoalId) return

    const newStatus =
      milestone.status === LearningStatus.Completed
        ? LearningStatus.InProgress || 1
        : LearningStatus.Completed

    try {
      await studentApi.updateMilestoneStatus(selectedGoalId, milestone.id, {
        status: newStatus,
      })
      toast.success(
        newStatus === LearningStatus.Completed
          ? 'Đã đánh dấu hoàn thành!'
          : 'Đã chuyển về trạng thái đang làm',
      )
      await fetchGoals()
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái cột mốc:', error)
      toast.error('Không thể cập nhật trạng thái cột mốc!')
    }
  }

  // --- Calculated Data ---
  const completedMilestones = milestones.filter(
    (milestone: Milestone) => milestone.status === LearningStatus.Completed,
  ).length

  const progress =
    milestones.length > 0
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0

  const nextMilestone = milestones.find(
    (milestone: Milestone) => milestone.status !== LearningStatus.Completed,
  )

  const completedGoals = goals.filter((goal) => {
    const goalMilestones: Milestone[] = goal.milestones ?? []
    return (
      goalMilestones.length > 0 &&
      goalMilestones.every(
        (milestone: Milestone) => milestone.status === LearningStatus.Completed,
      )
    )
  }).length

  const totalMilestones = goals.reduce(
    (total, goal) => total + (goal.milestones?.length ?? 0),
    0,
  )

  const totalCompletedMilestones = goals.reduce(
    (total, goal) =>
      total +
      (goal.milestones?.filter(
        (milestone: Milestone) => milestone.status === LearningStatus.Completed,
      ).length ?? 0),
    0,
  )

  const overallProgress =
    totalMilestones > 0
      ? Math.round((totalCompletedMilestones / totalMilestones) * 100)
      : 0

  const formatDate = (date?: string) => {
    if (!date) return 'Chưa xác định'
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getDaysRemaining = (date?: string) => {
    if (!date) return null
    const target = new Date(date)
    const today = new Date()

    target.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm font-medium text-gray-500">
          Đang tải tiến độ học tập...
        </div>
      </div>
    )
  }

  if (goals.length === 0) {
    return (
      <div className="space-y-6">
        <Toaster position="top-right" />
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Tiến độ học tập
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi hành trình và các cột mốc học tập của bạn.
          </p>
        </div>

        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white px-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Target className="h-8 w-8" />
          </div>

          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Chưa có mục tiêu học tập
          </h2>

          <p className="mt-2 max-w-md text-sm text-gray-500">
            Khi bạn có mục tiêu học tập, toàn bộ tiến độ và các cột mốc sẽ được hiển thị
            tại đây.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <Toaster position="top-right" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <TrendingUp className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              Tiến độ học tập
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Theo dõi hành trình học tập qua từng mục tiêu và cột mốc.
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-950/60 dark:bg-indigo-950/30">
          <div className="flex items-center justify-between">
            <Target className="h-5 w-5 text-indigo-600" />
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {goals.length}
            </span>
          </div>
          <p className="mt-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
            Tổng mục tiêu
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-950/60 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {completedGoals}
            </span>
          </div>
          <p className="mt-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
            Mục tiêu hoàn thành
          </p>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4 dark:border-purple-950/60 dark:bg-purple-950/30">
          <div className="flex items-center justify-between">
            <Flag className="h-5 w-5 text-purple-600" />
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {totalCompletedMilestones}
            </span>
          </div>
          <p className="mt-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
            Mốc đã hoàn thành
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 dark:border-amber-950/60 dark:bg-amber-950/30">
          <div className="flex items-center justify-between">
            <BarChart3 className="h-5 w-5 text-amber-600" />
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {overallProgress}%
            </span>
          </div>
          <p className="mt-3 text-xs font-semibold text-gray-600 dark:text-gray-400">
            Tiến độ tổng thể
          </p>
        </div>
      </div>

      {/* Goal selector */}
      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
              Mục tiêu của bạn
            </p>
            <h2 className="mt-1 text-lg font-black text-gray-900 dark:text-white">
              Chọn mục tiêu để xem tiến độ
            </h2>
          </div>
          <BookOpen className="h-5 w-5 text-gray-400" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const goalMilestones: Milestone[] = goal.milestones ?? []
            const completed = goalMilestones.filter(
              (m: Milestone) => m.status === LearningStatus.Completed,
            ).length

            const percent =
              goalMilestones.length > 0
                ? Math.round((completed / goalMilestones.length) * 100)
                : 0

            const isSelected = selectedGoalId === goal.id

            return (
              <div
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
                className={`group relative cursor-pointer rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/70 shadow-sm dark:border-indigo-500 dark:bg-indigo-950/30'
                    : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-white dark:border-gray-800 dark:bg-gray-950/40 dark:hover:border-indigo-700 dark:hover:bg-gray-900'
                }`}
              >
                         <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* HIỂN THỊ TÊN MÔN HỌC & GIA SƯ TRÊN MỖI THẺ MỤC TIÊU */}
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100/80 px-2 py-0.5 text-[10px] font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        📘 Môn: {goal.subject?.name || (goal as any).subjectName || 'Môn học'}
                      </span>
                      {goal.tutor?.fullName && (
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                          • GS: {goal.tutor.fullName}
                        </span>
                      )}
                    </div>

                    <h3 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Xóa mục tiêu"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeletingGoalId(goal.id)
                      }}
                      className="rounded-lg p-1 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-600" />
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-[11px] font-semibold">
                    <span className="text-gray-500">Tiến độ</span>
                    <span className="text-indigo-600">{percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {selectedGoal && (
        <>
          {/* Selected goal summary */}
          <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="p-6">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      MỤC TIÊU ĐANG XEM
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                      {selectedGoal.title}
                    </h2>

                    {/* Nút Đổi tên / Chỉnh sửa Mục tiêu */}
                    <button
                      type="button"
                      onClick={handleOpenEditGoalModal}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
                      title="Chỉnh sửa / Đổi tên mục tiêu"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>

                    {/* Nút Xóa Mục tiêu */}
                    <button
                      type="button"
                      onClick={() => setDeletingGoalId(selectedGoal.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      title="Xóa mục tiêu này"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  {selectedGoal.description && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                      {selectedGoal.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <div className="relative flex h-28 w-28 items-center justify-center">
                    <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="9"
                        className="text-gray-100 dark:text-gray-800"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="9"
                        strokeLinecap="round"
                        className="text-indigo-500"
                        strokeDasharray={`${progress * 2.64} 264`}
                      />
                    </svg>

                    <div className="absolute text-center">
                      <p className="text-2xl font-black text-gray-900 dark:text-white">
                        {progress}%
                      </p>
                      <p className="text-[9px] font-semibold text-gray-400">HOÀN THÀNH</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-950/50">
                  <p className="text-xs text-gray-500">Tổng cột mốc</p>
                  <p className="mt-1 text-xl font-black text-gray-900 dark:text-white">
                    {milestones.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                  <p className="text-xs text-gray-500">Đã hoàn thành</p>
                  <p className="mt-1 text-xl font-black text-emerald-600">
                    {completedMilestones}
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/30">
                  <p className="text-xs text-gray-500">Đang thực hiện</p>
                  <p className="mt-1 text-xl font-black text-amber-600">
                    {milestones.length - completedMilestones}
                  </p>
                </div>

                <div className="rounded-2xl bg-purple-50 p-4 dark:bg-purple-950/30">
                  <p className="text-xs text-gray-500">Mốc tiếp theo</p>
                  <p className="mt-1 truncate text-sm font-black text-purple-600">
                    {nextMilestone?.title ?? 'Đã hoàn thành 🎉'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Next milestone */}
          {nextMilestone && (
            <section className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 dark:border-indigo-950/60 dark:from-indigo-950/30 dark:to-purple-950/30">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-gray-900">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-bold tracking-wider text-indigo-500 uppercase">
                    Cột mốc tiếp theo
                  </p>
                  <h3 className="mt-1 text-base font-black text-gray-900 dark:text-white">
                    {nextMilestone.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Hạn mục tiêu: {formatDate(nextMilestone.targetDate)}
                  </p>

                  {getDaysRemaining(nextMilestone.targetDate) !== null && (
                    <p className="mt-2 text-xs font-bold text-indigo-600">
                      {getDaysRemaining(nextMilestone.targetDate)! >= 0
                        ? `Còn ${getDaysRemaining(nextMilestone.targetDate)} ngày`
                        : `Đã quá hạn ${Math.abs(
                            getDaysRemaining(nextMilestone.targetDate)!,
                          )} ngày`}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Timeline Section */}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 dark:text-white">
                    Lộ trình mục tiêu
                  </h2>
                  <p className="text-xs text-gray-500">
                    Các cột mốc theo thứ tự hoàn thành
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-700 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Thêm cột mốc
              </button>
            </div>

            {milestones.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-8 text-center dark:bg-gray-950/50">
                <Flag className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-3 text-sm font-semibold text-gray-500">
                  Chưa có cột mốc nào cho mục tiêu này.
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute top-3 bottom-3 left-[19px] w-px bg-gray-200 dark:bg-gray-800" />

                <div className="space-y-6">
                  {milestones.map((milestone, index) => {
                    const completed = milestone.status === LearningStatus.Completed
                    const daysRemaining = getDaysRemaining(milestone.targetDate)

                    return (
                      <div key={milestone.id} className="relative flex gap-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(milestone)}
                          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white transition-transform active:scale-90 dark:border-gray-900 ${
                            completed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white text-gray-400 shadow-sm hover:text-emerald-500 dark:bg-gray-900'
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </button>

                        <div
                          className={`min-w-0 flex-1 rounded-2xl border p-4 ${
                            completed
                              ? 'border-emerald-100 bg-emerald-50/50 dark:border-emerald-950/50 dark:bg-emerald-950/20'
                              : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40'
                          }`}
                        >
                          <div className="flex flex-col justify-between gap-2 sm:flex-row">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-gray-400">
                                  #{milestone.orderNumber || index + 1}
                                </span>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                  {milestone.title}
                                </h3>
                              </div>

                              {milestone.description && (
                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                  {milestone.description}
                                </p>
                              )}
                            </div>

                            <div className="flex shrink-0 items-start gap-3 sm:flex-col sm:items-end">
                              <div className="text-left sm:text-right">
                                <p className="flex items-center gap-1 text-xs font-semibold text-gray-500 sm:justify-end">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {formatDate(milestone.targetDate)}
                                </p>

                                {completed ? (
                                  <span className="mt-1 inline-block text-[10px] font-bold text-emerald-600">
                                    ĐÃ HOÀN THÀNH
                                  </span>
                                ) : daysRemaining !== null ? (
                                  <span
                                    className={`mt-1 inline-block text-[10px] font-bold ${
                                      daysRemaining < 0
                                        ? 'text-red-500'
                                        : 'text-amber-600'
                                    }`}
                                  >
                                    {daysRemaining < 0
                                      ? `Quá hạn ${Math.abs(daysRemaining)} ngày`
                                      : `Còn ${daysRemaining} ngày`}
                                  </span>
                                ) : null}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(milestone)}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Achievement */}
          {progress === 100 && (
            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white">
                    Mục tiêu đã hoàn thành! 🎉
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Bạn đã hoàn thành toàn bộ các cột mốc của mục tiêu này.
                  </p>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Modal Sửa Tên/Mô tả Mục tiêu */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Chỉnh sửa mục tiêu
              </h3>
              <button
                type="button"
                onClick={handleCloseGoalModal}
                className="rounded-xl p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGoal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Tên mục tiêu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Ví dụ: Ôn thi chứng chỉ JLPT N3"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-950"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Ghi chú thêm về mục tiêu này..."
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500 dark:focus:bg-gray-950"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseGoalModal}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updatingGoal}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                >
                  {updatingGoal ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xóa Goal */}
      {deletingGoalId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <Trash2 className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
              Xóa mục tiêu học tập?
            </h3>
            <p className="mt-2 text-xs text-gray-500">
              Hành động này sẽ xóa vĩnh viễn mục tiêu cùng với toàn bộ các cột mốc liên
              quan.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingGoalId(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteGoal}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa mục tiêu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm / Sửa Milestone */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {editingMilestone ? 'Chỉnh sửa cột mốc' : 'Thêm cột mốc mới'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMilestone} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Tên cột mốc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Hoàn thành Chương 1"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi chú về cột mốc này..."
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Hạn hoàn thành <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={todayString}
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Thứ tự cột mốc
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                >
                  {submitting
                    ? 'Đang lưu...'
                    : editingMilestone
                      ? 'Cập nhật'
                      : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import { useMemo, useState, type ReactNode } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  BookOpen,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { tutorProfileApi } from '@/apis/fe2/tutorProfile.api'
import type { TutorSubjectResponse, SubjectResponse } from '@/apis/fe2/tutorProfile.types'
import { tutorCard } from './profileTheme'

interface Props {
  subjects: TutorSubjectResponse[]
  availableSubjects: SubjectResponse[]
  onChanged: (subjects: TutorSubjectResponse[]) => void
}

const TEACHING_LEVELS = ['Tiểu học', 'THCS', 'THPT', 'Đại học']
const PAGE_SIZE = 5

const TEACHING_LEVEL_LABELS: Record<string, string> = {
  'Tiểu học': 'Tiểu học',
  'THCS': 'THCS',
  'THPT': 'THPT',
  'Đại học': 'Đại học',
  Beginner: 'Tiểu học',
  Intermediate: 'THCS',
  Advanced: 'THPT',
  'All Levels': 'Đại học',
}

function formatTeachingLevel(level: string) {
  return TEACHING_LEVEL_LABELS[level] ?? level
}

function formatFeeVnd(feePerSessionCredits: number) {
  return feePerSessionCredits.toLocaleString('vi-VN')
}

type EditState = { fee: number; saving: boolean; error: string | null }
type TabKey = 'active' | 'paused'

export function SubjectsSection({ subjects, availableSubjects, onChanged }: Props) {
  const [tab, setTab] = useState<TabKey>('active')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<{
    subjectId: number
    teachingLevel: string
    feePerSessionCredits: number | string
  }>({
    subjectId: availableSubjects[0]?.id ?? 0,
    teachingLevel: 'All Levels',
    feePerSessionCredits: 100,
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editState, setEditState] = useState<EditState>({ fee: 0, saving: false, error: null })
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const addedSubjectIds = new Set(subjects.map((s) => s.subject.id))
  const selectableSubjects = availableSubjects.filter((s) => s.isActive && !addedSubjectIds.has(s.id))

  const filtered = useMemo(
    () => subjects.filter((s) => (tab === 'active' ? s.isActive : !s.isActive)),
    [subjects, tab],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const activeCount = subjects.filter((s) => s.isActive).length
  const pausedCount = subjects.filter((s) => !s.isActive).length

  function switchTab(next: TabKey) {
    setTab(next)
    setPage(1)
  }

  function openAddForm() {
    setAddForm({
      subjectId: selectableSubjects[0]?.id ?? 0,
      teachingLevel: 'All Levels',
      feePerSessionCredits: 100,
    })
    setAddError(null)
    setShowAdd(true)
  }

  async function handleAdd() {
    if (!addForm.subjectId) {
      setAddError('Vui lòng chọn môn học.')
      return
    }
    const numericFee = Number(addForm.feePerSessionCredits)
    if (!numericFee || numericFee < 1) {
      setAddError('Học phí phải ít nhất 1 credit.')
      return
    }
    setAdding(true)
    setAddError(null)
    try {
      const created = await tutorProfileApi.createSubject({
        ...addForm,
        feePerSessionCredits: numericFee,
      })
      onChanged([...subjects, created])
      setShowAdd(false)
      setTab('active')
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Không thể thêm môn học.')
    } finally {
      setAdding(false)
    }
  }

  function startEditFee(subject: TutorSubjectResponse) {
    setEditingId(subject.id)
    setEditState({ fee: subject.feePerSessionCredits, saving: false, error: null })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditState({ fee: 0, saving: false, error: null })
  }

  async function handleUpdateFee(id: number) {
    if (editState.fee < 1) {
      setEditState((p) => ({ ...p, error: 'Học phí phải ít nhất 1 credit.' }))
      return
    }
    setEditState((p) => ({ ...p, saving: true, error: null }))
    try {
      const updated = await tutorProfileApi.updateSubject(id, { feePerSessionCredits: editState.fee })
      onChanged(subjects.map((s) => (s.id === id ? updated : s)))
      setEditingId(null)
    } catch (e) {
      setEditState((p) => ({
        ...p,
        saving: false,
        error: e instanceof Error ? e.message : 'Không thể cập nhật học phí.',
      }))
    }
  }

  async function handleToggleStatus(id: number, isActive: boolean) {
    setTogglingId(id)
    try {
      const updated = await tutorProfileApi.setSubjectStatus(id, { isActive: !isActive })
      onChanged(subjects.map((s) => (s.id === id ? updated : s)))
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    try {
      const updated = await tutorProfileApi.setSubjectStatus(id, { isActive: false })
      onChanged(subjects.map((s) => (s.id === id ? updated : s)))
      setConfirmDeleteId(null)
      setTab('paused')
    } finally {
      setDeleting(false)
    }
  }

  const deleteTarget = subjects.find((s) => s.id === confirmDeleteId)

  return (
    <>
      <div className={`${tutorCard} overflow-hidden`}>
        <div className="flex items-start justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-base font-extrabold text-white sm:text-lg">Môn học & Học phí</h2>
            <p className="mt-1 text-xs text-slate-500">Quản lý các môn học và mức học phí.</p>
          </div>
          {!showAdd && (
            <button
              type="button"
              onClick={openAddForm}
              disabled={selectableSubjects.length === 0}
              title={selectableSubjects.length === 0 ? 'Đã thêm hết môn học' : undefined}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 text-xs font-semibold text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Thêm môn học
            </button>
          )}
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          {!showAdd && (
            <div className="flex items-center gap-8 border-b border-white/[0.06] pb-0">
              <TabButton
                active={tab === 'active'}
                onClick={() => switchTab('active')}
                label="Đang giảng dạy"
                count={activeCount}
              />
              <TabButton
                active={tab === 'paused'}
                onClick={() => switchTab('paused')}
                label="Đã tạm dừng"
                count={pausedCount}
              />
            </div>
          )}

          {showAdd && (
            <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Thêm môn học mới</p>
                <button
                  type="button"
                  onClick={() => { setShowAdd(false); setAddError(null) }}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
                  aria-label="Đóng"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Môn học <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={addForm.subjectId}
                    onChange={(e) => setAddForm((p) => ({ ...p, subjectId: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-500/40"
                  >
                    {selectableSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                    {selectableSubjects.length === 0 && (
                      <option disabled>Đã thêm hết môn học</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Cấp độ <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={addForm.teachingLevel}
                    onChange={(e) => setAddForm((p) => ({ ...p, teachingLevel: e.target.value }))}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#0b0e14] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-brand-500/40"
                  >
                    {TEACHING_LEVELS.map((l) => (
                      <option key={l} value={l}>{formatTeachingLevel(l)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Học phí (VNĐ / buổi) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={addForm.feePerSessionCredits || ''}
                    onChange={(e) => {
                      const cleanVal = e.target.value.replace(/^0+/, '')
                      setAddForm((p) => ({
                        ...p,
                        feePerSessionCredits: cleanVal === '' ? '' : Number(cleanVal),
                      }))
                    }}
                    placeholder="Nhập học phí..."
                    className="!bg-[#0b0e14] !text-white border-white/20 placeholder:text-slate-500"
                  />
                </div>
              </div>

              {addError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <p className="text-sm text-red-200">{addError}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} loading={adding} disabled={selectableSubjects.length === 0}>
                  Thêm môn
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setShowAdd(false); setAddError(null) }}
                  disabled={adding}
                  className="!border-white/20 !text-white hover:!bg-white/10 font-bold"
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}

          {!showAdd && filtered.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                <BookOpen className="h-7 w-7 text-slate-500" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-slate-300">
                {tab === 'active' ? 'Chưa có môn đang giảng dạy' : 'Chưa có môn tạm dừng'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {tab === 'active' ? 'Bấm "Thêm môn học" để bắt đầu.' : 'Các môn tạm dừng sẽ hiển thị tại đây.'}
              </p>
            </div>
          ) : !showAdd ? (
            <>
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <div className="grid grid-cols-12 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <div className="col-span-4">Môn học</div>
                    <div className="col-span-2">Cấp độ</div>
                    <div className="col-span-2">Học phí (VND)</div>
                    <div className="col-span-2">Trạng thái</div>
                    <div className="col-span-2 text-right">Thao tác</div>
                  </div>

                  <div className="divide-y divide-white/[0.04]">
                    {paged.map((subject) => (
                      <SubjectRow
                        key={subject.id}
                        subject={subject}
                        isEditing={editingId === subject.id}
                        editState={editState}
                        isToggling={togglingId === subject.id}
                        onEditStart={() => startEditFee(subject)}
                        onEditCancel={cancelEdit}
                        onEditFeeChange={(fee) => setEditState((p) => ({ ...p, fee, error: null }))}
                        onEditSave={() => handleUpdateFee(subject.id)}
                        onToggleStatus={() => handleToggleStatus(subject.id, subject.isActive)}
                        onDeleteRequest={() => setConfirmDeleteId(subject.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {filtered.length > PAGE_SIZE && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition hover:bg-white/[0.04] disabled:opacity-40"
                    aria-label="Trang trước"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-slate-500">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition hover:bg-white/[0.04] disabled:opacity-40"
                    aria-label="Trang sau"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/[0.08] bg-[#151921] p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Xóa môn học khỏi hồ sơ</p>
                <p className="mt-0.5 text-xs text-slate-400">Môn học sẽ được chuyển sang trạng thái tạm dừng.</p>
              </div>
            </div>

            {deleteTarget && (
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                <p className="text-sm font-semibold text-white">{deleteTarget.subject.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {formatTeachingLevel(deleteTarget.teachingLevel)} · {formatFeeVnd(deleteTarget.feePerSessionCredits)} VND
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)} disabled={deleting} className="flex-1 !border-white/20 !text-white hover:!bg-white/10 font-bold">
                Hủy
              </Button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deleting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
              >
                {deleting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative pb-3 text-xs font-semibold transition ${
        active ? 'text-brand-300' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-1.5 text-[10px] ${active ? 'text-brand-400/80' : 'text-slate-600'}`}>
          ({count})
        </span>
      )}
      {active && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-500" />
      )}
    </button>
  )
}

interface SubjectRowProps {
  subject: TutorSubjectResponse
  isEditing: boolean
  editState: EditState
  isToggling: boolean
  onEditStart: () => void
  onEditCancel: () => void
  onEditFeeChange: (fee: number) => void
  onEditSave: () => void
  onToggleStatus: () => void
  onDeleteRequest: () => void
}

function SubjectRow({
  subject,
  isEditing,
  editState,
  isToggling,
  onEditStart,
  onEditCancel,
  onEditFeeChange,
  onEditSave,
  onToggleStatus,
  onDeleteRequest,
}: SubjectRowProps) {
  return (
    <div
      className={`group grid grid-cols-12 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.02] ${
        !subject.isActive ? 'opacity-80' : ''
      }`}
    >
      <div className="col-span-4 flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-500/20 bg-brand-500/10">
          <span className="text-[10px] font-extrabold tracking-wide text-brand-200">
            {subject.subject.code.slice(0, 3).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{subject.subject.name}</p>
          {subject.subject.description && (
            <p className="truncate text-[11px] text-slate-500" title={subject.subject.description}>
              {subject.subject.description}
            </p>
          )}
        </div>
      </div>

      <div className="col-span-2">
        <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-300">
          {formatTeachingLevel(subject.teachingLevel)}
        </span>
      </div>

      <div className="col-span-2">
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <input
              type="number"
              min={1}
              value={editState.fee || ''}
              onChange={(e) => {
                const cleanVal = e.target.value.replace(/^0+/, '')
                onEditFeeChange(cleanVal === '' ? 0 : Number(cleanVal))
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onEditSave()
                if (e.key === 'Escape') onEditCancel()
              }}
              autoFocus
              className="h-9 w-full max-w-[120px] rounded-xl border border-white/20 bg-[#0b0e14] px-3 text-sm text-white outline-none focus:ring-2 focus:ring-brand-500/40"
            />
            {editState.error && <p className="text-[10px] text-red-300">{editState.error}</p>}
          </div>
        ) : (
          <p className="text-sm font-semibold text-white">{formatFeeVnd(subject.feePerSessionCredits)}</p>
        )}
      </div>

      <div className="col-span-2">
        <button
          type="button"
          onClick={onToggleStatus}
          disabled={isToggling || isEditing}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
            subject.isActive
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
              : 'border-orange-500/20 bg-orange-500/10 text-orange-200'
          }`}
          title={subject.isActive ? 'Tạm dừng môn học' : 'Bật lại môn học'}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${subject.isActive ? 'bg-emerald-400' : 'bg-orange-400'}`}
          />
          {subject.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
        </button>
      </div>

      <div className="col-span-2 flex items-center justify-end gap-1.5">
        {isEditing ? (
          <>
            <IconBtn onClick={onEditSave} disabled={editState.saving} title="Lưu">
              {editState.saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-transparent" />
              ) : (
                <Check className="h-4 w-4 text-emerald-400" />
              )}
            </IconBtn>
            <IconBtn onClick={onEditCancel} disabled={editState.saving} title="Hủy">
              <X className="h-4 w-4 text-slate-300" />
            </IconBtn>
          </>
        ) : (
          <>
            <IconBtn onClick={onEditStart} title="Chỉnh sửa học phí">
              <Pencil className="h-3.5 w-3.5 text-slate-300" />
            </IconBtn>
            <IconBtn
              onClick={onDeleteRequest}
              title="Xóa môn học"
              className="opacity-0 group-hover:opacity-100 hover:border-red-500/30 hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-300" />
            </IconBtn>
          </>
        )}
      </div>
    </div>
  )
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
  className = '',
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  title: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] transition hover:bg-white/[0.06] disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}
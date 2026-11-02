import { useEffect, useState, type FormEvent } from 'react'
import { adminApi } from './admin.api'
import type { Subject } from './admin.types'
import { Table, type Column } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/ToastContext'

export function SubjectsPage() {
  const toast = useToast()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Create & Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Confirm dialogs
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null)
  const [hardDeletingSubject, setHardDeletingSubject] = useState<Subject | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadSubjects = async () => {
    setIsLoading(true)
    try {
      const data = await adminApi.getSubjects(searchQuery)
      setSubjects(data)
    } catch {
      toast.error('Không thể tải danh sách môn học')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSubjects()
  }, [searchQuery])

  const handleOpenCreate = () => {
    setEditingSubject(null)
    setCode(`SUB-${Math.floor(Math.random() * 90 + 10)}`)
    setName('')
    setDescription('')
    setStatus('active')
    setIsModalOpen(true)
  }

  const handleOpenEdit = async (subject: Subject) => {
    try {
      const detail = await adminApi.getSubjectDetail(subject.id, true)
      setEditingSubject(detail)
      setCode(detail.code)
      setName(detail.name)
      setDescription(detail.description)
      setStatus(detail.status)
      setIsModalOpen(true)
    } catch {
      toast.error('Không thể tải chi tiết môn học')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) {
      toast.warning('Vui lòng nhập tên môn học và mã môn học')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingSubject) {
        await adminApi.updateSubject(editingSubject.id, {
          code,
          name,
          description,
        })
        if ((editingSubject.status === 'active') !== (status === 'active')) {
          await adminApi.setSubjectStatus(editingSubject.id, status === 'active')
        }
        toast.success(`Đã cập nhật môn học "${name}"`)
      } else {
        const created = await adminApi.createSubject({
          code,
          name,
          description,
        })
        if (status === 'inactive') {
          await adminApi.setSubjectStatus(created.id, false)
        }
        toast.success(`Đã thêm môn học mới "${name}"`)
      }
      setIsModalOpen(false)
      void loadSubjects()
    } catch {
      toast.error('Lưu môn học thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingSubject) return
    setIsDeleting(true)
    try {
      await adminApi.deleteSubject(deletingSubject.id)
      toast.info(`Đã ẩn môn học "${deletingSubject.name}"`)
      setDeletingSubject(null)
      void loadSubjects()
    } catch {
      toast.error('Ẩn môn học thất bại')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleHardDeleteConfirm = async () => {
    if (!hardDeletingSubject) return
    setIsDeleting(true)
    try {
      await adminApi.deleteSubjectPermanently(hardDeletingSubject.id)
      toast.success(`Đã xóa hẳn môn học "${hardDeletingSubject.name}"`)
      setHardDeletingSubject(null)
      void loadSubjects()
    } catch {
      toast.error('Xóa hẳn môn học thất bại')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<Subject>[] = [
    {
      key: 'code',
      header: 'Mã Môn',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
          {row.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Tên Môn Học',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">{row.name}</p>
          <span className="text-xs text-slate-500">{row.description}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      render: (row) => (
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            row.status === 'active'
              ? 'border-emerald-200/60 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'border-slate-300/60 bg-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {row.status === 'active' ? '● Đang mở' : '○ Đã khóa'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => void handleOpenEdit(row)}>
            ✏️ Sửa
          </Button>

          {row.status === 'active' ? (
            <Button size="sm" variant="danger" onClick={() => setDeletingSubject(row)}>
              👁️ Ẩn
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await adminApi.setSubjectStatus(row.id, true)
                  toast.success(`Đã mở lại môn học "${row.name}"`)
                  void loadSubjects()
                } catch {
                  toast.error('Mở lại môn học thất bại')
                }
              }}
            >
              ♻️ Mở lại
            </Button>
          )}

          <Button size="sm" variant="danger" onClick={() => setHardDeletingSubject(row)}>
            🗑️ Xóa 
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Quản lý Môn học
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Cấu hình danh mục môn học, học phí tham chiếu và trạng thái hiển thị trên hệ thống
          </p>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Input
            placeholder="🔍 Tìm môn học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button variant="gradient" onClick={handleOpenCreate} className="shrink-0">
            + Thêm Môn Học
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={subjects}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="Không tìm thấy môn học nào"
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? `Chỉnh sửa môn học — ${editingSubject.name}` : 'Thêm mới Môn học'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã môn học"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <Input
            label="Tên môn học"
            placeholder="Ví dụ: Luyện thi IELTS, Toán Phổ thông..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Mô tả chi tiết môn học
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập tóm tắt nội dung môn học..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-900"
            />
          </div>

          <Select
            label="Trạng thái môn học"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
            options={[
              { label: 'Đang mở (Hiển thị cho học viên & gia sư)', value: 'active' },
              { label: 'Ẩn / Tạm đóng môn học', value: 'inactive' },
            ]}
          />

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="gradient" loading={isSubmitting}>
              {editingSubject ? 'Lưu cập nhật' : 'Tạo môn học mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Soft Delete Confirm Dialog */}
      {deletingSubject && (
        <ConfirmDialog
          isOpen={!!deletingSubject}
          onClose={() => setDeletingSubject(null)}
          onConfirm={handleDeleteConfirm}
          title="Xác nhận ẩn môn học"
          message={`Bạn có chắc chắn muốn ẩn môn học "${deletingSubject.name}" (${deletingSubject.code})? Môn học sẽ không còn hiển thị với người dùng.`}
          confirmText="Ẩn Môn Học"
          isLoading={isDeleting}
        />
      )}

      {/* Hard Delete Confirm Dialog */}
      {hardDeletingSubject && (
        <ConfirmDialog
          isOpen={!!hardDeletingSubject}
          onClose={() => setHardDeletingSubject(null)}
          onConfirm={handleHardDeleteConfirm}
          title="Xác nhận xóa hẳn môn học"
          message={`Bạn có chắc chắn muốn xóa hẳn môn học "${hardDeletingSubject.name}" (${hardDeletingSubject.code}) khỏi database không? Hành động này sẽ xóa luôn dữ liệu liên quan.`}
          confirmText="Xóa Hẳn"
          isLoading={isDeleting}
        />
      )}
    </div>
  )
}
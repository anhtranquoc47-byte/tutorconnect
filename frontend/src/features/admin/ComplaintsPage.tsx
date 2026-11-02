import { useEffect, useState } from 'react'
import { adminApi } from './admin.api'
import type { Complaint, ComplaintStatus } from './admin.types'
import { Table, type Column } from '@/components/ui/Table'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/ToastContext'

export function ComplaintsPage() {
  const toast = useToast()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all')

  // Resolve Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [decision, setDecision] = useState<'in_review' | 'resolved' | 'rejected'>('resolved')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadComplaints = async () => {
    setIsLoading(true)
    try {
      const data = await adminApi.getComplaints(statusFilter)
      setComplaints(data)
    } catch {
      toast.error('Không thể tải danh sách khiếu nại')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadComplaints()
  }, [statusFilter])

  const handleOpenDetail = async (complaint: Complaint) => {
    try {
      const detail = await adminApi.getComplaintDetail(complaint.id)
      setSelectedComplaint(detail)
      setResolutionNotes(detail.resolutionNotes || '')
      setDecision('resolved')
    } catch {
      toast.error('Không thể tải chi tiết khiếu nại')
    }
  }

  const handleResolveSubmit = async () => {
    if (!selectedComplaint) return
    if (!resolutionNotes.trim()) {
      toast.warning('Vui lòng nhập nội dung xử lý/quyết định khiếu nại')
      return
    }

    setIsSubmitting(true)
    try {
      await adminApi.resolveComplaint(selectedComplaint.id, decision, resolutionNotes)
      toast.success(`Đã cập nhật kết quả xử lý khiếu nại ${selectedComplaint.id}`)
      setSelectedComplaint(null)
      void loadComplaints()
    } catch {
      toast.error('Xử lý khiếu nại thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: Column<Complaint>[] = [
    {
      key: 'id',
      header: 'Mã khiếu nại',
      render: (row) => <span className="font-mono text-xs font-bold text-slate-400">{row.id}</span>,
    },
    {
      key: 'complainantName',
      header: 'Người khiếu nại & Đối tượng',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">{row.complainantName}</p>
          <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Bị phản ánh: <strong>{row.targetName}</strong></span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Loại khiếu nại',
      render: (row) => (
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{row.type}</p>
          <p className="text-xs text-slate-500 truncate max-w-xs">{row.content}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => {
        const map = {
          open: { label: 'Mới gửi', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200' },
          in_review: { label: 'Đang xử lý', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200' },
          resolved: { label: 'Đã giải quyết', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200' },
          rejected: { label: 'Từ chối', cls: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300' },
        }
        const s = map[row.status]
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.cls}`}>{s.label}</span>
      },
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (row) => <span className="text-xs text-slate-500 font-medium">{row.createdAt}</span>,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (row) => (
        <Button
          size="sm"
          variant={row.status === 'resolved' || row.status === 'rejected' ? 'outline' : 'gradient'}
          onClick={() => void handleOpenDetail(row)}
        >
          {row.status === 'resolved' || row.status === 'rejected' ? 'Xem kết quả' : 'Xử lý khiếu nại'}
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Xử lý Khiếu nại
          </h2>
          <p className="text-xs text-slate-500 mt-1">Tiếp nhận phản ánh giữa Học viên và Gia sư, tiến hành xác minh và đưa ra phương án giải quyết</p>
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | 'all')}
          options={[
            { label: 'Tất cả khiếu nại', value: 'all' },
            { label: '🔴 Mới gửi', value: 'open' },
            { label: '🟡 Đang xử lý', value: 'in_review' },
            { label: '🟢 Đã giải quyết', value: 'resolved' },
            { label: '⚪ Từ chối giải quyết', value: 'rejected' },
          ]}
          className="w-full sm:w-56"
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={complaints}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="Không có khiếu nại nào"
      />

      {/* Detail & Resolve Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Xử lý Khiếu nại — ${selectedComplaint.id}`}
          size="lg"
          footer={
            selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'rejected' ? (
              <>
                <Button variant="ghost" onClick={() => setSelectedComplaint(null)}>
                  Đóng
                </Button>
                <Button variant="gradient" loading={isSubmitting} onClick={handleResolveSubmit}>
                  Gửi quyết định xử lý
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => setSelectedComplaint(null)}>
                Đóng
              </Button>
            )
          }
        >
          <div className="space-y-6 text-sm">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-brand-600">Mã: {selectedComplaint.id}</span>
                <span className="text-slate-400 font-medium">Ngày tạo: {selectedComplaint.createdAt}</span>
              </div>
              <p className="font-extrabold text-base text-slate-900 dark:text-slate-100">{selectedComplaint.type}</p>
              <div className="flex items-center gap-6 text-xs font-semibold pt-1">
                <span>👤 Bên khiếu nại: <strong className="text-brand-600">{selectedComplaint.complainantName}</strong></span>
                <span>⚠️ Bị khiếu nại: <strong className="text-rose-600">{selectedComplaint.targetName}</strong></span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Nội dung chi tiết phản ánh
              </h4>
              <p className="p-4 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 rounded-2xl text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                {selectedComplaint.content}
              </p>
            </div>

            {/* Resolution Form or Result view */}
            {selectedComplaint.status === 'resolved' || selectedComplaint.status === 'rejected' ? (
              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl space-y-1.5">
                <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                  ✓ Kết quả xử lý từ Ban Quản Trị ({selectedComplaint.resolvedAt}):
                </span>
                <p className="text-xs text-emerald-700 dark:text-emerald-200 leading-relaxed font-medium">
                  {selectedComplaint.resolutionNotes}
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-brand-600 mb-1">
                  Nhập Quyết định & Nội dung kết luận từ Admin
                </h4>

                <Select
                  label="Quyết định xử lý"
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as 'in_review' | 'resolved' | 'rejected')}
                  options={[
                    { label: '🟡 Đang xem xét', value: 'in_review' },
                    { label: '🟢 Chấp nhận khiếu nại & Hòa giải thành công', value: 'resolved' },
                    { label: '🔴 Từ chối khiếu nại (Không đủ căn cứ / Bác bỏ)', value: 'rejected' },
                  ]}
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Nội dung kết luận gửi tới 2 bên
                  </label>
                  <textarea
                    rows={4}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Ví dụ: Đã liên hệ 2 bên hòa giải, gia sư đồng ý bù 2 buổi dạy..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

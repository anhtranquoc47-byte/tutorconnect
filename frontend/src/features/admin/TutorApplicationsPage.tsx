import { useEffect, useState } from 'react'
import { adminApi } from './admin.api'
import type { TutorApplication, TutorApplicationStatus } from './admin.types'
import { Table, type Column } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/ToastContext'

export function TutorApplicationsPage() {
  const toast = useToast()
  const [applications, setApplications] = useState<TutorApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<TutorApplicationStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal details & review state
  const [selectedApp, setSelectedApp] = useState<TutorApplication | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isActionLoading, setIsActionLoading] = useState(false)

  const loadApplications = async () => {
    setIsLoading(true)
    try {
      const data = await adminApi.getTutorApplications({
        status: statusFilter,
        query: searchQuery,
      })
      setApplications(data)
    } catch {
      toast.error('Không thể tải danh sách hồ sơ gia sư')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadApplications()
  }, [statusFilter, searchQuery])

  const handleOpenDetail = async (application: TutorApplication) => {
    try {
      const detail = await adminApi.getTutorApplicationDetail(application.id)
      setSelectedApp(detail)
      setIsDetailModalOpen(true)
    } catch {
      toast.error('Không thể tải chi tiết hồ sơ gia sư')
    }
  }

  const handleApprove = async (app: TutorApplication) => {
    setIsActionLoading(true)
    try {
      await adminApi.reviewTutorApplication(app.id, 'approved')
      toast.success(`Đã duyệt thành công hồ sơ của gia sư ${app.fullName}`)
      setIsDetailModalOpen(false)
      setSelectedApp(null)
      void loadApplications()
    } catch {
      toast.error('Duyệt hồ sơ thất bại')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleRejectConfirm = async () => {
    if (!selectedApp) return
    if (!rejectionReason.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối hồ sơ')
      return
    }
    setIsActionLoading(true)
    try {
      await adminApi.reviewTutorApplication(selectedApp.id, 'rejected', rejectionReason)
      toast.info(`Đã từ chối hồ sơ của gia sư ${selectedApp.fullName}`)
      setIsRejectModalOpen(false)
      setIsDetailModalOpen(false)
      setSelectedApp(null)
      setRejectionReason('')
      void loadApplications()
    } catch {
      toast.error('Xử lý thất bại')
    } finally {
      setIsActionLoading(false)
    }
  }

  const columns: Column<TutorApplication>[] = [
    {
      key: 'id',
      header: 'Mã hồ sơ',
      render: (row) => <span className="font-mono text-xs font-bold text-slate-400">{row.id}</span>,
    },
    {
      key: 'fullName',
      header: 'Họ và tên gia sư',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {row.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">{row.fullName}</p>
            <span className="text-xs text-slate-500">{row.email} • {row.phone}</span>
          </div>
        </div>
      ),
    },
      {
    key: 'qualification',
    header: 'Trình độ & Bằng cấp',
    render: (row) => (
      <div className="max-w-[220px]">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={row.qualification}>
          {row.qualification}
        </p>
        <span className="text-xs text-brand-600 dark:text-brand-400 font-bold">
          ⭐ {row.experienceYears} năm kinh nghiệm
        </span>
      </div>
    ),
  },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => {
        const statusMap = {
          pending: { label: 'Chờ duyệt', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60' },
          approved: { label: 'Đã duyệt', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60' },
          rejected: { label: 'Từ chối', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60' },
          draft: { label: 'Bản nháp', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60' },
          suspended: { label: 'Tạm ngưng', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60' },
        }
        const s = statusMap[row.status]
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.cls}`}>{s.label}</span>
      },
    },
    {
      key: 'createdAt',
      header: 'Ngày gửi',
      render: (row) => <span className="text-xs text-slate-500 font-medium">{row.createdAt}</span>,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void handleOpenDetail(row)}
          >
            Chi tiết
          </Button>
          {row.status === 'pending' && (
            <Button
              size="sm"
              variant="gradient"
              onClick={() => handleApprove(row)}
            >
              Duyệt
            </Button>
          )}
        </div>
      ),
    },
  ]

  const statusFilterOptions: { label: string; value: TutorApplicationStatus | 'all' }[] = [
    { label: 'Tất cả hồ sơ', value: 'all' },
    { label: '⏳ Chờ duyệt', value: 'pending' },
    { label: '✅ Đã duyệt', value: 'approved' },
    { label: '❌ Từ chối', value: 'rejected' },
  ]

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Duyệt hồ sơ Gia sư
          </h2>
          <p className="text-xs text-slate-500 mt-1">Thẩm định thông tin chuyên môn, bằng cấp chứng chỉ trước khi hiển thị gia sư</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Input
            placeholder="🔍 Tìm theo tên, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 w-full sm:w-auto overflow-x-auto">
            {statusFilterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === opt.value
                    ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <Table
        columns={columns}
        data={applications}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="Không có hồ sơ gia sư nào phù hợp với bộ lọc"
      />

      {/* Detail Modal */}
      {selectedApp && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedApp(null)
          }}
          title={`Hồ sơ Gia sư — ${selectedApp.fullName}`}
          size="lg"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)}>
                Đóng
              </Button>
              {selectedApp.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => setIsRejectModalOpen(true)}
                  >
                    Từ chối hồ sơ
                  </Button>
                  <Button
                    variant="gradient"
                    loading={isActionLoading}
                    onClick={() => handleApprove(selectedApp)}
                  >
                    Duyệt hồ sơ ngay
                  </Button>
                </>
              )}
            </>
          }
        >
          <div className="space-y-6 text-sm text-slate-800 dark:text-slate-200">
            <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/70 dark:border-slate-800">
              <div>
                <span className="text-xs font-medium text-slate-400">Mã hồ sơ:</span>
                <p className="font-bold text-brand-600">{selectedApp.id}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400">Họ và tên:</span>
                <p className="font-bold">{selectedApp.fullName}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400">Email liên hệ:</span>
                <p className="font-semibold">{selectedApp.email}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400">Số điện thoại:</span>
                <p className="font-semibold">{selectedApp.phone}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400">Trình độ đào tạo:</span>
                <p className="font-semibold">{selectedApp.qualification}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400">Số năm kinh nghiệm:</span>
                <p className="font-semibold">{selectedApp.experienceYears} năm</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                Môn học đăng ký giảng dạy
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedApp.subjects.map((sub) => (
                  <span
                    key={sub}
                    className="px-3.5 py-1.5 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/60 rounded-xl text-xs font-bold"
                  >
                    📚 {sub}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                Giới thiệu bản thân & Phương pháp dạy
              </h4>
              <p className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs leading-relaxed border border-slate-200/60 dark:border-slate-800">
                {selectedApp.bio}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                Bằng cấp & Chứng chỉ minh chứng
              </h4>
              <div className="space-y-2.5">
                {selectedApp.degrees.map((deg, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">📜</span>
                      <span className="font-bold">{deg.name}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200">
                      ✓ Đã xác thực
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedApp.status === 'rejected' && selectedApp.rejectionReason && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300">Lý do từ chối trước đó:</span>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{selectedApp.rejectionReason}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Reject Modal Form */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Từ chối hồ sơ gia sư"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              loading={isActionLoading}
              onClick={handleRejectConfirm}
            >
              Xác nhận Từ chối
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Vui lòng nhập rõ lý do từ chối để hệ thống phản hồi cho gia sư.
          </p>
          <textarea
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Ví dụ: Bằng cấp đính kèm không hợp lệ..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
          />
        </div>
      </Modal>
    </div>
  )
}

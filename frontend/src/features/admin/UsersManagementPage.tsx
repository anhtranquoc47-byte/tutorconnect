import { useEffect, useState } from 'react'
import { adminApi } from './admin.api'
import type { AdminUser } from './admin.types'
import { Table, type Column } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/ToastContext'

type UserAction = 'lock' | 'deactivate' | 'activate'

export function UsersManagementPage() {
  const toast = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState<'all' | 'tutor' | 'student' | 'admin'>('all')
    const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [selectedAction, setSelectedAction] = useState<UserAction | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

   const loadUsers = async () => {
    setIsLoading(true)
    try {
      const roleParam =
        selectedRole === 'admin' ? 1 : selectedRole === 'tutor' ? 2 : selectedRole === 'student' ? 3 : undefined
      const res = await adminApi.getUsers({ search, role: roleParam, pageNumber, pageSize })
      setUsers(res.items)
      setTotalItems(res.totalItems)
    } catch {
      toast.error('Không thể tải danh sách người dùng')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [search, pageNumber, selectedRole])
  const handleAction = (user: AdminUser, action: UserAction) => {
    setSelectedUser(user)
    setSelectedAction(action)
  }

  const confirmAction = async () => {
  console.log('🔥 confirmAction chạy')
  console.log('selectedUser:', selectedUser)
  console.log('selectedAction:', selectedAction)
    if (!selectedUser || !selectedAction) return
    setIsSubmitting(true)
    try {
      if (selectedAction === 'lock') {
        await adminApi.lockUser(selectedUser.id, 'Khóa bởi admin')
        toast.info(`Đã khóa tài khoản ${selectedUser.name}`)
      } else if (selectedAction === 'deactivate') {
        await adminApi.deactivateUser(selectedUser.id, 'Vô hiệu hóa bởi admin')
        toast.info(`Đã vô hiệu hóa tài khoản ${selectedUser.name}`)
      } else {
        await adminApi.activateUser(selectedUser.id)
        toast.success(`Đã kích hoạt lại tài khoản ${selectedUser.name}`)
      }
      setSelectedAction(null)
      setSelectedUser(null)
      void loadUsers()
    } catch {
      toast.error('Thao tác không thành công')
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusConfig = {
    active: { className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200', label: '🟢 Hoạt động' },
    locked: { className: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200', label: '🔴 Bị khóa' },
    inactive: { className: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border border-slate-300', label: '⚫ Vô hiệu hóa' },
  } as const

  const actionCopy: Record<UserAction, { title: string; message: (name: string) => string; confirmText: string; variant: 'danger' | 'primary' }> = {
    lock: {
      title: 'Xác nhận khóa tài khoản',
      message: (name) => `Bạn có chắc chắn muốn khóa tài khoản ${name}? Tài khoản có thể được mở khóa lại sau.`,
      confirmText: 'Khóa Tài Khoản',
      variant: 'danger',
    },
    deactivate: {
      title: 'Xác nhận vô hiệu hóa tài khoản',
      message: (name) => `Bạn có chắc chắn muốn vô hiệu hóa tài khoản ${name}? Dữ liệu tài khoản vẫn được giữ lại, nhưng người dùng sẽ không thể đăng nhập cho đến khi được kích hoạt lại.`,
      confirmText: 'Vô Hiệu Hóa',
      variant: 'danger',
    },
    activate: {
      title: 'Xác nhận kích hoạt tài khoản',
      message: (name) => `Bạn có chắc chắn muốn kích hoạt lại tài khoản ${name}?`,
      confirmText: 'Kích Hoạt',
      variant: 'primary',
    },
  }

  const columns: Column<AdminUser>[] = [
    { key: 'id', header: 'Mã người dùng', render: (row) => <span className="font-mono text-xs font-bold text-slate-400">{row.id}</span> },
    {
      key: 'name',
      header: 'Tên & Email',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">{row.name}</p>
            <span className="text-xs text-slate-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
          row.role === 'admin'
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
            : row.role === 'tutor'
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            : 'bg-brand-100 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300'
        }`}>
          {row.role === 'admin' ? 'Quản trị viên' : row.role === 'tutor' ? 'Gia sư' : 'Học viên'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (row) => (
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusConfig[row.status].className}`}>
          {statusConfig[row.status].label}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (row) => {
        if (row.status === 'active') {
          return (
            <div className="flex gap-2">
              <Button size="sm" variant="danger" onClick={() => handleAction(row, 'lock')}>
                🔒 Khóa
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleAction(row, 'deactivate')}>
                ⚫ Vô hiệu hóa
              </Button>
            </div>
          )
        }
        // Locked hoặc Inactive đều quay lại Active qua cùng 1 hành động
        return (
          <Button size="sm" variant="outline" onClick={() => handleAction(row, 'activate')}>
            🔓 Kích hoạt lại
          </Button>
        )
      },
    },
  ]

  const activeCopy = selectedAction ? actionCopy[selectedAction] : null

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Quản lý Người dùng</h2>
          <p className="text-xs text-slate-500 mt-1">Danh sách người dùng toàn hệ thống, quản lý quyền hạn và khóa/mở khóa tài khoản</p>
        </div>
               {/* THANH CHỌN ROLE VÀ Ô TÌM KIẾM */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Bộ Tabs Lọc Role */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'tutor', label: '👨‍🏫 Gia sư' },
              { id: 'student', label: '🎓 Học viên' },
              { id: 'admin', label: '🛡️ Quản trị viên' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedRole(tab.id as any)
                  setPageNumber(1) // Reset về trang 1 khi đổi role
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                  selectedRole === tab.id
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ô tìm kiếm */}
          <Input
            placeholder="🔍 Tìm theo email hoặc tên..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPageNumber(1)
            }}
            className="w-full sm:w-60"
          />
        </div>
      </div>
      
    <Table columns={columns} data={users} keyExtractor={(row) => row.id} isLoading={isLoading} emptyMessage="Không có người dùng nào" />
            {/* Thanh Phân Trang 1 2 3... */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="text-xs font-bold text-slate-500">
          Hiển thị <span className="text-slate-900 dark:text-slate-100 font-extrabold">{users.length > 0 ? (pageNumber - 1) * pageSize + 1 : 0}</span> -{' '}
          <span className="text-slate-900 dark:text-slate-100 font-extrabold">{Math.min(pageNumber * pageSize, totalItems)}</span> trên tổng số{' '}
          <span className="text-brand-600 dark:text-brand-400 font-extrabold">{totalItems}</span> người dùng
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Button
            size="sm"
            variant="outline"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
          >
            ‹ Trước
          </Button>

          {Array.from({ length: Math.ceil(totalItems / pageSize) || 1 }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPageNumber(p)}
              className={`h-8 min-w-[32px] px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                pageNumber === p
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {p}
            </button>
          ))}

          <Button
            size="sm"
            variant="outline"
            disabled={pageNumber >= Math.ceil(totalItems / pageSize)}
            onClick={() => setPageNumber((prev) => prev + 1)}
          >
            Sau ›
          </Button>
        </div>
      </div>
      {selectedUser && activeCopy && (
        <ConfirmDialog
          isOpen={!!selectedUser && !!selectedAction}
          title={activeCopy.title}
          message={activeCopy.message(selectedUser.name)}
          confirmText={activeCopy.confirmText}
          variant={activeCopy.variant}
          isLoading={isSubmitting}
          onClose={() => setSelectedAction(null)}
          onConfirm={confirmAction}
        />
      )}
    </div>
  )
}
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/ToastContext'
import { authApi } from './auth.api'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải từ 6 ký tự trở lên')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await authApi.changePassword({ currentPassword, newPassword })
      toast.success('Đổi mật khẩu thành công!')
      onClose()
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đổi mật khẩu thất bại'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đổi mật khẩu tài khoản">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Mật khẩu hiện tại"
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <Input
          label="Mật khẩu mới"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <Input
          label="Xác nhận mật khẩu mới"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={error || undefined}
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" loading={loading}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  )
}

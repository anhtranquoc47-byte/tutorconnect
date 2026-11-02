import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import type { CreateUserInput, User } from './users.types'

interface Props {
  open: boolean
  initial?: User | null
  submitting?: boolean
  onClose: () => void
  onSubmit: (input: CreateUserInput) => void
}

const empty: CreateUserInput = { name: '', username: '', email: '' }

export function UserFormDialog({ open, initial, submitting, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const [form, setForm] = useState<CreateUserInput>(empty)

  useEffect(() => {
    setForm(
      initial
        ? { name: initial.name, username: initial.username, email: initial.email }
        : empty,
    )
  }, [initial, open])

  if (!open) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-lg font-semibold">
          {initial ? t('users.edit') : t('users.create')}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Input
            label={t('users.name')}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label={t('users.username')}
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            required
          />
          <Input
            label={t('users.email')}
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t('users.cancel')}
            </Button>
            <Button type="submit" loading={submitting}>
              {t('users.save')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

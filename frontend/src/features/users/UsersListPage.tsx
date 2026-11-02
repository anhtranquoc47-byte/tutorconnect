import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useDebounce } from '@/hooks/useDebounce'
import { UserFormDialog } from './UserFormDialog'
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from './users.queries'
import type { CreateUserInput, User } from './users.types'

export function UsersListPage() {
  const { t } = useTranslation()
  const { data: users, isLoading, isError, refetch } = useUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    if (!q) return users ?? []
    return (users ?? []).filter((u) =>
      [u.name, u.username, u.email].some((v) => v.toLowerCase().includes(q)),
    )
  }, [users, debounced])

  function handleSubmit(input: CreateUserInput) {
    if (editing) {
      updateUser.mutate(
        { id: editing.id, input },
        { onSuccess: () => setDialogOpen(false) },
      )
    } else {
      createUser.mutate(input, { onSuccess: () => setDialogOpen(false) })
    }
  }

  if (isLoading) return <Spinner />
  if (isError)
    return (
      <div className="flex flex-col items-center gap-3 p-8">
        <p className="text-red-600">{t('common.error')}</p>
        <Button variant="secondary" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    )

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t('users.title')}</h1>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          {t('users.create')}
        </Button>
      </div>

      <Input
        placeholder={t('users.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 font-medium">{t('users.name')}</th>
              <th className="px-4 py-3 font-medium">{t('users.username')}</th>
              <th className="px-4 py-3 font-medium">{t('users.email')}</th>
              <th className="px-4 py-3 text-right font-medium">{t('users.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  {t('users.empty')}
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-100 last:border-0 dark:border-gray-800"
              >
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">@{u.username}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditing(u)
                        setDialogOpen(true)
                      }}
                    >
                      {t('users.edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={deleteUser.isPending && deleteUser.variables === u.id}
                      onClick={() => deleteUser.mutate(u.id)}
                    >
                      {t('users.delete')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <UserFormDialog
        open={dialogOpen}
        initial={editing}
        submitting={createUser.isPending || updateUser.isPending}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </section>
  )
}

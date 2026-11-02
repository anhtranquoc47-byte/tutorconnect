import { useTranslation } from 'react-i18next'

export function Spinner({ label }: { label?: string }) {
  const { t } = useTranslation()
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 p-8 text-gray-500"
    >
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span>{label ?? t('common.loading')}</span>
    </div>
  )
}

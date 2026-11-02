import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-brand-600 text-6xl font-black">404</p>
      <p className="text-gray-500">{t('common.notFound')}</p>
      <Link to="/" className="text-brand-600 hover:underline">
        {t('common.backHome')}
      </Link>
    </div>
  )
}

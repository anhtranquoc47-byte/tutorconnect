import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FeatureList } from './FeatureList'
import { HeroSection } from './HeroSection'

export function HomepageView() {
  const { t } = useTranslation()

  return (
    <section className="flex flex-col gap-10">
      <HeroSection
        title={t('app.name')}
        tagline={t('app.tagline')}
        ctaLabel={t('nav.users')}
        ctaTo="/users"
      />
      <FeatureList />
      <Link
        to="/users"
        className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline"
      >
        {t('nav.users')} →
      </Link>
    </section>
  )
}

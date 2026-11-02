import { Link } from 'react-router-dom'

type HeroSectionProps = {
  title: string
  tagline: string
  ctaLabel: string
  ctaTo: string
}

/** Homepage view — hero block */
export function HeroSection({ title, tagline, ctaLabel, ctaTo }: HeroSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="max-w-xl text-base text-gray-500 dark:text-gray-400">{tagline}</p>
      <div>
        <Link
          to={ctaTo}
          className="inline-flex items-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  )
}

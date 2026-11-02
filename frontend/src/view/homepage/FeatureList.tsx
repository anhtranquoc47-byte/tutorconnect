const FEATURES = [
  'React 19 + Vite',
  'TanStack Query + Zustand',
  'Tailwind CSS v4',
  'i18n (en/vi)',
  'Axios API layer + guards',
  'Vitest + Testing Library',
] as const

/** Homepage view — feature grid */
export function FeatureList() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((feature) => (
        <li
          key={feature}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium dark:border-gray-800 dark:bg-gray-900"
        >
          {feature}
        </li>
      ))}
    </ul>
  )
}

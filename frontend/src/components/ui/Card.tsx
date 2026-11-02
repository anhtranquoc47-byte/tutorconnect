import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/95',
        className,
      )}
      {...props}
    />
  )
}

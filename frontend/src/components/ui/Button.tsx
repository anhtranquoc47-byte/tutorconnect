import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'gradient' | 'white'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98] focus-visible:ring-brand-500 shadow-md shadow-brand-600/25 hover:shadow-lg hover:shadow-brand-600/35',
  gradient:
    'bg-gradient-to-r from-brand-600 to-indigo-600 text-white hover:from-brand-700 hover:to-indigo-700 active:scale-[0.98] focus-visible:ring-brand-500 shadow-md shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40',
  secondary:
    'bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-[0.98] dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 active:scale-[0.98] dark:text-slate-300 dark:hover:bg-slate-800',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98] focus-visible:ring-rose-500 shadow-md shadow-rose-600/25 hover:shadow-lg hover:shadow-rose-600/35',
  outline:
    'bg-transparent border border-slate-300/80 text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
  white:
    'bg-white text-brand-700 hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-white shadow-xl shadow-black/10 font-extrabold',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-xs rounded-lg font-medium',
  md: 'h-10 px-4 text-sm rounded-xl font-semibold',
  lg: 'h-12 px-6 text-base rounded-2xl font-bold',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer select-none',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
})

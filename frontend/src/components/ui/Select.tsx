import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { clsx } from 'clsx'

export interface SelectOption {
  label: string
  value: string | number
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, className, id, ...props },
  ref,
) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
          {label}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        aria-invalid={!!error}
        className={clsx(
          'h-10 w-full rounded-lg border px-3 text-sm transition-all outline-none bg-white text-gray-900',
          'border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20',
          'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-indigo-400',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
})

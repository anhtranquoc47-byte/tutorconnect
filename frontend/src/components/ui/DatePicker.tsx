import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

export interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { label, error, className, id, ...props },
  ref,
) {
  const generatedId = useId()
  const dateId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={dateId}
          className="text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={dateId}
        type="date"
        aria-invalid={!!error}
        className={clsx(
          'h-10 w-full rounded-lg border px-3 text-sm transition-all outline-none bg-white text-gray-900',
          'border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20',
          'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-indigo-400',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
})

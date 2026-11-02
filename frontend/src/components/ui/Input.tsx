import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, icon, className, id, type = 'text', ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const computedType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={computedType}
          aria-invalid={!!error}
          className={clsx(
            'h-10 w-full rounded-lg border text-sm transition-all outline-none',
            'border-gray-300 bg-white text-gray-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20',
            'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-indigo-400',
            icon ? 'pl-9 pr-3' : 'px-3',
            isPassword ? 'pr-10' : '',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            className="absolute right-3 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
          >
            {showPassword ? 'Ẩn' : 'Hiện'}
          </button>
        )}
      </div>

      {error ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      ) : null}
    </div>
  )
})

import { StrictMode, Suspense, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { queryClient } from './query-client'
import i18n from '@/lib/i18n'
import { Spinner } from '@/components/ui/Spinner'
import { AuthInitializer } from '@/features/auth/AuthInitializer'
import { ToastProvider } from '@/components/ui/ToastContext'

/** Wraps the app with every cross-cutting provider in one place. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<Spinner />}>
             <AuthInitializer>
              <ToastProvider>{children}</ToastProvider>
            </AuthInitializer>
          </Suspense>
        </QueryClientProvider>
      </I18nextProvider>
    </StrictMode>
  )
}

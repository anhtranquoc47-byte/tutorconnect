import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { env } from '@/config/env'
import en from './locales/en.json'
import vi from './locales/vi.json'

export const resources = {
  en: { translation: en },
  vi: { translation: vi },
} as const

export const supportedLocales = Object.keys(resources) as Array<keyof typeof resources>

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: env.defaultLocale,
    supportedLngs: supportedLocales,
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n

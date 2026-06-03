import { useEffect, useState } from 'react'

export const THEME_STORAGE_KEY = 'kinetic-theme'
export const THEME_EVENT = 'kinetic-theme-change'
export const themes = ['light', 'dark', 'system']

export const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'system'

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return themes.includes(stored) ? stored : 'system'
}

const prefersDark = () => (
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
)

export const applyTheme = (theme) => {
  if (typeof document === 'undefined') return

  const isDark = theme === 'dark' || (theme === 'system' && prefersDark())
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.dataset.theme = theme
}

export function setStoredTheme(theme) {
  const nextTheme = themes.includes(theme) ? theme : 'system'
  window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  applyTheme(nextTheme)
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: nextTheme }))
}

export function useTheme() {
  const [theme, setThemeState] = useState(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleMedia = () => {
      if (getStoredTheme() === 'system') applyTheme('system')
    }
    const handleTheme = (event) => {
      const nextTheme = themes.includes(event.detail) ? event.detail : getStoredTheme()
      setThemeState(nextTheme)
    }

    media.addEventListener('change', handleMedia)
    window.addEventListener(THEME_EVENT, handleTheme)

    return () => {
      media.removeEventListener('change', handleMedia)
      window.removeEventListener(THEME_EVENT, handleTheme)
    }
  }, [])

  const setTheme = (nextTheme) => {
    setThemeState(nextTheme)
    setStoredTheme(nextTheme)
  }

  const resolvedTheme = theme === 'system' ? (prefersDark() ? 'dark' : 'light') : theme

  return { theme, resolvedTheme, setTheme }
}


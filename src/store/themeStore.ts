import { create } from 'zustand'
import { storage } from '@/utils/storage'

type ThemeMode = 'auto' | 'light' | 'dark'

interface ThemeState {
  theme: ThemeMode
  cycleTheme: () => void
  setTheme: (theme: ThemeMode) => void
  getEffectiveTheme: () => 'light' | 'dark'
}

const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyTheme = (theme: ThemeMode) => {
  const effectiveTheme = theme === 'auto' ? getSystemTheme() : theme
  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const useThemeStore = create<ThemeState>((set, get) => {
  // Initialize theme from storage (default to 'auto')
  const savedTheme = storage.getTheme()
  const initialTheme: ThemeMode = savedTheme || 'auto'

  // Apply initial theme
  applyTheme(initialTheme)

  // Listen to system theme changes when in auto mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = () => {
    const currentTheme = get().theme
    if (currentTheme === 'auto') {
      applyTheme('auto')
    }
  }
  mediaQuery.addEventListener('change', handleSystemThemeChange)

  return {
    theme: initialTheme,
    cycleTheme: () => {
      const currentTheme = get().theme
      let newTheme: ThemeMode
      if (currentTheme === 'auto') {
        newTheme = 'light'
      } else if (currentTheme === 'light') {
        newTheme = 'dark'
      } else {
        newTheme = 'auto'
      }
      storage.setTheme(newTheme)
      applyTheme(newTheme)
      set({ theme: newTheme })
    },
    setTheme: (theme: ThemeMode) => {
      storage.setTheme(theme)
      applyTheme(theme)
      set({ theme })
    },
    getEffectiveTheme: () => {
      const theme = get().theme
      return theme === 'auto' ? getSystemTheme() : theme
    },
  }
})

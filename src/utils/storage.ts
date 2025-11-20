import { ApplyFilters, JobApplication } from '@/types/filters'

const STORAGE_KEYS = {
  FILTERS: 'apply-bot-filters',
  APPLICATIONS: 'apply-bot-applications',
  THEME: 'apply-bot-theme',
} as const

export const storage = {
  // Filters
  getFilters(): ApplyFilters | null {
    const data = localStorage.getItem(STORAGE_KEYS.FILTERS)
    return data ? JSON.parse(data) : null
  },

  setFilters(filters: ApplyFilters): void {
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters))
  },

  // Applications
  getApplications(): JobApplication[] {
    const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS)
    return data ? JSON.parse(data) : []
  },

  setApplications(applications: JobApplication[]): void {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications))
  },

  addApplication(application: JobApplication): void {
    const apps = this.getApplications()
    apps.unshift(application)
    this.setApplications(apps)
  },

  // Theme
  getTheme(): 'auto' | 'light' | 'dark' {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME)
    return (theme as 'auto' | 'light' | 'dark') || 'auto'
  },

  setTheme(theme: 'auto' | 'light' | 'dark'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  },

  // Clear all data
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  },
}

// Export/Import utilities
export const exportFiltersToJSON = (filters: ApplyFilters): void => {
  const dataStr = JSON.stringify(filters, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'apply-filters.json'
  link.click()
  URL.revokeObjectURL(url)
}

export const importFiltersFromJSON = (file: File): Promise<ApplyFilters> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const filters = JSON.parse(e.target?.result as string)
        resolve(filters)
      } catch (error) {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

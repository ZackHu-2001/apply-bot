import { create } from 'zustand'
import { JobApplication } from '@/types/filters'
import { storage } from '@/utils/storage'

interface ApplicationsState {
  applications: JobApplication[]
  loadApplications: () => void
  addApplication: (application: JobApplication) => void
  removeApplication: (id: string) => void
  clearApplications: () => void
}

export const useApplicationsStore = create<ApplicationsState>((set) => ({
  applications: storage.getApplications(),
  loadApplications: () => {
    const applications = storage.getApplications()
    set({ applications })
  },
  addApplication: (application) => {
    storage.addApplication(application)
    set((state) => ({
      applications: [application, ...state.applications],
    }))
  },
  removeApplication: (id) => {
    set((state) => {
      const filtered = state.applications.filter((app) => app.id !== id)
      storage.setApplications(filtered)
      return { applications: filtered }
    })
  },
  clearApplications: () => {
    storage.setApplications([])
    set({ applications: [] })
  },
}))

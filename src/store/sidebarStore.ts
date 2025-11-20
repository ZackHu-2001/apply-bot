import { create } from 'zustand'
import { storage } from '@/utils/storage'

interface SidebarState {
  collapsed: boolean
  toggle: () => void
  setCollapsed: (collapsed: boolean) => void
}

const STORAGE_KEY = 'apply-bot-sidebar-collapsed'

export const useSidebarStore = create<SidebarState>((set) => {
  // Initialize from storage
  const savedCollapsed = localStorage.getItem(STORAGE_KEY)
  const initialCollapsed = savedCollapsed === 'true'

  return {
    collapsed: initialCollapsed,
    toggle: () =>
      set((state) => {
        const newCollapsed = !state.collapsed
        localStorage.setItem(STORAGE_KEY, String(newCollapsed))
        return { collapsed: newCollapsed }
      }),
    setCollapsed: (collapsed: boolean) => {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
      set({ collapsed })
    },
  }
})


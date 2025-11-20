import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import { useSidebarStore } from '@/store/sidebarStore'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { collapsed } = useSidebarStore()

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0c0a09] transition-colors">
      <Sidebar />
      <div className={`transition-all duration-300 ease-in-out ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

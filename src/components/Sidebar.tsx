import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, Calendar, Monitor, Sun, Moon, FileText, BookOpen, Settings2 } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { useSidebarStore } from '@/store/sidebarStore'
import logo from '/logo.svg'

export default function Sidebar() {
  const location = useLocation()
  const { theme, cycleTheme } = useThemeStore()
  const { collapsed, toggle } = useSidebarStore()

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/applications', icon: FileText, label: 'Applications' },
    { to: '/config', icon: Settings2, label: 'Config' },
    { to: '/unknown-questions', icon: BookOpen, label: 'Knowledge Base' },
    // { to: '/scheduler', icon: Calendar, label: 'Scheduler' },
    // { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  const getThemeIcon = () => {
    if (theme === 'auto') {
      return <Monitor size={16} />
    } else if (theme === 'light') {
      return <Sun size={16} />
    } else {
      return <Moon size={16} />
    }
  }

  const getThemeLabel = () => {
    if (theme === 'auto') {
      return 'Auto'
    } else if (theme === 'light') {
      return 'Light'
    } else {
      return 'Dark'
    }
  }

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-stone-800 border-r border-gray-200 dark:border-stone-700 hidden lg:block transition-all duration-300 ease-in-out ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`flex items-center border-b border-gray-200 dark:border-stone-700 transition-all duration-300 ease-in-out ${
          collapsed ? 'px-4 py-3 justify-center' : 'px-6 py-4 justify-between'
        }`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="w-8 h-8 flex-shrink-0" />
              <span className="font-bold text-lg text-gray-900 dark:text-white whitespace-nowrap">Apply Bot</span>
            </div>
          )}
          <button
            onClick={toggle}
            className={`rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-stone-700 transition-colors flex-shrink-0 ${
              collapsed ? 'p-2' : 'p-1.5'
            }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <img src={logo} alt="Logo" className="w-8 h-8 flex-shrink-0" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="none"
                viewBox="0 0 24 24"
                className="h-4 w-4 flex-shrink-0 [&_path]:stroke-[1.5px]"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2px"
                  d="M9 3v18M7.8 3h8.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C21 5.28 21 6.12 21 7.8v8.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 space-y-1 transition-all duration-300 ease-in-out ${collapsed ? 'px-2' : 'px-4'}`}>
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center rounded-lg transition-all duration-300 ease-in-out ${
                  collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
                } ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-stone-700'
                }`}
                title={collapsed ? link.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className={`font-medium whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden ${
                  collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[150px] opacity-100 ml-0'
                }`}>
                  {link.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Theme Toggle at bottom */}
        <div className={`py-3 border-t border-gray-200 dark:border-stone-700 transition-all duration-300 ease-in-out ${collapsed ? 'px-2' : 'px-4'}`}>
          <button
            onClick={cycleTheme}
            className={`flex items-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-stone-700 transition-all duration-300 ease-in-out ${
              collapsed ? 'justify-center w-full px-2 py-2' : 'gap-2 px-3 py-2 w-full'
            }`}
            aria-label={`Theme: ${getThemeLabel()}`}
            title={collapsed ? `Theme: ${getThemeLabel()}` : undefined}
          >
            <span className="flex-shrink-0">{getThemeIcon()}</span>
            <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden ${
              collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[100px] opacity-100 ml-0'
            }`}>
              {getThemeLabel()}
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}

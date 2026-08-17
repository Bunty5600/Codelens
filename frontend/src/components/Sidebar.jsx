import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Upload, BarChart2, User,
  LogOut, Clock, GitBranch
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import clsx from 'clsx'
import logo from '../assets/logo.png'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload',    icon: Upload,          label: 'Upload'    },
  { to: '/results',   icon: BarChart2,       label: 'Results'   },
  { to: '/profile',   icon: User,            label: 'Profile'   },
  { to: '/history',   icon: Clock,           label: 'History'   },
  { to: '/github',    icon: GitBranch,       label: 'GitHub'    },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Personal')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 min-h-screen
                      border-r border-slate-100 dark:border-slate-800/80
                      bg-white dark:bg-[#111625] px-4 py-5 text-slate-900 dark:text-slate-100 font-sans antialiased">

      {/* Enlarged Logo Section */}
      <div className="flex items-center px-2 mb-4">
        <img
          src={logo}
          alt="CodeLens AI"
          className="h-16 w-auto object-contain max-w-[180px]"
        />
      </div>

      {/* Segmented Switcher Pill */}
      <div className="p-1 mb-6 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 flex items-center">
        {['Personal', 'Business'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'flex-1 py-1.5 text-xs font-bold rounded-full transition-all duration-200 text-center',
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 space-y-6">
        <nav className="space-y-1">
          {NAV.map((item) => {
            const ItemIcon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                  isActive
                    ? 'text-slate-900 dark:text-white font-bold bg-slate-100/80 dark:bg-slate-800/60'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                )}
              >
                {({ isActive }) => (
                  <>
                    <ItemIcon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-slate-900 dark:text-white stroke-[2.5]' : 'stroke-[1.75]')} />
                    <span className="flex-1">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Bottom Floating Profile Card */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
        <div className="flex items-center justify-between p-2.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden shadow-xs">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name?.[0]?.toUpperCase() ?? 'U'}</span>
              )}
            </div>

            <div className="min-w-0 pr-1">
              <p className="text-xs font-bold leading-tight truncate text-slate-900 dark:text-white">
                {user?.name ?? 'User'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user?.email ?? 'user@codelens.ai'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-all shrink-0 mr-0.5"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  )
}
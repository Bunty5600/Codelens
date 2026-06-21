import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Upload, BarChart2, User,
  LogOut, ChevronRight, Clock, GitBranch
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'
import logo from '../assets/logo.png'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload',    icon: Upload,           label: 'Upload'    },
  { to: '/results',   icon: BarChart2,        label: 'Results'   },
  { to: '/profile',   icon: User,             label: 'Profile'   },
  { to: '/history',   icon: Clock,            label: 'History'   },
  { to: '/github',    icon: GitBranch,           label: 'GitHub'    },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 min-h-screen
                      border-r border-slate-200 dark:border-slate-800
                      bg-white dark:bg-slate-950 px-3 py-5">

      {/* Logo */}
      <img
        src={logo}
        alt="CodeLens AI"
        className="h-24 w-auto object-contain"
      />

      {/* Section label */}
      <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
        Navigation
      </p>

      {/* Links */}
      <nav className="flex-1 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => clsx(
              'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 -translate-x-1 group-hover:translate-x-0 transition-all" />
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2 space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">
              {user?.name ?? 'User'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email ?? ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500
                     hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </aside>
  )
}
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Upload, BarChart2, User,
  LogOut, Clock, GitBranch, Menu, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import clsx from 'clsx'
import logo from '../assets/logo.png'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload',    icon: Upload,           label: 'Upload'    },
  { to: '/results',   icon: BarChart2,        label: 'Results'   },
  { to: '/github',    icon: GitBranch,        label: 'GitHub'    },
  { to: '/history',   icon: Clock,            label: 'History'   },
  { to: '/profile',   icon: User,             label: 'Profile'   },
]

export default function MobileNav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden glass h-14 flex items-center justify-between px-4 shrink-0 sticky top-0 z-40">
        <img src={logo} alt="CodeLens AI" className="h-10 w-auto object-contain" />
        <button
          onClick={() => setOpen(true)}
          className="btn-ghost w-9 h-9 p-0 rounded-xl"
          type="button"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={clsx(
        'fixed top-0 left-0 h-full w-64 z-50 bg-white dark:bg-slate-950 px-3 py-5 flex flex-col transition-transform duration-300 md:hidden',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-2">
          <img src={logo} alt="CodeLens AI" className="h-12 w-auto object-contain" />
          <button
            onClick={() => setOpen(false)}
            className="btn-ghost w-8 h-8 p-0 rounded-lg"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
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
              <p className="text-sm font-semibold leading-tight truncate">{user?.name ?? 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email ?? ''}</p>
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
      </div>
    </>
  )
}
import { Link, useNavigate } from 'react-router-dom'
import { Code2, Sun, Moon, LogOut, ChevronDown } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth }  from '../context/AuthContext.jsx'
import { useState } from 'react'
import logo from '../assets/logo.png';
export default function Navbar({ appMode = false }) {
  const { dark, toggle } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
       <Link
  to={user ? "/dashboard" : "/"}
  className="flex items-center"
>
<img
  src={logo}
  alt="CodeLens AI"
  className="h-24 w-30 object-contain"
/>
</Link>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="btn-ghost w-9 h-9 p-0 rounded-xl"
            aria-label="Toggle theme"
          >
            {dark
              ? <Sun  className="w-4 h-4" />
              : <Moon className="w-4 h-4" />
            }
          </button>

          {user ? (
            /* User menu */
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 card shadow-xl py-1 animate-fade-in">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <hr className="my-1 border-slate-200 dark:border-slate-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"  className="btn-ghost text-sm">Log in</Link>
              <Link to="/signup" className="btn-primary text-sm py-2">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
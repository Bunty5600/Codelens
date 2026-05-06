import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Code2, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import Alert from '../components/Alert'
import {authAPI} from '../services/api'

const PERKS = [
  'Cyclomatic, Halstead & MI analysis',
  'ZIP project upload support',
  'AI-powered refactor suggestions',
  'Unlimited analysis history',
]

export default function Signup() {
  const { login } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const [form,    setForm]    = useState({ name: '', email: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [show,    setShow]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [alert,   setAlert]   = useState(null)

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name     = 'Name is required'
    if (!form.email)        e.email    = 'Email is required'
    if (!form.password)     e.password = 'Password is required'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email))  e.email    = 'Enter a valid email'
    if (form.password && form.password.length < 8)        e.password = 'Must be at least 8 characters'
    return e
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  const errs = validate()
  if (Object.keys(errs).length) { setErrors(errs); return }

  setLoading(true)
  setErrors({})
  try {
    const res = await authAPI.signup(form)       // calls POST /auth/signup
    login({ ...res.data, joinedAt: new Date().toISOString() })
    navigate('/dashboard')
  } catch (err) {
    setAlert({ type: 'error', message: err.response?.data?.detail || 'Signup failed' })
  } finally {
    setLoading(false)
  }
}
  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
  }

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-950 p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <Link to="/" className="flex items-center gap-2 z-10">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-white text-xl">CodeLens AI</span>
        </Link>

        <div className="z-10">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Start writing better code today.</h2>
          <p className="text-slate-400 text-sm mb-8">Join 3,200+ teams who trust CodeLens AI.</p>
          <ul className="space-y-3">
            {PERKS.map(p => (
              <li key={p} className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-600 z-10">© {new Date().getFullYear()} CodeLens AI</p>
      </div>

      {/* Right */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end items-center gap-3 px-6 py-4">
          <button onClick={toggle} className="btn-ghost w-9 h-9 p-0 rounded-xl">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <span className="text-sm text-slate-500">Have an account?</span>
          <Link to="/login" className="btn-secondary text-sm py-1.5 px-4">Log in</Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Create account</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Free forever. No credit card needed.</p>
            </div>

            {alert && <div className="mb-5"><Alert {...alert} onClose={() => setAlert(null)} /></div>}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name */}
              <div>
                <label className="label">Full name</label>
                <input type="text" value={form.name} onChange={set('name')}
                  className={`input ${errors.name ? 'border-red-400' : ''}`}
                  placeholder="Future Dev" autoComplete="name" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="label">Email address</label>
                <input type="email" value={form.email} onChange={set('email')}
                  className={`input ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="you@example.com" autoComplete="email" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                    placeholder="Min. 8 characters" autoComplete="new-password" />
                  <button type="button" onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div className="flex gap-1 mt-2">
                    {[1,2,3].map(n => (
                      <div key={n} className={`h-1 flex-1 rounded-full transition-all ${
                        n <= strength
                          ? strength === 1 ? 'bg-red-400'
                          : strength === 2 ? 'bg-yellow-400'
                          : 'bg-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`} />
                    ))}
                  </div>
                )}
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                  : <>Create account <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-5 leading-relaxed">
              By signing up you agree to our{' '}
              <a href="#" className="text-emerald-500 hover:underline">Terms</a>{' '}
              and{' '}
              <a href="#" className="text-emerald-500 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
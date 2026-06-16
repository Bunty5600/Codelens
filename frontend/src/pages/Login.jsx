import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Code2, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import Alert from '../components/Alert'
import { authAPI } from '../services/api'
import logo from '../assets/logo.png';

export default function Login() {
  const { login } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [show,    setShow]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [alert,   setAlert]   = useState(null)

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    return e
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  const errs = validate()
  if (Object.keys(errs).length) { setErrors(errs); return }

  setLoading(true)
  setErrors({})
  try {
    const res = await authAPI.login(form)        // calls POST /auth/login
    login({ ...res.data, joinedAt: new Date().toISOString() })
    navigate('/dashboard')
  } catch (err) {
    setAlert({ type: 'error', message: err.response?.data?.detail || 'Invalid credentials' })
  } finally {
    setLoading(false)
  }
}

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-slate-950 p-12 relative overflow-hidden">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

     <Link

  className="flex items-center"
>
 <img
  src={logo}
  alt="CodeLens AI"
  className="h-24 w-auto object-contain"
/>
</Link
>
        <div className="z-10">
          <blockquote className="text-2xl font-display font-semibold text-white leading-snug mb-4">
            "ComplexIQ turned code reviews from a bottleneck into a superpower."
          </blockquote>
          <p className="text-slate-400 text-sm">— Ananya Bose, CTO @ Sarvam AI</p>
        </div>

        <div className="flex gap-4 z-10">
          {['68', '12', '94%'].map((v, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-display font-bold text-emerald-400">{v}</p>
              <p className="text-xs text-slate-500">{['Avg MI', 'Max CC', 'Accuracy'][i]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex justify-end items-center gap-3 px-6 py-4">
          <button onClick={toggle} className="btn-ghost w-9 h-9 p-0 rounded-xl">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <span className="text-sm text-slate-500">No account?</span>
          <Link to="/signup" className="btn-primary text-sm py-1.5 px-4">Sign Up</Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Welcome back</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to your ComplexIQ account</p>
            </div>

            {alert && <div className="mb-5"><Alert {...alert} onClose={() => setAlert(null)} /></div>}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  className={`input ${errors.email ? 'border-red-400 focus:ring-red-400/30' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="label mb-0">Password</label>
                  <a href="#" className="text-xs text-emerald-500 hover:text-emerald-600 font-medium">Forgot?</a>
                </div>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    className={`input pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400/30' : ''}`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                  : <>Sign in <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-emerald-500 font-semibold hover:text-emerald-600">Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
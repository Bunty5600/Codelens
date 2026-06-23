import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Code2, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { Sun, Moon } from 'lucide-react'
import Alert from '../components/Alert.jsx'
import { authAPI } from '../services/api'
import logo from '../assets/logo.png'

export default function Login() {
  const { login }      = useAuth()
  const { dark, toggle } = useTheme()
  const navigate       = useNavigate()

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
      const res = await authAPI.login(form)
      login(res.data)
      navigate('/dashboard')
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.detail || 'Login failed' })
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
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            Welcome back.
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            Continue analyzing your code quality with AI-powered insights.
          </p>
          <div className="space-y-4">
            {[
              { title: 'Full project analysis', desc: 'Upload ZIP or GitHub URL' },
              { title: 'AI refactor suggestions', desc: 'Powered by Groq Llama 3.3 70B' },
              { title: 'PDF report export',       desc: 'Download professional reports' },
              { title: 'Analysis history',        desc: 'Track improvements over time' },
            ].map(({ title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-200">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600 z-10">© {new Date().getFullYear()} CodeLens AI</p>
      </div>

      {/* Right */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4">
  <Link to="/" className="flex items-center lg:invisible">
    <img src={logo} alt="CodeLens AI" className="h-16 w-auto object-contain" />
  </Link>
  <div className="flex items-center gap-3">
    <button onClick={toggle} className="btn-ghost w-9 h-9 p-0 rounded-xl">
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
    <span className="text-sm text-slate-500">New here?</span>
    <Link to="/signup" className="btn-secondary text-sm py-1.5 px-4">Sign up</Link>
  </div>
</div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
                Sign in
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Enter your credentials to continue.
              </p>
            </div>

            {alert && (
              <div className="mb-5">
                <Alert {...alert} onClose={() => setAlert(null)} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  className={`input ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label mb-0">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    className={`input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                    placeholder="Your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 mt-2"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                  : <>Sign in <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-5">
              Don't have an account?{' '}
              <Link to="/signup" className="text-emerald-500 hover:underline font-medium">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
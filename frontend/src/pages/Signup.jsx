import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Sun, Moon, Code2, Terminal, Cpu, Database, GitBranch, ShieldCheck, Zap, Layers } from 'lucide-react'
import { useSignUp } from '@clerk/clerk-react'
import { useTheme } from '../context/ThemeContext.jsx'
import Alert from '../components/Alert.jsx'
import logo from '../assets/logo.png'

export default function Signup() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', terms: false })
  const [errors, setErrors] = useState({})
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'First name required'
    if (!form.email) e.email = 'Email required'
    if (!form.password) e.password = 'Password required'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (form.password && form.password.length < 8) e.password = 'Must be at least 8 characters'
    if (!form.terms) e.terms = 'Please accept terms'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (!isLoaded) return

    setLoading(true)
    setErrors({})
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Signup failed'
      setAlert({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!isLoaded || !code) return

    setLoading(true)
    setAlert(null)
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        navigate('/dashboard')
      } else {
        setAlert({ type: 'error', message: 'Verification incomplete. Please try again.' })
      }
    } catch (err) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Invalid code'
      setAlert({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: val }))
    if (errors[k]) setErrors(er => ({ ...er, [k]: '' }))
  }

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 md:p-8 font-sans transition-colors duration-200">

      {/* Outer Card Container */}
      <div className="w-full max-w-6xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">

        {/* Left Side: Form Section */}
        <div className="lg:col-span-6 p-8 md:p-14 flex flex-col justify-between bg-white dark:bg-slate-900">

          {/* Header Row: Logo & Theme Toggle */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="CodeLens AI" className="h-9 w-auto object-contain dark:invert-0" />
            </Link>
            <button
              onClick={toggle}
              type="button"
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Signup Form Core */}
          <div className="max-w-sm w-full mx-auto my-6 space-y-5">

            {!pendingVerification ? (
              <>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Create an account
                  </h1>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                    Start optimizing your code intelligence today.
                  </p>
                </div>

                {/* Google Sign-up Button */}
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-semibold text-xs md:text-sm transition-all shadow-xs flex items-center justify-center gap-2.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign up with Google</span>
                </button>

                {/* Divider */}
                <div className="relative my-3 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <span className="relative px-3 text-[11px] text-slate-400 bg-white dark:bg-slate-900 font-medium">
                    or
                  </span>
                </div>

                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>

                  {/* First Name / Last Name Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={set('firstName')}
                        placeholder="First Name"
                        className={`w-full py-2.5 px-1 bg-transparent border-b text-xs md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors ${
                          errors.firstName ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                        }`}
                      />
                      {errors.firstName && <p className="text-[10px] text-red-500">{errors.firstName}</p>}
                    </div>

                    <div className="space-y-1">
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={set('lastName')}
                        placeholder="Last Name"
                        className="w-full py-2.5 px-1 bg-transparent border-b border-slate-200 dark:border-slate-800 text-xs md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="Email"
                      className={`w-full py-2.5 px-1 bg-transparent border-b text-xs md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors ${
                        errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                    {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        value={form.password}
                        onChange={set('password')}
                        placeholder="Password"
                        className={`w-full py-2.5 px-1 pr-8 bg-transparent border-b text-xs md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors ${
                          errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShow(s => !s)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {form.password && (
                      <div className="flex gap-1 pt-1">
                        {[1, 2, 3].map(n => (
                          <div
                            key={n}
                            className={`h-0.5 flex-1 rounded-full transition-all ${
                              n <= strength
                                ? strength === 1 ? 'bg-red-500'
                                : strength === 2 ? 'bg-amber-500'
                                : 'bg-emerald-500'
                                : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    {errors.password && <p className="text-[10px] text-red-500">{errors.password}</p>}
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={form.terms}
                      onChange={set('terms')}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-800 dark:border-slate-700 dark:bg-slate-800"
                    />
                    <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
                      I agree to the{' '}
                      <a href="#" className="font-semibold text-slate-900 dark:text-white underline underline-offset-2">
                        terms & conditions
                      </a>
                    </label>
                  </div>
                  {errors.terms && <p className="text-[10px] text-red-500">{errors.terms}</p>}

                  <div id="clerk-captcha" />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold text-xs md:text-sm shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
                  </button>
                </form>

                <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-slate-900 dark:text-white underline underline-offset-4 hover:text-slate-600">
                    Log in
                  </Link>
                </p>
              </>
            ) : (
              /* Verification Step */
              <div className="space-y-5 my-8">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Check your email</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Enter the verification code sent to <span className="text-slate-900 dark:text-white font-semibold">{form.email}</span>
                  </p>
                </div>

                {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

                <form onSubmit={handleVerify} className="space-y-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full py-3 px-2 bg-transparent border-b-2 border-slate-300 dark:border-slate-700 text-center tracking-widest text-xl text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white font-mono"
                    placeholder="123456"
                    autoComplete="one-time-code"
                  />

                  <button
                    type="submit"
                    disabled={loading || !code}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold text-xs md:text-sm shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Continue'}
                  </button>
                </form>
              </div>
            )}

          </div>

          <p className="text-[11px] text-slate-400 text-center lg:text-left">
            © {new Date().getFullYear()} CodeLens AI. All rights reserved.
          </p>
        </div>

        {/* Right Side: Tech Doodles Canvas */}
        <div className="lg:col-span-6 relative hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden bg-slate-950">

          {/* Background Ambient Glows & Grid */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
            <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px]" />
          </div>

          {/* Floating Tech Doodles Container */}
          <div className="relative z-10 w-full h-full max-h-[500px] flex items-center justify-center pointer-events-none">

            {/* Doodle 1: Code Terminal Snippet */}
            <div className="absolute top-8 left-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-2xl text-indigo-400 -rotate-6 transform hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-mono text-slate-400">code_analysis.py</span>
              </div>
              <p className="text-xs font-mono text-slate-300">
                <span className="text-purple-400">def</span> <span className="text-blue-400">analyze</span>(ast):<br />
                &nbsp;&nbsp;<span className="text-emerald-400">return</span> ai.refactor(ast)
              </p>
            </div>

            {/* Doodle 2: Floating Tech Icons */}
            <div className="absolute top-12 right-12 p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/30 text-purple-400 rotate-12 backdrop-blur-md shadow-lg">
              <Code2 className="w-7 h-7" />
            </div>

            <div className="absolute top-1/3 left-12 p-3 rounded-xl bg-blue-950/40 border border-blue-800/30 text-blue-400 -rotate-12 backdrop-blur-md shadow-md">
              <Cpu className="w-6 h-6" />
            </div>

            <div className="absolute top-1/2 right-10 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/30 text-emerald-400 rotate-6 backdrop-blur-md shadow-lg">
              <GitBranch className="w-6 h-6" />
            </div>

            <div className="absolute top-1/4 left-1/2 p-3 rounded-xl bg-amber-950/40 border border-amber-800/30 text-amber-400 -rotate-6 backdrop-blur-md shadow-md">
              <Zap className="w-5 h-5" />
            </div>

            {/* Doodle 3: Floating AST Node Badge */}
            <div className="absolute bottom-28 right-8 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-xl rotate-3 flex items-center gap-2 text-slate-300">
              <Database className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-300">AST_PARSER_OK</span>
            </div>

            {/* Doodle 4: Quality Shield Chip */}
            <div className="absolute bottom-12 left-10 p-3 px-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md shadow-xl -rotate-3 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-mono text-slate-300">0 Vulnerabilities</span>
            </div>

            {/* Doodle 5: Central Neural Node Graphic */}
            <div className="p-6 rounded-3xl bg-indigo-950/30 border border-indigo-500/20 backdrop-blur-xl flex items-center justify-center shadow-2xl">
              <div className="p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
                <Layers className="w-10 h-10" />
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
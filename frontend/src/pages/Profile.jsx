import { useState } from 'react'
import { User, Mail, Calendar, Shield, Save, Loader2 } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Alert   from '../components/Alert'
import { useAuth }  from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { Sun, Moon } from 'lucide-react'
import MobileNav from '../components/MobileNav'
export default function Profile() {
  const { user, updateUser } = useAuth()
  const { dark, toggle }     = useTheme()

  const [form,    setForm]    = useState({ name: user?.name || '', email: user?.email || '' })
  const [loading, setLoading] = useState(false)
  const [alert,   setAlert]   = useState(null)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setAlert({ type: 'error', message: 'Name cannot be empty.' }); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    updateUser({ name: form.name })
    setAlert({ type: 'success', message: 'Profile updated successfully!' })
    setLoading(false)
  }

  const joined = user?.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently'

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
  <Sidebar />
  <div className="flex-1 flex flex-col min-w-0">
    <MobileNav />
    <header className="hidden md:flex glass h-16 items-center justify-between px-6 shrink-0">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Account</p>
            <h2 className="font-display font-bold text-slate-900 dark:text-white">Profile</h2>
          </div>
          <button onClick={toggle} className="btn-ghost w-9 h-9 p-0 rounded-xl">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

       <main className="flex-1 p-3 md:p-6 max-w-3xl mx-auto w-full">

          {/* Avatar section */}
          <div className="card p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-2xl font-display font-bold shadow-lg shadow-emerald-500/30 shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">{user?.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Free Plan</span>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="card p-6">
            <h4 className="font-display font-semibold text-slate-900 dark:text-white mb-5">Personal Information</h4>

            {alert && <div className="mb-5"><Alert {...alert} autoClose={3000} onClose={() => setAlert(null)} /></div>}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input pl-10"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="input pl-10 opacity-60 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Email cannot be changed in this demo.</p>
              </div>

              <div>
                <label className="label">Member Since</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={joined} disabled className="input pl-10 opacity-60 cursor-not-allowed" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : <><Save className="w-4 h-4" /> Save Changes</>
                }
              </button>
            </form>
          </div>

          {/* Stats summary */}
          <div className="card p-6">
            <h4 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Usage Summary</h4>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Analyses',  value: '24' },
                { label: 'Avg MI',    value: '67' },
                { label: 'Streak',    value: '7d' },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">{value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
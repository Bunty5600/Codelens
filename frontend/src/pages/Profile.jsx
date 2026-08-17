import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { User, Mail, Calendar, Shield, Save, Loader2, ExternalLink, Check } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Alert   from '../components/Alert.jsx'
import MobileNav from '../components/MobileNav'

export default function Profile() {
  const { user: clerkUser, isLoaded } = useUser()
  const [activeTab, setActiveTab]   = useState('Profile')

  const [form, setForm] = useState({
    name: clerkUser?.fullName || clerkUser?.firstName || '',
    email: clerkUser?.primaryEmailAddress?.emailAddress || ''
  })
  const [loading, setLoading] = useState(false)
  const [alert,   setAlert]   = useState(null)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setAlert({ type: 'error', message: 'Name cannot be empty.' }); return }

    setLoading(true)
    try {
      if (clerkUser) {
        const [firstName, ...lastNameParts] = form.name.trim().split(' ')
        await clerkUser.update({
          firstName,
          lastName: lastNameParts.join(' ') || undefined,
        })
      }
      setAlert({ type: 'success', message: 'Profile updated successfully!' })
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update profile.' })
    } finally {
      setLoading(false)
    }
  }

  const joined = clerkUser?.createdAt
    ? new Date(clerkUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Recently'

  const tabs = ['My details', 'Profile', 'Password', 'Team', 'Plan', 'Billing', 'Notifications']

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b0f19] items-center justify-center text-xs font-medium text-slate-400">
        Loading settings...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#0a0e1a] font-sans antialiased text-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <MobileNav />

        <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto space-y-6">

          {/* Main Card Container */}
          <div className="bg-white dark:bg-[#111625] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">

            {/* Vibrant Gradient Header Banner */}
            <div className="h-44 md:h-52 w-full bg-gradient-to-r from-amber-200 via-pink-400 to-purple-600 relative">
              <div className="absolute inset-0 bg-black/5" />
            </div>

            {/* Profile Info Overlay Header */}
            <div className="px-6 md:px-8 pb-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 md:-mt-20 mb-6">

                {/* Overlapping Circular Avatar */}
                <div className="relative">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-[#111625] bg-slate-900 text-white flex items-center justify-center text-3xl font-bold shadow-md overflow-hidden shrink-0">
                    {clerkUser?.imageUrl ? (
                      <img
                        src={clerkUser.imageUrl}
                        alt={clerkUser?.fullName || 'User Profile'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{clerkUser?.firstName?.[0]?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  {/* Verified Badge */}
                  <div className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full p-1 border-2 border-white dark:border-[#111625]">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Top Action Controls */}
                <div className="flex items-center gap-3 pt-2 sm:pt-0">
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    @{clerkUser?.username || clerkUser?.firstName?.toLowerCase() || 'user'}
                  </span>
                  <a
                    href="#"
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-all flex items-center gap-1.5"
                  >
                    View profile <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Title & Email */}
              <div className="space-y-1 mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {clerkUser?.primaryEmailAddress?.emailAddress}
                </p>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                      activeTab === tab
                        ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Form Content Section */}
              <div className="pt-8">
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">Personal Info</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Update your photo and personal details here.</p>
                </div>

                {alert && <div className="mb-6"><Alert {...alert} autoClose={3000} onClose={() => setAlert(null)} /></div>}

                <form onSubmit={handleSave} className="space-y-6">

                  {/* Name Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 items-start pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2">Full Name</label>
                    <div className="md:col-span-2 relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full text-xs pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-all text-slate-900 dark:text-white shadow-xs"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  {/* Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 items-start pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                      <p className="text-[11px] text-slate-400 mt-0.5">Primary OAuth login email</p>
                    </div>
                    <div className="md:col-span-2 relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={form.email}
                        disabled
                        className="w-full text-xs font-mono pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Member Since Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 items-start pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2">Member Since</label>
                    <div className="md:col-span-2 relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        value={joined}
                        disabled
                        className="w-full text-xs font-mono pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Plan Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 items-start pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">Current Plan</label>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <Shield className="w-3.5 h-3.5" /> Free Tier Member
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ name: clerkUser?.fullName || '', email: clerkUser?.primaryEmailAddress?.emailAddress || '' })}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
                    >
                      {loading
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating…</>
                        : <><Save className="w-3.5 h-3.5" /> Save changes</>
                      }
                    </button>
                  </div>

                </form>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
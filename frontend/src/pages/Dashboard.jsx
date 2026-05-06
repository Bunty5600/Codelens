import { Link } from 'react-router-dom'
import { Upload, BarChart2, GitBranch, Shield, ArrowRight, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Navbar  from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

const RECENT = [
  { name: 'auth_service.py',   mi: 72, cc: 8,  time: '2h ago',   status: 'good'    },
  { name: 'data_processor.py', mi: 44, cc: 22, time: '1d ago',   status: 'warning' },
  { name: 'api_router.js',     mi: 61, cc: 14, time: '3d ago',   status: 'warning' },
  { name: 'utils.ts',          mi: 85, cc: 4,  time: '5d ago',   status: 'good'    },
  { name: 'models.py',         mi: 31, cc: 34, time: '1w ago',   status: 'danger'  },
]

const STATUS_STYLE = {
  good:    { badge: 'badge-green',  icon: CheckCircle,   label: 'Healthy'  },
  warning: { badge: 'badge-yellow', icon: AlertTriangle, label: 'Moderate' },
  danger:  { badge: 'badge-red',    icon: AlertTriangle, label: 'Critical' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="glass h-16 flex items-center justify-between px-6 shrink-0">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{greeting},</p>
            <h2 className="font-display font-bold text-slate-900 dark:text-white leading-tight">{user?.name || 'Developer'}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="btn-ghost w-9 h-9 p-0 rounded-xl">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/upload" className="btn-primary text-sm py-2 hidden sm:flex">
              <Upload className="w-4 h-4" /> Analyze Code
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-8 overflow-auto">

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Analyses Run',   value: '24',  icon: BarChart2,  color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20'    },
              { label: 'Avg MI Score',   value: '67',  icon: Shield,     color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Avg Complexity', value: '11',  icon: GitBranch,  color: 'text-yellow-500',  bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
              { label: 'Score Trend',    value: '+8%', icon: TrendingUp, color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="card p-5">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div>
            <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { to: '/upload',  icon: Upload,   title: 'New Analysis',   desc: 'Upload or paste code', color: 'bg-emerald-500' },
                { to: '/results', icon: BarChart2, title: 'View Results',   desc: 'See latest metrics',   color: 'bg-blue-500'    },
                { to: '/profile', icon: Shield,    title: 'Your Profile',   desc: 'Manage settings',      color: 'bg-purple-500'  },
              ].map(({ to, icon: Icon, title, desc, color }) => (
                <Link key={to} to={to}
                  className="card-hover p-5 flex items-center gap-4 group">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{title}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent analyses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-slate-900 dark:text-white">Recent Analyses</h3>
              <Link to="/results" className="text-xs text-emerald-500 font-medium hover:text-emerald-600 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">File</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">MI</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">CC</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {RECENT.map((r) => {
                    const { badge, label } = STATUS_STYLE[r.status]
                    return (
                      <tr key={r.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-medium text-slate-700 dark:text-slate-300">{r.name}</td>
                        <td className="px-5 py-3.5">
                          <span className={`font-bold ${r.mi >= 65 ? 'text-emerald-500' : r.mi >= 45 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {r.mi}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`font-bold ${r.cc <= 10 ? 'text-emerald-500' : r.cc <= 20 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {r.cc}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={badge}>{label}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-400 hidden sm:table-cell">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.time}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
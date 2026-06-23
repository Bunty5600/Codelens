import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Upload, BarChart2, GitBranch, Shield,
  ArrowRight, TrendingUp, Clock, CheckCircle,
  AlertTriangle, Zap
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import Sidebar   from '../components/Sidebar'
import { useAuth }  from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { analysisAPI } from '../services/api'
import { Sun, Moon } from 'lucide-react'
import MobileNav from '../components/MobileNav'
const RISK_COLORS = {
  Low:    '#22c55e',
  Medium: '#eab308',
  High:   '#ef4444',
}

const RISK_BADGE = {
  Low:    'badge-green',
  Medium: 'badge-yellow',
  High:   'badge-red',
}

export default function Dashboard() {
  const { user }      = useAuth()
  const { dark, toggle } = useTheme()
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    analysisAPI.getHistory()
      .then(res => setHistory(res.data ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [])

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // ── Derived stats ──────────────────────────────────────
  const totalAnalyses  = history.length
  const highRiskCount  = history.filter(h => h.risk_level === 'High').length

  // Risk distribution for pie chart
  const riskDist = ['Low', 'Medium', 'High'].map(r => ({
    name:  r,
    value: history.filter(h => h.risk_level === r).length,
  })).filter(r => r.value > 0)

  // Last 7 analyses for trend (reversed = oldest first)
  const trendData = [...history].reverse().slice(-7).map((h, i) => ({
    name: `#${i + 1}`,
    date: new Date(h.created_at).toLocaleDateString(),
    risk: h.risk_level === 'High' ? 3 : h.risk_level === 'Medium' ? 2 : 1,
  }))

  const summaryCards = [
    {
      label: 'Total Analyses',
      value: loading ? '—' : totalAnalyses,
      icon:  BarChart2,
      color: 'text-blue-500',
      bg:    'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'High Risk Projects',
      value: loading ? '—' : highRiskCount,
      icon:  AlertTriangle,
      color: 'text-red-500',
      bg:    'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Low Risk Projects',
      value: loading ? '—' : history.filter(h => h.risk_level === 'Low').length,
      icon:  CheckCircle,
      color: 'text-emerald-500',
      bg:    'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Score Trend',
      value: totalAnalyses > 1 ? '+Active' : '—',
      icon:  TrendingUp,
      color: 'text-purple-500',
      bg:    'bg-purple-50 dark:bg-purple-900/20',
    },
  ]

  return (
<div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
  <Sidebar />
  <div className="flex-1 flex flex-col min-w-0">
    <MobileNav />
    <header className="hidden md:flex glass h-16 items-center justify-between px-6 shrink-0">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{greeting},</p>
            <h2 className="font-display font-bold text-slate-900 dark:text-white leading-tight">
              {user?.name || 'Developer'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="btn-ghost w-9 h-9 p-0 rounded-xl" type="button">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/upload" className="btn-primary text-sm py-2 hidden sm:flex">
              <Upload className="w-4 h-4" /> Analyze Code
            </Link>
          </div>
        </header>

        <main className="flex-1 p-3 md:p-6 space-y-6 md:space-y-8 overflow-auto">

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="card p-5">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-2xl font-display font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          {history.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

              {/* Risk Trend */}
              <div className="lg:col-span-2 card p-5">
                <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm mb-4">
                  Risk Trend (Last 7 Analyses)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e293b' : '#f1f5f9'} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }}
                      axisLine={false} tickLine={false}
                      tickFormatter={v => v === 1 ? 'Low' : v === 2 ? 'Med' : 'High'}
                      domain={[1, 3]}
                    />
                    <Tooltip
                      contentStyle={{ background: dark ? '#1e293b' : '#fff', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, borderRadius: 10, fontSize: 12 }}
                      formatter={v => [v === 1 ? 'Low' : v === 2 ? 'Medium' : 'High', 'Risk']}
                    />
                    <Line type="monotone" dataKey="risk" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Risk Distribution */}
              <div className="card p-5">
                <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm mb-4">
                  Risk Distribution
                </h3>
                {riskDist.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={riskDist}
                        cx="50%" cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {riskDist.map((entry) => (
                          <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => <span style={{ fontSize: 11, color: dark ? '#94a3b8' : '#64748b' }}>{v}</span>}
                      />
                      <Tooltip
                        contentStyle={{ background: dark ? '#1e293b' : '#fff', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, borderRadius: 10, fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-400 text-center mt-8">No data yet</p>
                )}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div>
            <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {[
                { to: '/upload',  icon: Upload,   title: 'New Analysis', desc: 'Upload or paste code',  color: 'bg-emerald-500' },
                { to: '/results', icon: BarChart2, title: 'View Results', desc: 'See latest metrics',    color: 'bg-blue-500'    },
                { to: '/history', icon: Clock,     title: 'History',      desc: 'Past analyses',         color: 'bg-purple-500'  },
              ].map(({ to, icon: Icon, title, desc, color }) => (
                <Link key={to} to={to} className="card-hover p-5 flex items-center gap-4 group">
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
              <Link to="/history" className="text-xs text-emerald-500 font-medium hover:text-emerald-600 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
              {loading ? (
                <p className="text-xs text-slate-400 text-center py-8">Loading...</p>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <BarChart2 className="w-8 h-8 text-slate-300" />
                  <p className="text-sm text-slate-400">No analyses yet.</p>
                  <Link to="/upload" className="btn-primary text-sm py-2">
                    <Zap className="w-4 h-4" /> Run First Analysis
                  </Link>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {['Project', 'Risk', 'Date'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {history.slice(0, 5).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                          {item.project_name ?? item.filename ?? '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`${RISK_BADGE[item.risk_level] ?? 'badge-green'}`}>
                            {item.risk_level ?? 'Low'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
              </div>

        </main>
      </div>
    </div>
  )
}
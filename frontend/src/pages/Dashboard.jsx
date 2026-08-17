import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Upload, BarChart2,
  ArrowUpRight, Clock,
  Zap, Sun, Moon
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import Sidebar   from '../components/Sidebar'
import { useAuth }  from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { analysisAPI } from '../services/api'
import MobileNav from '../components/MobileNav'

const RISK_COLORS = {
  Low:    '#10b981',
  Medium: '#f59e0b',
  High:   '#f43f5e',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value
    const labelText = val === 1 ? 'Low' : val === 2 ? 'Medium' : 'High'
    return (
      <div className="bg-slate-900 text-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg text-xs font-mono shadow-xl border border-slate-700/50">
        <p className="text-slate-400 mb-0.5">{payload[0].payload.date || label}</p>
        <p className="font-semibold text-white">Risk: {labelText}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const { user }         = useAuth()
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
  const lowRiskCount   = history.filter(h => h.risk_level === 'Low').length

  // Risk distribution for pie chart
  const riskDist = ['Low', 'Medium', 'High'].map(r => ({
    name:  r,
    value: history.filter(h => h.risk_level === r).length,
  })).filter(r => r.value > 0)

  // Last 7 analyses for trend (reversed = oldest first)
  const trendData = [...history].reverse().slice(-7).map((h, i) => ({
    name: `Run #${i + 1}`,
    date: new Date(h.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    risk: h.risk_level === 'High' ? 3 : h.risk_level === 'Medium' ? 2 : 1,
  }))

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#090d16] font-sans antialiased text-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileNav />

        {/* Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0d1322] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              WORKSPACE
            </span>
            <h1 className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {greeting}, <span className="font-semibold text-slate-900 dark:text-white">{user?.name || 'Developer'}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-500 dark:text-slate-400"
              type="button"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <Link
              to="/upload"
              className="text-xs font-medium px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors hidden sm:flex items-center gap-1.5 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" /> New Scan
            </Link>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-w-7xl w-full mx-auto">

          {/* Section 1: Key Metrics Bar */}
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800/80">

              <div className="pb-4 md:pb-0 md:pr-6">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Runs</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight font-mono">{loading ? '—' : totalAnalyses}</span>
                  <span className="text-xs text-slate-400">scans completed</span>
                </div>
              </div>

              <div className="pt-4 md:pt-0 md:px-6">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">High Severity</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight font-mono text-rose-600 dark:text-rose-400">{loading ? '—' : highRiskCount}</span>
                  {highRiskCount > 0 && <span className="text-[11px] font-medium text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">Action Req.</span>}
                </div>
              </div>

              <div className="pt-4 md:pt-0 md:px-6">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Low Risk</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight font-mono text-emerald-600 dark:text-emerald-400">{loading ? '—' : lowRiskCount}</span>
                  <span className="text-xs text-slate-400">clean code</span>
                </div>
              </div>

              <div className="pt-4 md:pt-0 md:pl-6">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">System Status</span>
                <div className="mt-2 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Analyzer Active</span>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Visualizations */}
          {history.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Line Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-[#0d1322] border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Analysis Timeline</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Risk progression across recent executions</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" /> Low (1)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Med (2)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> High (3)</span>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke={dark ? '#1e293b' : '#f1f5f9'} vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: dark ? '#64748b' : '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: dark ? '#64748b' : '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      ticks={[1, 2, 3]}
                      tickFormatter={v => v === 1 ? 'Low' : v === 2 ? 'Med' : 'High'}
                      domain={[1, 3]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="risk"
                      stroke={dark ? '#94a3b8' : '#334155'}
                      strokeWidth={2}
                      dot={{ r: 4, fill: dark ? '#0d1322' : '#ffffff', stroke: dark ? '#94a3b8' : '#334155', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#6366f1' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Risk Share Pie Chart */}
              <div className="bg-white dark:bg-[#0d1322] border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Severity Split</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Overall risk categorization</p>
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={riskDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {riskDist.map((entry) => (
                        <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: dark ? '#0f172a' : '#ffffff',
                        border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={6}
                      verticalAlign="bottom"
                      formatter={(value, entry) => (
                        <span className="text-xs font-mono text-slate-600 dark:text-slate-300 ml-1">
                          {value}: <strong className="font-semibold text-slate-900 dark:text-white">{entry.payload.value}</strong>
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

            </div>
          )}

          {/* Section 3: Navigation Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { to: '/upload',  icon: Upload,   title: 'Upload Code Snippet', desc: 'Run static analysis on new files' },
              { to: '/results', icon: BarChart2, title: 'Inspect Latest Run',   desc: 'Detailed breakdown of vulnerabilities' },
              { to: '/history', icon: Clock,     title: 'Audit Logs',           desc: 'Browse complete historical records' },
            ].map(({ to, icon: Icon, title, desc }) => (
              <Link
                key={to}
                to={to}
                className="group p-4 rounded-xl bg-white dark:bg-[#0d1322] border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-xs flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{title}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors shrink-0" />
              </Link>
            ))}
          </div>

          {/* Section 4: History Table */}
          <div className="bg-white dark:bg-[#0d1322] border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Executions</h2>
                <p className="text-xs text-slate-400 mt-0.5">Showing last 5 completed scans</p>
              </div>
              <Link to="/history" className="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                VIEW ALL →
              </Link>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-12 text-center text-xs font-mono text-slate-400">
                  Loading analysis history...
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <p className="text-xs font-mono text-slate-400">No recent scans found.</p>
                  <Link to="/upload" className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors">
                    <Zap className="w-3.5 h-3.5" /> Execute First Scan
                  </Link>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 font-mono text-slate-400 uppercase">
                      <th className="px-5 py-3 font-normal">Project / Entity</th>
                      <th className="px-5 py-3 font-normal">Severity</th>
                      <th className="px-5 py-3 font-normal text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {history.slice(0, 5).map((item) => {
                      const isHigh = item.risk_level === 'High'
                      const isMed  = item.risk_level === 'Medium'

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                            {item.project_name ?? item.filename ?? '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
                              isHigh 
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                                : isMed 
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${
                                isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              {item.risk_level ?? 'Low'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-400">
                            {new Date(item.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
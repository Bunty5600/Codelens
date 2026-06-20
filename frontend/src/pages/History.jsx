import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, BarChart2, Zap, Eye } from 'lucide-react'
import Sidebar from '../components/Sidebar.jsx'
import { analysisAPI } from '../services/api.js'

const RISK_BADGE = {
  Low:    'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  Medium: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  High:   'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
}

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analysisAPI.getHistory()
      .then(res => setHistory(res.data ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="glass h-16 flex items-center justify-between px-6 shrink-0">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Analysis</p>
            <h2 className="font-display font-bold text-slate-900 dark:text-white">History</h2>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">

          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
              <BarChart2 className="w-10 h-10 text-slate-300" />
              <p className="text-slate-500 text-sm">No analyses yet.</p>
              <Link to="/upload" className="btn-primary text-sm py-2">
                <Zap className="w-4 h-4" /> Run First Analysis
              </Link>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {['Project', 'Risk', 'Date', 'Action'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                        {item.project_name ?? item.filename ?? '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${RISK_BADGE[item.risk_level] ?? RISK_BADGE.Low}`}>
                          {item.risk_level ?? 'Low'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          to="/results"
                          className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-600 font-medium"
                        >
                          <Eye className="w-3 h-3" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
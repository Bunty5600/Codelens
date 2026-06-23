import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, BarChart2, Zap, Eye } from 'lucide-react'
import Sidebar from '../components/Sidebar.jsx'
import MobileNav from '../components/MobileNav'
import { analysisAPI } from '../services/api.js'

const RISK_BADGE = {
  Low: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  Medium: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  High: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
}

const SOURCE_STYLES = {
  github:
    'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  upload:
    'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  paste:
    'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
}

const SOURCE_LABELS = {
  github: '⬡ GitHub',
  upload: '⬆ Upload',
  paste: '✎ Paste',
}

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analysisAPI
      .getHistory()
      .then((res) => {
        setHistory(res.data ?? [])
      })
      .catch(() => {
        setHistory([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav />

        <header className="hidden md:flex glass h-16 items-center justify-between px-6 shrink-0">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              Analysis
            </p>
            <h2 className="font-display font-bold text-slate-900 dark:text-white">
              History
            </h2>
          </div>
        </header>

        <main className="flex-1 p-3 md:p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
              <BarChart2 className="w-10 h-10 text-slate-300" />

              <p className="text-slate-500 text-sm">
                No analyses yet.
              </p>

              <Link
                to="/upload"
                className="btn-primary text-sm py-2"
              >
                <Zap className="w-4 h-4" />
                Run First Analysis
              </Link>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Project
                      </th>

                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Source
                      </th>

                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Risk
                      </th>

                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Date
                      </th>

                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {history.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* Project */}
                        <td className="px-5 py-3.5 font-mono text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[180px] truncate">
                          {item.project_name ||
                            item.filename ||
                            item.title ||
                            'Untitled'}
                        </td>

                        {/* Source */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              SOURCE_STYLES[item.source] ||
                              SOURCE_STYLES.upload
                            }`}
                          >
                            {SOURCE_LABELS[item.source] ||
                              '⬆ Upload'}
                          </span>
                        </td>

                        {/* Risk */}
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              RISK_BADGE[item.risk_level] ||
                              RISK_BADGE.Low
                            }`}
                          >
                            {item.risk_level || 'Low'}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />

                            {item.created_at
                              ? new Date(
                                  item.created_at
                                ).toLocaleDateString()
                              : '--'}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-3.5">
                          <Link
                            to={`/results/${item.id}`}
                            className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-600 font-medium"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
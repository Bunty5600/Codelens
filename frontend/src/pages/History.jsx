import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, BarChart2, Zap, Eye, Search, Download, Plus, Filter, Calendar, ArrowUpRight } from 'lucide-react'
import Sidebar from '../components/Sidebar.jsx'
import MobileNav from '../components/MobileNav'
import { analysisAPI } from '../services/api.js'

// Refactored badges to match Untitled UI pill indicators with leading dot
const RISK_BADGE = {
  Low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
  Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
  High: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
}

const RISK_DOT = {
  Low: 'bg-emerald-500',
  Medium: 'bg-amber-500',
  High: 'bg-rose-500',
}

const SOURCE_STYLES = {
  github: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
  upload: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
  paste: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
}

const SOURCE_LABELS = {
  github: 'GitHub',
  upload: 'Upload',
  paste: 'Paste',
}

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')

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

  // Filter history dynamically based on search or tabs without modifying original data flow
  const filteredHistory = history.filter((item) => {
    const name = item.project_name || item.filename || item.title || 'Untitled'
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase())
    if (selectedTab === 'all') return matchesSearch
    return matchesSearch && item.source === selectedTab
  })

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#0a0e1a] font-sans antialiased text-slate-900 dark:text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <MobileNav />

        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto space-y-6">

          {/* Top Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analysis History</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                View and manage your team's code security and quality analyses.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111625] border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Export CSV
              </button>
              <Link
                to="/upload"
                className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg shadow-xs transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Analysis
              </Link>
            </div>
          </div>

          {/* Sub-navigation Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All analyses' },
              { id: 'github', label: 'GitHub' },
              { id: 'upload', label: 'Uploads' },
              { id: 'paste', label: 'Pastes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-3.5 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                  selectedTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Card Container for Filters & Table */}
          <div className="bg-white dark:bg-[#111625] rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">

            {/* Table Control Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for analyses..."
                  className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 text-slate-900 dark:text-white transition-all"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button type="button" className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Select dates
                </button>
                <button type="button" className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  Filters
                </button>
              </div>
            </div>

            {/* Table Content */}
            {loading ? (
              <div className="flex items-center justify-center h-64 text-slate-400 text-xs font-mono">
                Loading workspace history...
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <p className="text-slate-900 dark:text-white font-medium text-sm">No history records found</p>
                <p className="text-slate-400 text-xs max-w-sm">No analysis reports match your selected tab or search query.</p>
                <Link
                  to="/upload"
                  className="mt-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Run First Analysis
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-6 w-12">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500" />
                      </th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">Risk Level</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-6 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {filteredHistory.map((item) => {
                      const risk = item.risk_level || 'Low'
                      const source = item.source || 'upload'

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500" />
                          </td>

                          {/* Project Name */}
                          <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white max-w-[220px] truncate">
                            {item.project_name || item.filename || item.title || 'Untitled'}
                          </td>

                          {/* Source */}
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${SOURCE_STYLES[source] || SOURCE_STYLES.upload}`}>
                              {SOURCE_LABELS[source] || 'Upload'}
                            </span>
                          </td>

                          {/* Risk Level Badge */}
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${RISK_BADGE[risk] || RISK_BADGE.Low}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${RISK_DOT[risk] || RISK_DOT.Low}`} />
                              {risk}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                              : '--'}
                          </td>

                          {/* Action Link */}
                          <td className="py-4 px-6 text-right">
                            <Link
                              to={`/results/${item.id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                            >
                              View report
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {!loading && filteredHistory.length > 0 && (
              <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <button type="button" className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  Previous
                </button>
                <span>Page 1 of 1</span>
                <button type="button" className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  Next
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
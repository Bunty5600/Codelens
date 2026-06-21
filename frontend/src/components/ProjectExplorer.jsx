import { useState } from 'react'
import { FileCode, ChevronRight, ChevronDown, ChevronUp, X, AlertCircle, Search } from 'lucide-react'

const RISK_BADGE = {
  Low:    'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  Medium: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  High:   'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
}

const SEVERITY = {
  Low:    'text-emerald-500',
  Medium: 'text-yellow-500',
  High:   'text-red-500',
}

const PAGE_SIZE = 20

export default function ProjectExplorer({ files = [] }) {
  const [selected, setSelected]   = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [riskFilter, setRiskFilter] = useState('All')

  if (!files.length) return null

  const selectedFile = files.find(f => f.file_name === selected)

  // Filter by search + risk
  const filtered = files.filter(f => {
    const matchSearch = f.file_name.toLowerCase().includes(search.toLowerCase())
    const matchRisk   = riskFilter === 'All' || f.risk === riskFilter
    return matchSearch && matchRisk
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const visible    = filtered.slice(0, page * PAGE_SIZE)

  const highCount   = files.filter(f => f.risk === 'High').length
  const medCount    = files.filter(f => f.risk === 'Medium').length
  const lowCount    = files.filter(f => f.risk === 'Low').length

  return (
    <>
      {/* Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 btn-ghost w-8 h-8 p-0 rounded-lg"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <FileCode className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="font-mono text-sm font-bold text-slate-900 dark:text-white truncate">
                {selectedFile.file_name}
              </p>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${RISK_BADGE[selectedFile.risk]}`}>
                {selectedFile.risk} Risk
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Cyclomatic Complexity', value: selectedFile.cc },
                { label: 'Maintainability Index', value: `${selectedFile.mi}/100` },
                { label: 'Lines of Code',          value: selectedFile.loc },
                { label: 'Functions',              value: selectedFile.functions },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {selectedFile.smells?.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Code Smells ({selectedFile.smells.length})
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedFile.smells.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <AlertCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${SEVERITY[s.severity]}`} />
                      <div>
                        <span className={`font-bold ${SEVERITY[s.severity]}`}>{s.type}</span>
                        <span className="text-slate-400 ml-1">— {s.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-emerald-500 font-medium">✓ No code smells detected</p>
            )}
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="card p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
              Project Explorer
            </h3>
            <span className="text-xs text-slate-400">({files.length} files)</span>
          </div>
          <button
            onClick={() => setCollapsed(p => !p)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            {collapsed
              ? <><ChevronDown className="w-3 h-3" /> Expand</>
              : <><ChevronUp className="w-3 h-3" /> Collapse</>
            }
          </button>
        </div>

        {!collapsed && (
          <>
            {/* Search + Risk filter */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search files..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              {[
                { label: 'All',    count: files.length,  color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
                { label: 'High',   count: highCount,     color: 'bg-red-50 dark:bg-red-900/20 text-red-500' },
                { label: 'Medium', count: medCount,      color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500' },
                { label: 'Low',    count: lowCount,      color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' },
              ].map(({ label, count, color }) => (
                <button
                  key={label}
                  onClick={() => { setRiskFilter(label); setPage(1) }}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all shrink-0
                    ${riskFilter === label ? 'ring-2 ring-offset-1 ring-current' : ''}
                    ${color}`}
                  type="button"
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No files match your search.</p>
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">File</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">CC</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">MI</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Risk</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {visible.map((f) => (
                        <tr key={f.file_name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                            {f.file_name}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">{f.cc}</td>
                          <td className="px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">{f.mi}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_BADGE[f.risk] ?? RISK_BADGE.Low}`}>
                              {f.risk}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelected(f.file_name)}
                              className="flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-600 font-medium"
                              type="button"
                            >
                              View <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-slate-400">
                    Showing {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} files
                  </p>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <button
                        onClick={() => setPage(1)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700
                                   hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                        type="button"
                      >
                        Show Less
                      </button>
                    )}
                    {page < totalPages && (
                      <button
                        onClick={() => setPage(p => p + 1)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600
                                   text-white font-medium transition-colors"
                        type="button"
                      >
                        Show More ({filtered.length - page * PAGE_SIZE} remaining)
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
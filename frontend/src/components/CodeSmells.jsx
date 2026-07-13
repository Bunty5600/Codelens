import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const SEVERITY = {
  Low:    { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/20',   text: 'text-yellow-600 dark:text-yellow-400',   dot: 'bg-yellow-500'  },
  High:   { bg: 'bg-red-50 dark:bg-red-900/20',         text: 'text-red-600 dark:text-red-400',         dot: 'bg-red-500'     },
}

const PAGE_SIZE = 5

export default function CodeSmells({ smells = [] }) {
  const [collapsed, setCollapsed] = useState(false)
  const [page, setPage]           = useState(1)
  const [filter, setFilter]       = useState('All')

  if (!smells.length) return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm mb-3">
        Code Smells
      </h3>
      <p className="text-xs text-emerald-500 font-medium">✓ No code smells detected</p>
    </div>
  )

  const highCount   = smells.filter(s => s.severity === 'High').length
  const medCount    = smells.filter(s => s.severity === 'Medium').length
  const lowCount    = smells.filter(s => s.severity === 'Low').length

  const filtered    = filter === 'All' ? smells : smells.filter(s => s.severity === filter)
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE)
  const visible     = filtered.slice(0, page * PAGE_SIZE)

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
            Code Smells
          </h3>
          <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-500 px-2 py-0.5 rounded-full font-medium">
            {smells.length} detected
          </span>
        </div>
        <button
          onClick={() => setCollapsed(p => !p)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          type="button"
          aria-expanded={!collapsed}
          aria-controls="code-smells-body"
        >
          {collapsed
            ? <><ChevronDown className="w-3 h-3" /> Expand</>
            : <><ChevronUp className="w-3 h-3" /> Collapse</>
          }
        </button>
      </div>

      {!collapsed && (
        <div id="code-smells-body" className="animate-in fade-in duration-300">
          {/* Summary badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {[
              { label: 'All',    count: smells.length, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
              { label: 'High',   count: highCount,     color: 'bg-red-50 dark:bg-red-900/20 text-red-500'     },
              { label: 'Medium', count: medCount,       color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500' },
              { label: 'Low',    count: lowCount,       color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' },
            ].map(({ label, count, color }) => count > 0 && (
              <button
                key={label}
                onClick={() => { setFilter(label); setPage(1) }}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all
                  ${filter === label ? 'ring-2 ring-offset-1 ring-current' : ''}
                  ${color}`}
                type="button"
                aria-pressed={filter === label}
              >
                {label} {count > 0 && `(${count})`}
              </button>
            ))}
          </div>

          {/* Smell list */}
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No {filter.toLowerCase()} severity smells found.</p>
          ) : (
            <div className="space-y-2">
              {visible.map((s, i) => {
                const style = SEVERITY[s.severity] || SEVERITY.Medium
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-xl ${style.bg} animate-in fade-in slide-in-from-top-1 duration-300`}
                  >
                    <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${style.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-xs font-bold ${style.text}`}>{s.type}</p>
                        <span className={`text-xs ${style.text} opacity-70`}>{s.severity}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.message}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {page < totalPages && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="mt-4 w-full py-2 text-xs text-slate-500 dark:text-slate-400
                         border border-slate-200 dark:border-slate-700 rounded-xl
                         hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
              type="button"
            >
              Show More ({filtered.length - page * PAGE_SIZE} remaining)
            </button>
          )}
          {page > 1 && (
            <button
              onClick={() => setPage(1)}
              className="mt-2 w-full py-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              type="button"
            >
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  )
}
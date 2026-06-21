import { useState } from 'react'
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react'

const ccColor = (cc) =>
  cc <= 5  ? 'text-emerald-500' :
  cc <= 15 ? 'text-yellow-500' : 'text-red-500'

const ccBg = (cc) =>
  cc <= 5  ? 'bg-emerald-500' :
  cc <= 15 ? 'bg-yellow-500' : 'bg-red-500'

const PAGE_SIZE = 10

export default function HeatmapTable({ files = [] }) {
  const [sortAsc, setSortAsc]     = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [page, setPage]           = useState(1)

  if (!files.length) return null

  const sorted = [...files].sort((a, b) =>
    sortAsc ? a.cc - b.cc : b.cc - a.cc
  )

  const maxCC      = Math.max(...files.map(f => f.cc), 1)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const visible    = sorted.slice(0, page * PAGE_SIZE)

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
            Complexity Heatmap
          </h3>
          <span className="text-xs text-slate-400">({files.length} files)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortAsc(p => !p)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortAsc ? 'Low → High' : 'High → Low'}
          </button>
          <button
            onClick={() => setCollapsed(p => !p)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors ml-2"
          >
            {collapsed
              ? <><ChevronDown className="w-3 h-3" /> Expand</>
              : <><ChevronUp className="w-3 h-3" /> Collapse</>
            }
          </button>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <>
          <div className="space-y-2">
            {visible.map((f) => (
              <div key={f.file_name} className="flex items-center gap-3">
                <p className="font-mono text-xs text-slate-600 dark:text-slate-400 w-40 truncate shrink-0">
                  {f.file_name}
                </p>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${ccBg(f.cc)}`}
                    style={{ width: `${(f.cc / maxCC) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-6 text-right ${ccColor(f.cc)}`}>
                  {f.cc}
                </span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {page < totalPages && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="mt-4 w-full py-2 text-xs text-slateald-500 dark:text-slate-400
                         border border-slate-200 dark:border-slate-700 rounded-xl
                         hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
              type="button"
            >
              Show More ({sorted.length - page * PAGE_SIZE} remaining)
            </button>
          )}
          {page > 1 && (
            <button
              onClick={() => setPage(1)}
              className="mt-2 w-full py-1.5 text-xs text-slate-400
                         hover:text-slate-600 transition-colors"
              type="button"
            >
              Show Less
            </button>
          )}
        </>
      )}
    </div>
  )
}
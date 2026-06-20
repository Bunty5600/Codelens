import { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'

const ccColor = (cc) =>
  cc <= 5  ? 'text-emerald-500' :
  cc <= 15 ? 'text-yellow-500' : 'text-red-500'

const ccBg = (cc) =>
  cc <= 5  ? 'bg-emerald-500' :
  cc <= 15 ? 'bg-yellow-500' : 'bg-red-500'

export default function HeatmapTable({ files = [] }) {
  const [sortAsc, setSortAsc] = useState(false)

  if (!files.length) return null

  const sorted = [...files].sort((a, b) =>
    sortAsc ? a.cc - b.cc : b.cc - a.cc
  )

  const maxCC = Math.max(...files.map(f => f.cc), 1)

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
          Complexity Heatmap
        </h3>
        <button
          onClick={() => setSortAsc(p => !p)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowUpDown className="w-3 h-3" />
          {sortAsc ? 'Low → High' : 'High → Low'}
        </button>
      </div>
      <div className="space-y-2">
        {sorted.map((f) => (
          <div key={f.file_name} className="flex items-center gap-3">
            <p className="font-mono text-xs text-slate-600 dark:text-slate-400 w-32 truncate shrink-0">
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
    </div>
  )
}
const SEVERITY = {
  Low:    { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/20',   text: 'text-yellow-600 dark:text-yellow-400',   dot: 'bg-yellow-500'  },
  High:   { bg: 'bg-red-50 dark:bg-red-900/20',         text: 'text-red-600 dark:text-red-400',         dot: 'bg-red-500'     },
}

export default function CodeSmells({ smells = [] }) {
  if (!smells.length) return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm mb-3">
        Code Smells
      </h3>
      <p className="text-xs text-emerald-500 font-medium">✓ No code smells detected</p>
    </div>
  )

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
          Code Smells
        </h3>
        <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-500 px-2 py-1 rounded-full font-medium">
          {smells.length} detected
        </span>
      </div>
      <div className="space-y-2">
        {smells.map((s, i) => {
          const style = SEVERITY[s.severity] || SEVERITY.Medium
          return (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${style.bg}`}>
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
    </div>
  )
}
const STATUS_STYLES = {
  PASS:    { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', badge: 'bg-emerald-500' },
  WARNING: { bg: 'bg-yellow-50 dark:bg-yellow-900/20',   text: 'text-yellow-600 dark:text-yellow-400',   dot: 'bg-yellow-500',  badge: 'bg-yellow-500'  },
  FAIL:    { bg: 'bg-red-50 dark:bg-red-900/20',         text: 'text-red-600 dark:text-red-400',         dot: 'bg-red-500',     badge: 'bg-red-500'     },
}

export default function QualityGate({ gate }) {
  if (!gate) return null

  const overall = STATUS_STYLES[gate.overall] ?? STATUS_STYLES.PASS
  const rules = gate.rules ?? []

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
          Quality Gate
        </h3>
        <span
          className={`text-white text-xs font-bold px-3 py-1 rounded-full shrink-0 ${overall.badge}`}
          aria-label={`Overall status: ${gate.overall}`}
        >
          {gate.overall}
        </span>
      </div>

      {rules.length === 0 ? (
        <p className="text-xs text-slate-400">No quality rules configured for this gate.</p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule, i) => {
            const style = STATUS_STYLES[rule.status] ?? STATUS_STYLES.PASS
            return (
              <div
                key={i}
                className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-2 p-3 rounded-xl ${style.bg}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    {rule.rule}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-auto">
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    threshold: {rule.threshold}
                  </span>
                  <span className={`text-xs font-bold ${style.text}`}>
                    {typeof rule.value === 'number' ? rule.value.toFixed(1) : rule.value}
                  </span>
                  <span className={`text-xs font-bold ${style.text}`}>
                    {rule.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
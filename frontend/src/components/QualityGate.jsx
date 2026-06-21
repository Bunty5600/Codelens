const STATUS_STYLES = {
  PASS:    { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', badge: 'bg-emerald-500' },
  WARNING: { bg: 'bg-yellow-50 dark:bg-yellow-900/20',   text: 'text-yellow-600 dark:text-yellow-400',   dot: 'bg-yellow-500',  badge: 'bg-yellow-500'  },
  FAIL:    { bg: 'bg-red-50 dark:bg-red-900/20',         text: 'text-red-600 dark:text-red-400',         dot: 'bg-red-500',     badge: 'bg-red-500'     },
}

export default function QualityGate({ gate }) {
  if (!gate) return null

  const overall = STATUS_STYLES[gate.overall] ?? STATUS_STYLES.PASS

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
          Quality Gate
        </h3>
        <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${overall.badge}`}>
          {gate.overall}
        </span>
      </div>
      <div className="space-y-2">
        {gate.rules?.map((rule, i) => {
          const style = STATUS_STYLES[rule.status] ?? STATUS_STYLES.PASS
          return (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${style.bg}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {rule.rule}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
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
    </div>
  )
}
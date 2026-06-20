const getColor = (score) =>
  score <= 3.5 ? '#22c55e' : score <= 6.5 ? '#eab308' : '#ef4444'

const getLabel = (score) =>
  score <= 3.5 ? 'Low Debt' : score <= 6.5 ? 'Medium Debt' : 'High Debt'

export default function DebtGauge({ score = 0, label = '' }) {
  const pct = (score / 10) * 100
  const color = getColor(score)
  const displayLabel = label || getLabel(score)

  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="card p-5 flex flex-col items-center">
      <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm mb-4 self-start">
        Technical Debt Score
      </h3>
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle
            cx="60" cy="60" r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-100 dark:text-slate-800"
          />
          <circle
            cx="60" cy="60" r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-bold" style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-slate-400">/10</span>
        </div>
      </div>
      <span
        className="mt-3 text-sm font-semibold px-3 py-1 rounded-full"
        style={{ color, background: `${color}20` }}
      >
        {displayLabel}
      </span>
    </div>
  )
}
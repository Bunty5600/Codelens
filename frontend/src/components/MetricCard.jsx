import clsx from 'clsx'

const levelStyles = {
  good:    'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  danger:  'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  neutral: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
}

const dotColors = {
  good:    'bg-emerald-500',
  warning: 'bg-yellow-500',
  danger:  'bg-red-500',
  neutral: 'bg-blue-500',
}

export default function MetricCard({
  title,
  value,
  unit,
  description,
  level = 'neutral',
  icon: Icon,
  trend,
  className = '',
}) {
  const safeLevel = levelStyles[level] ? level : 'neutral'

  return (
    <div className={clsx('card p-5 hover:shadow-md transition-all duration-200 group', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', levelStyles[safeLevel])}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {title}
            </p>
          </div>
        </div>

        {/* Level badge */}
        <span className={clsx('badge text-xs capitalize', levelStyles[safeLevel])}>
          <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[safeLevel])} />
          {safeLevel}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-end gap-2 mt-1">
        <span className="text-3xl font-display font-bold leading-none text-slate-900 dark:text-slate-50">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-slate-400 mb-0.5">{unit}</span>
        )}
        {trend && (
          <span className={clsx(
            'ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-lg',
            trend.up
              ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
              : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
          )}>
            {trend.up ? '▲' : '▼'} {trend.value}
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}

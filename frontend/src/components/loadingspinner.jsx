import clsx from 'clsx'

export default function LoadingSpinner({
  size = 'md',
  label,
  fullPage = false,
}) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={clsx(
        'rounded-full border-slate-200 dark:border-slate-700 border-t-emerald-500 animate-spin',
        sizes[size]
      )} style={{ borderWidth: size === 'sm' ? 2 : size === 'lg' ? 4 : 3 }} />
      {label && (
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium animate-pulse">
          {label}
        </p>
      )}
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
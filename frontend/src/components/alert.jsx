import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import clsx from 'clsx'

const CONFIG = {
  success: {
    icon: CheckCircle,
    cls: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
  },
  error: {
    icon: XCircle,
    cls: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
  },
  warning: {
    icon: AlertTriangle,
    cls: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300',
  },
  info: {
    icon: Info,
    cls: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
  },
}

export default function Alert({ type = 'info', message, autoClose = 0, onClose }) {
  const [visible, setVisible] = useState(true)
  const { icon: Icon, cls } = CONFIG[type] || CONFIG.info

  useEffect(() => {
    if (autoClose > 0) {
      const t = setTimeout(() => { setVisible(false); onClose?.() }, autoClose)
      return () => clearTimeout(t)
    }
  }, [autoClose, onClose])

  if (!visible) return null

  return (
    <div className={clsx(
      'flex items-start gap-3 p-4 rounded-xl border animate-fade-in',
      cls
    )}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
      <button
        onClick={() => { setVisible(false); onClose?.() }}
        className="opacity-50 hover:opacity-100 transition-opacity shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
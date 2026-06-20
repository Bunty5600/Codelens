import { useState } from 'react'
import { FileCode, ChevronDown, ChevronRight } from 'lucide-react'

const RISK_BADGE = {
  Low:    'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  Medium: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  High:   'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
}

export default function ProjectExplorer({ files = [] }) {
  const [selected, setSelected] = useState(null)

  if (!files.length) return null

  const selectedFile = files.find(f => f.file_name === selected)

  return (
    <div className="card p-5">
      <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm mb-4">
        Project Explorer
      </h3>
      <div className="grid md:grid-cols-2 gap-4">

        {/* File List */}
        <div className="space-y-1">
          {files.map((f) => (
            <button
              key={f.file_name}
              onClick={() => setSelected(f.file_name === selected ? null : f.file_name)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all
                ${selected === f.file_name
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
            >
              <FileCode className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left font-mono text-xs truncate">{f.file_name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_BADGE[f.risk] || RISK_BADGE.Low}`}>
                {f.risk}
              </span>
              {selected === f.file_name
                ? <ChevronDown className="w-3 h-3 shrink-0" />
                : <ChevronRight className="w-3 h-3 shrink-0" />
              }
            </button>
          ))}
        </div>

        {/* File Detail */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
          {selectedFile ? (
            <>
              <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 truncate">
                {selectedFile.file_name}
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Cyclomatic Complexity', value: selectedFile.cc },
                  { label: 'Maintainability Index', value: `${selectedFile.mi}/100` },
                  { label: 'Lines of Code',          value: selectedFile.loc },
                  { label: 'Functions',              value: selectedFile.functions },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${RISK_BADGE[selectedFile.risk]}`}>
                    {selectedFile.risk} Risk
                  </span>
                </div>
                {selectedFile.smells?.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Smells</p>
                    {selectedFile.smells.map((s, i) => (
                      <p key={i} className="text-xs text-red-500">• {s.type}</p>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400 text-center mt-8">
              Click a file to see details
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
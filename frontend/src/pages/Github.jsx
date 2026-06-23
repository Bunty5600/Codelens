import { useState } from 'react'
import { GitBranch, Search, Loader2, AlertCircle } from 'lucide-react'
import Sidebar          from '../components/Sidebar'
import ProjectExplorer  from '../components/ProjectExplorer'
import HeatmapTable     from '../components/HeatmapTable'
import CodeSmells       from '../components/CodeSmells'
import DebtGauge        from '../components/DebtGauge'
import QualityGate      from '../components/QualityGate'
import { analysisAPI }  from '../services/api'
import MobileNav from '../components/MobileNav'

const RISK_BADGE = {
  Low:    'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  Medium: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  High:   'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
}

export default function GitHub() {
  const [url, setUrl]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)

  const handleAnalyze = async () => {
    if (!url.trim()) return
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await analysisAPI.analyzeGithub({ repo_url: url.trim() })
      setResult(res.data)
    } catch (e) {
      setError(e?.response?.data?.detail ?? 'Failed to analyze repository.')
    } finally {
      setLoading(false)
    }
  }

  const allSmells = result?.files?.flatMap(f => f.smells ?? []) ?? []

  return (
   <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
  <Sidebar />
  <div className="flex-1 flex flex-col min-w-0">
    <MobileNav />
    <header className="hidden md:flex glass h-16 items-center justify-between px-6 shrink-0">
          <GitBranch className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Analysis</p>
            <h2 className="font-display font-bold text-slate-900 dark:text-white">GitHub Analyzer</h2>
          </div>
        </header>

       <main className="flex-1 p-3 md:p-6 max-w-3xl mx-auto w-full">

          {/* URL Input */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm mb-3">
              Repository URL
            </h3>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                  placeholder="https://github.com/username/repository"
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || !url.trim()}
                className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
                type="button"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                  : <><Search className="w-4 h-4" /> Analyze</>
                }
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-500 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <>
              {/* Repository Summary */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
                    Repository Summary
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${RISK_BADGE[result.overall_risk] ?? RISK_BADGE.Low}`}>
                    {result.overall_risk} Risk
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Repository',        value: result.repository },
                    { label: 'Python Files',       value: result.total_files },
                    { label: 'Avg Complexity',     value: result.aggregate?.cc },
                    { label: 'Avg Maintainability',value: `${result.aggregate?.mi}/100` },
                    { label: 'Total LOC',          value: result.aggregate?.loc },
                    { label: 'Technical Debt',     value: `${result.debt_score}/10` },
                    { label: 'Highest Risk File',  value: result.highest_risk_file },
                    { label: 'Debt Label',         value: result.debt_label },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality Gate */}
              <QualityGate gate={result.quality_gate} />

              {/* Project Explorer + Debt */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ProjectExplorer files={result.files ?? []} />
                </div>
                <DebtGauge score={result.debt_score} label={result.debt_label} />
              </div>

              {/* Heatmap */}
              <HeatmapTable files={result.files ?? []} />

              {/* Code Smells */}
              <CodeSmells smells={allSmells} />
            </>
          )}

        </main>
      </div>
    </div>
  )
}
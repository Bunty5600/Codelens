import { useState } from 'react'
import { GitBranch, Search, Loader2, AlertCircle, X, Sparkles, ArrowRight, Play, CheckCircle2 } from 'lucide-react'
import Sidebar          from '../components/Sidebar'
import ProjectExplorer  from '../components/ProjectExplorer'
import HeatmapTable     from '../components/HeatmapTable'
import CodeSmells       from '../components/CodeSmells'
import DebtGauge        from '../components/DebtGauge'
import QualityGate      from '../components/QualityGate'
import { analysisAPI }  from '../services/api'
import MobileNav        from '../components/MobileNav'

const RISK_BADGE = {
  Low:    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  High:   'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
}

export default function GitHub() {
  const [url, setUrl]             = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [result, setResult]       = useState(null)
  const [showLensy, setShowLensy] = useState(true)
  const [focused, setFocused]     = useState(false)

  const closeLensy = () => setShowLensy(false)

  const handleAnalyze = async (overrideUrl) => {
    const target = (overrideUrl ?? url).trim()
    if (!target) return
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await analysisAPI.analyzeGithub({ repo_url: target })
      setResult(res.data)
    } catch (e) {
      setError(e?.response?.data?.detail ?? 'Failed to analyze repository.')
    } finally {
      setLoading(false)
    }
  }

  const runExample = () => {
    const exampleUrl = 'https://github.com/psf/requests.git'
    setUrl(exampleUrl)
    closeLensy()
    handleAnalyze(exampleUrl)
  }

  const allSmells = result?.files?.flatMap(f => f.smells ?? []) ?? []

  return (
    <div className="relative flex min-h-screen bg-[#F3F1ED] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-amber-300 selection:text-slate-900">

      {/* Sidebar Navigation */}
      <Sidebar />

      <div className="relative flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <MobileNav />

        {/* Hero Banner with Soft Sunset Gradient */}
        <header className="px-4 pt-4 pb-2 md:px-8 md:pt-6">
          <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100/70 to-amber-100/80 dark:from-[#181D31] dark:via-[#1B1A38] dark:to-[#29231E] border border-white/60 dark:border-white/10 p-6 md:p-12 shadow-sm transition-all">

            {/* Soft Ambient Mesh Glows */}
            <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-purple-300/40 dark:bg-purple-900/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-300/40 dark:bg-amber-900/20 blur-3xl" />

            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
              {/* Badge Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-xs text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>AI-Powered Repository Insights</span>
              </div>

              {/* Big Headline */}
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                GitHub Code Analysis <br className="hidden sm:inline" /> & Architecture Lens
              </h1>

              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto font-normal">
                Inspect metrics, complexity, technical debt, and code smells across any public repository in seconds.
              </p>

              {/* Pill Search Input */}
              <div className="pt-2 max-w-xl mx-auto">
                <div className={`p-1.5 rounded-full bg-white dark:bg-slate-900/90 border transition-all duration-300 shadow-lg flex items-center gap-2 ${
                  focused 
                    ? 'border-indigo-500 ring-4 ring-indigo-500/10' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="pl-4 text-slate-400">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="https://github.com/username/repository"
                    aria-label="GitHub repository URL"
                    disabled={loading}
                    className="flex-1 bg-transparent py-2.5 text-xs md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    onClick={() => handleAnalyze()}
                    disabled={loading || !url.trim()}
                    className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold text-xs md:text-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm"
                    type="button"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing</>
                    ) : (
                      <><Search className="w-4 h-4" /> Analyze</>
                    )}
                  </button>
                </div>

                {/* Example Trigger Button */}
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button
                    onClick={runExample}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Try with psf/requests</span>
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Dashboard */}
        <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">

          {/* Loading Skeleton Card Deck */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2" />
                  <div className="h-8 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-3/4" />
                  <div className="h-12 bg-slate-100 dark:bg-slate-800/40 rounded-2xl w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Result Presentation */}
          {result && !loading && (
            <div className="space-y-6">

              {/* Card Deck Metric Display */}
              <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Repository Snapshot</h2>
                    <p className="text-xs text-slate-400">Overview metrics for {result.repository}</p>
                  </div>
                  <span className={`text-xs px-3.5 py-1.5 rounded-full font-bold ${RISK_BADGE[result.overall_risk] ?? RISK_BADGE.Low}`}>
                    {result.overall_risk} Risk Profile
                  </span>
                </div>

                {/* Card Items Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Repository',         value: result.repository, gradient: 'from-blue-500/10 to-indigo-500/5' },
                    { label: 'Python Files',        value: result.total_files, gradient: 'from-amber-500/10 to-orange-500/5' },
                    { label: 'Avg Complexity',      value: result.aggregate?.cc, gradient: 'from-purple-500/10 to-pink-500/5' },
                    { label: 'Avg Maintainability', value: `${result.aggregate?.mi}/100`, gradient: 'from-emerald-500/10 to-teal-500/5' },
                    { label: 'Total LOC',           value: result.aggregate?.loc, gradient: 'from-sky-500/10 to-blue-500/5' },
                    { label: 'Technical Debt',      value: `${result.debt_score}/10`, gradient: 'from-rose-500/10 to-red-500/5' },
                    { label: 'Highest Risk File',   value: result.highest_risk_file, gradient: 'from-indigo-500/10 to-purple-500/5' },
                    { label: 'Languages',           value: Object.keys(result.languages ?? {}).join(', ') || 'Python', gradient: 'from-teal-500/10 to-emerald-500/5' },
                  ].map(({ label, value, gradient }) => (
                    <div
                      key={label}
                      className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} border border-slate-200/50 dark:border-white/5 transition-all duration-200 hover:scale-[1.02]`}
                    >
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1 truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality Gate */}
              <div className="rounded-[2rem] overflow-hidden border border-slate-200/80 dark:border-slate-800">
                <QualityGate gate={result.quality_gate} />
              </div>

              {/* Project Explorer + Debt */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-[2rem] bg-white dark:bg-slate-900 p-2 border border-slate-200/80 dark:border-slate-800">
                  <ProjectExplorer files={result.files ?? []} />
                </div>
                <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-2 border border-slate-200/80 dark:border-slate-800">
                  <DebtGauge score={result.debt_score} label={result.debt_label} />
                </div>
              </div>

              {/* Heatmap Table */}
              <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-2 border border-slate-200/80 dark:border-slate-800">
                <HeatmapTable files={result.files ?? []} />
              </div>

              {/* Code Smells */}
              <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-2 border border-slate-200/80 dark:border-slate-800">
                <CodeSmells smells={allSmells} />
              </div>

            </div>
          )}

          {/* Floating Assistant Widget (Lensy) */}
          {showLensy && (
            <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">

              {/* Chat Bubble Card */}
              <div className="w-80 md:w-96 rounded-3xl bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">

                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🦉</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Lensy Assistant</h4>
                      <p className="text-[10px] text-slate-400">CodeLens AI Guide</p>
                    </div>
                  </div>
                  <button
                    onClick={closeLensy}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white">What CodeLens provides:</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Python metrics: CC, MI, Halstead & Smells</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                      <span>Supports JS, TS, JSX, Java & Go</span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={runExample}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    type="button"
                  >
                    <span>Run Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={closeLensy}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Minimized Assistant Trigger */}
          {!showLensy && (
            <button
              onClick={() => setShowLensy(true)}
              type="button"
              aria-label="Reopen Lensy assistant"
              className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl hover:scale-105 transition-transform flex items-center justify-center text-xl"
            >
              🦉
            </button>
          )}

        </main>
      </div>
    </div>
  )
}
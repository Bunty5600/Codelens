import { useState, useEffect } from 'react'
import { GitBranch, Search, Loader2, AlertCircle, X, Sparkles } from 'lucide-react'
import Sidebar          from '../components/Sidebar'
import ProjectExplorer  from '../components/ProjectExplorer'
import HeatmapTable     from '../components/HeatmapTable'
import CodeSmells       from '../components/CodeSmells'
import DebtGauge        from '../components/DebtGauge'
import QualityGate      from '../components/QualityGate'
import { analysisAPI }  from '../services/api'
import MobileNav from '../components/MobileNav'

const RISK_BADGE = {
  Low:    'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/30 shadow-[0_0_16px_-4px_rgba(16,185,129,0.5)]',
  Medium: 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30 shadow-[0_0_16px_-4px_rgba(245,158,11,0.5)]',
  High:   'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/30 shadow-[0_0_16px_-4px_rgba(244,63,94,0.5)]',
}

export default function GitHub() {
  const [url, setUrl]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)
  const [showLensy, setShowLensy] = useState(true)
  const [focused, setFocused] = useState(false)

  const closeLensy = () => {
    setShowLensy(false)
  }

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
    <div className="relative flex min-h-screen bg-slate-50 dark:bg-[#05080f] overflow-hidden">

      {/* Ambient gradient atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="glx-blob absolute -top-32 -left-24 w-[32rem] h-[32rem] rounded-full bg-emerald-500/20 dark:bg-emerald-500/10 blur-[100px]" />
        <div className="glx-blob glx-blob-delay absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-cyan-500/20 dark:bg-cyan-500/10 blur-[100px]" />
        <div className="glx-blob glx-blob-delay-2 absolute bottom-0 left-1/4 w-[24rem] h-[24rem] rounded-full bg-violet-500/10 dark:bg-violet-500/10 blur-[100px]" />
      </div>

      <Sidebar />
      <div className="relative flex-1 flex flex-col min-w-0">
        <MobileNav />

        <header className="hidden md:flex items-center gap-3 h-16 px-6 shrink-0 backdrop-blur-xl bg-white/40 dark:bg-white/[0.03] border-b border-slate-200/60 dark:border-white/10">
          <div className="relative">
            <GitBranch className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-[0.15em] font-medium">Analysis</p>
            <h2 className="font-display font-bold text-slate-900 dark:text-white leading-tight">GitHub Analyzer</h2>
          </div>
        </header>

        <main className="flex-1 p-3 md:p-6 max-w-3xl mx-auto w-full">

          {/* URL Input */}
          <div className={`glx-card p-5 transition-shadow duration-300 ${focused ? 'glx-card-focus' : ''}`}>
            <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm mb-3">
              Repository URL
            </h3>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <GitBranch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused ? 'text-emerald-500' : 'text-slate-400'}`} />
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
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-white/10
                             bg-white/70 dark:bg-white/[0.04] text-slate-900 dark:text-white
                             placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/40
                             transition-all disabled:opacity-60"
                />
              </div>
              <button
                onClick={() => handleAnalyze()}
                disabled={loading || !url.trim()}
                className="glx-btn-primary text-sm py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                type="button"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                    : <><Search className="w-4 h-4" /> Analyze</>
                  }
                </span>
              </button>
            </div>

            {error && (
              <div
                className="mt-3 flex items-center gap-2 text-rose-500 text-xs animate-in fade-in slide-in-from-top-1 duration-300"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4 mt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="glx-card p-5" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="glx-shimmer h-4 rounded w-1/3 mb-3" />
                  <div className="glx-shimmer h-3 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="space-y-6 mt-4">
              {/* Repository Summary */}
              <div className="glx-card glx-reveal p-5" style={{ animationDelay: '0ms' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
                    Repository Summary
                  </h3>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${RISK_BADGE[result.overall_risk] ?? RISK_BADGE.Low}`}>
                    {result.overall_risk} Risk
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Repository',         value: result.repository },
                    { label: 'Python Files',        value: result.total_files },
                    { label: 'Avg Complexity',      value: result.aggregate?.cc },
                    { label: 'Avg Maintainability', value: `${result.aggregate?.mi}/100` },
                    { label: 'Total LOC',           value: result.aggregate?.loc },
                    { label: 'Technical Debt',      value: `${result.debt_score}/10` },
                    { label: 'Highest Risk File',   value: result.highest_risk_file },
                    { label: 'Debt Label',          value: result.debt_label },
                    { label: 'Languages',           value: Object.keys(result.languages ?? {}).join(', ') || 'Python' },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="group rounded-xl p-3 text-center bg-slate-50/80 dark:bg-white/[0.03]
                                 border border-slate-200/60 dark:border-white/5
                                 hover:border-emerald-500/30 hover:bg-emerald-500/5
                                 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality Gate */}
              <div className="glx-reveal" style={{ animationDelay: '60ms' }}>
                <QualityGate gate={result.quality_gate} />
              </div>

              {/* Project Explorer + Debt */}
              <div className="grid lg:grid-cols-3 gap-6 glx-reveal" style={{ animationDelay: '120ms' }}>
                <div className="lg:col-span-2">
                  <ProjectExplorer files={result.files ?? []} />
                </div>
                <DebtGauge score={result.debt_score} label={result.debt_label} />
              </div>

              {/* Heatmap */}
              <div className="glx-reveal" style={{ animationDelay: '180ms' }}>
                <HeatmapTable files={result.files ?? []} />
              </div>

              {/* Code Smells */}
              <div className="glx-reveal" style={{ animationDelay: '240ms' }}>
                <CodeSmells smells={allSmells} />
              </div>
            </div>
          )}

          {showLensy && (
            <div className="fixed bottom-6 right-6 z-50 flex items-end gap-4">

              {/* Owl */}
              <div className="relative glx-float">
                <div className="text-6xl cursor-pointer select-none drop-shadow-[0_8px_16px_rgba(16,185,129,0.35)]">
                  🦉
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full"></div>
              </div>

              {/* Chat Bubble */}
              <div className="relative w-96 rounded-3xl overflow-hidden
                               border border-white/20 dark:border-white/10
                               bg-white/80 dark:bg-slate-900/70 backdrop-blur-2xl
                               shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]
                               animate-in slide-in-from-bottom-4 fade-in duration-500">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 relative overflow-hidden
                                 bg-gradient-to-r from-emerald-500 via-emerald-500 to-cyan-500 text-white">
                  <div className="glx-shine absolute inset-0" />
                  <div className="relative flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-semibold">Lensy AI Assistant</span>
                  </div>
                  <button
                    onClick={closeLensy}
                    className="relative opacity-80 hover:opacity-100 transition-opacity"
                    type="button"
                    aria-label="Dismiss Lensy assistant"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Welcome to GitHub Analyzer.
                    Here's what you can expect from CodeLens AI.
                  </p>

                  <div className="mt-4 grid gap-3">
                    <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-500/20">
                      <p className="font-semibold text-emerald-500 text-sm">✅ Full Analysis</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Python repositories receive: CC, MI, Halstead metrics, Code Smells and Technical Debt.
                      </p>
                    </div>

                    <div className="rounded-xl p-3 bg-cyan-500/10 border border-cyan-500/20">
                      <p className="font-semibold text-cyan-500 text-sm">⚡ Supported Languages</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        JS, TS, JSX, TSX, HTML, CSS, Java and Go.
                      </p>
                    </div>

                    <div className="rounded-xl p-3 bg-amber-500/10 border border-amber-500/20">
                      <p className="font-semibold text-amber-500 text-sm">⚠ Limitations</p>
                      <ul className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-1">
                        <li>Large repos may take longer.</li>
                        <li>.next folders are ignored.</li>
                        <li>coverage folders are skipped.</li>
                        <li>JS/React gets basic metrics.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {['.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.go'].map((lang) => (
                      <span
                        key={lang}
                        className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-white/[0.06]
                                   border border-slate-200/60 dark:border-white/5 text-slate-600 dark:text-slate-300"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={runExample}
                      className="glx-btn-primary text-xs py-2 px-3"
                      type="button"
                    >
                      <span className="relative z-10">Try Example</span>
                    </button>
                    <button
                      onClick={closeLensy}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      Got it
                    </button>
                  </div>
                </div>

                {/* Arrow */}
                <div className="absolute right-[-10px] bottom-8 w-5 h-5 bg-white/80 dark:bg-slate-900/70 rotate-45
                                 border-r border-b border-white/20 dark:border-white/10"></div>
              </div>
            </div>
          )}

          {!showLensy && (
            <button
              onClick={() => setShowLensy(true)}
              type="button"
              aria-label="Reopen Lensy assistant"
              className="fixed bottom-6 right-6 z-50 glx-float text-5xl select-none
                         drop-shadow-[0_8px_16px_rgba(16,185,129,0.35)]
                         hover:scale-110 transition-transform"
            >
              🦉
            </button>
          )}
        </main>
      </div>

      <style>{`
        .glx-card {
          border-radius: 1rem;
          background: rgba(255,255,255,0.65);
          border: 1px solid rgba(148,163,184,0.25);
          box-shadow: 0 8px 30px -12px rgba(15,23,42,0.12);
          backdrop-filter: blur(16px);
        }
        .dark .glx-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 8px 30px -12px rgba(0,0,0,0.5);
        }
        .glx-card-focus {
          box-shadow: 0 0 0 1px rgba(16,185,129,0.3), 0 12px 36px -12px rgba(16,185,129,0.25);
        }
        .glx-btn-primary {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #10b981, #06b6d4);
          box-shadow: 0 6px 20px -6px rgba(16,185,129,0.5);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          overflow: hidden;
        }
        .glx-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 26px -6px rgba(16,185,129,0.6);
        }
        .glx-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .glx-shimmer {
          background: linear-gradient(90deg,
            rgba(148,163,184,0.15) 25%,
            rgba(148,163,184,0.35) 50%,
            rgba(148,163,184,0.15) 75%);
          background-size: 200% 100%;
          animation: glxShimmer 1.4s ease-in-out infinite;
        }
        @keyframes glxShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .glx-reveal {
          animation: glxFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes glxFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .glx-float {
          animation: glxFloat 3.2s ease-in-out infinite;
        }
        @keyframes glxFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .glx-blob {
          animation: glxBlob 14s ease-in-out infinite;
        }
        .glx-blob-delay { animation-delay: -4s; }
        .glx-blob-delay-2 { animation-delay: -9s; }
        @keyframes glxBlob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.08); }
          66% { transform: translate(-20px, 25px) scale(0.95); }
        }
        .glx-shine {
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: glxShine 3s ease-in-out infinite;
        }
        @keyframes glxShine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .glx-blob, .glx-float, .glx-shimmer, .glx-shine, .glx-reveal {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}

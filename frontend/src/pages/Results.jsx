import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GitBranch, Shield, BarChart2, FileCode, Zap,
  RefreshCw, ArrowLeft, Loader2, Download
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import Sidebar          from '../components/Sidebar'
import MobileNav        from '../components/MobileNav'
import MetricCard       from '../components/MetricCard'
import Alert            from '../components/Alert.jsx'
import ProjectExplorer  from '../components/ProjectExplorer'
import CodeSmells       from '../components/CodeSmells'
import HeatmapTable     from '../components/HeatmapTable'
import DebtGauge        from '../components/DebtGauge'
import { useTheme }     from '../context/ThemeContext.jsx'
import { analysisAPI }  from '../services/api'
import { Sun, Moon }    from 'lucide-react'

const miLevel = (v) => v >= 65 ? 'good' : v >= 45 ? 'warning' : 'danger'
const ccLevel = (v) => v <= 10 ? 'good' : v <= 20 ? 'warning' : 'danger'

// Clean SVG circular gauge — no overlap
function CircularGauge({ value, color, trackColor }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const pct = Math.min(Math.max(value, 0), 100)
  const offset = circ - (pct / 100) * circ

  return (
    <div className="relative w-36 h-36">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke={trackColor} strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-display font-bold leading-none" style={{ color }}>{value}</p>
        <p className="text-xs text-slate-400 mt-1">/ 100</p>
      </div>
    </div>
  )
}

export default function Results() {
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [data, setData]                     = useState(null)
  const [aiTip, setAiTip]                   = useState('')
  const [tipLoading, setTipLoading]         = useState(false)
  const [aiRefactor, setAiRefactor]         = useState(null)
  const [refactorLoading, setRefactorLoading] = useState(false)
  const [pdfLoading, setPdfLoading]         = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('ciq_results')
    if (stored) {
      try { setData(JSON.parse(stored)) }
      catch { console.error('Failed to parse ciq_results') }
    }
  }, [])

  const isProject    = !!data?.files
  const metrics      = isProject ? (data?.aggregate ?? {}) : (data?.metrics ?? {})
  const cc           = metrics.cc        ?? 0
  const mi           = metrics.mi        ?? 0
  const loc          = metrics.loc       ?? 0
  const funcs        = metrics.functions ?? 0
  const mlPrediction = data?.ml_prediction ?? null
  const files        = data?.files       ?? []
  const debtScore    = data?.debt_score  ?? null
  const debtLabel    = data?.debt_label  ?? ''
  const insights     = Array.isArray(metrics.insights) ? metrics.insights : []
  const allSmells    = files.flatMap(f => f.smells ?? [])

  const halstead = {
    volume:     metrics.halstead?.volume     ?? 0,
    effort:     metrics.halstead?.effort     ?? 0,
    vocabulary: metrics.halstead?.vocabulary ?? 0,
    length:     metrics.halstead?.length     ?? 0,
    difficulty: metrics.halstead?.difficulty ?? 0,
  }

  const generateTip = useCallback(async () => {
    setTipLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai-tip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are a Senior Software Architect.
Cyclomatic Complexity: ${cc}
Maintainability Index: ${mi}
Lines of Code: ${loc}
Functions: ${funcs}
Halstead Volume: ${halstead.volume}
Risk: [Low/Medium/High]
Issue: [one sentence]
Fix: [one action]
Max 50 words. No markdown.`
        })
      })
      const result  = await response.json()
      setAiTip(result?.choices?.[0]?.message?.content || 'Unable to generate tip.')
    } catch {
      setAiTip('Keep functions small and focused.')
    } finally {
      setTipLoading(false)
    }
  }, [cc, mi, loc, funcs, halstead.volume])

  const generateRefactor = useCallback(async () => {
    setRefactorLoading(true)
    try {
      const res = await analysisAPI.aiRefactor({
        cc, mi, loc, functions: funcs, halstead, smells: allSmells
      })
      setAiRefactor(res.data)
    } catch {
      setAiRefactor(null)
    } finally {
      setRefactorLoading(false)
    }
  }, [cc, mi, loc, funcs])

  useEffect(() => {
    if (!data) return
    if (cc === 0 && mi === 0) return
    generateTip()
    generateRefactor()
  }, [data])

  const downloadReport = async () => {
    setPdfLoading(true)
    try {
      const res = await analysisAPI.generateReport({
        project_name:  data?.project_name ?? 'Project',
        aggregate:     metrics,
        files,
        smells:        allSmells,
        ai_insights:   aiRefactor ?? {},
        ml_prediction: mlPrediction ?? {},
        debt_score:    debtScore
      })
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', 'codelens_report.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (e) {
      console.error('PDF error', e)
    } finally {
      setPdfLoading(false)
    }
  }

  if (!data) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileNav />
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
            <BarChart2 className="w-12 h-12 text-slate-300" />
            <h2 className="font-display font-bold text-xl text-slate-700 dark:text-slate-300">No results yet</h2>
            <p className="text-sm text-slate-400">Run an analysis to see metrics here.</p>
            <Link to="/upload" className="btn-primary mt-2"><Zap className="w-4 h-4" /> Analyze Code</Link>
          </div>
        </div>
      </div>
    )
  }

  const radialFill = mi >= 65 ? '#22c55e' : mi >= 45 ? '#eab308' : '#ef4444'
  const barData = [
    { name: 'CC',    value: cc,    fill: cc <= 10 ? '#22c55e' : cc <= 20 ? '#eab308' : '#ef4444' },
    { name: 'MI',    value: mi,    fill: mi >= 65 ? '#22c55e' : mi >= 45 ? '#eab308' : '#ef4444' },
    { name: 'Funcs', value: funcs, fill: '#8b5cf6' },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav />

        {/* Header */}
        <header className="hidden md:flex glass h-16 items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="btn-ghost w-8 h-8 p-0 rounded-lg" type="button">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Analysis</p>
              <h2 className="font-display font-bold text-slate-900 dark:text-white">
                {data?.project_name ?? 'Results'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadReport}
              disabled={pdfLoading}
              className="btn-secondary text-sm py-2"
              type="button"
            >
              {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Download Report</span>
            </button>
            <button onClick={toggle} className="btn-ghost w-9 h-9 p-0 rounded-xl" type="button">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/upload" className="btn-secondary text-sm py-2">
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Re-analyze</span>
            </Link>
          </div>
        </header>

        {/* Mobile action bar */}
        <div className="md:hidden flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => navigate(-1)} className="btn-ghost w-8 h-8 p-0 rounded-lg" type="button">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-display font-bold text-sm text-slate-900 dark:text-white flex-1 truncate">
            {data?.project_name ?? 'Results'}
          </span>
          <button onClick={downloadReport} disabled={pdfLoading} className="btn-secondary text-xs py-1.5 px-3" type="button">
            {pdfLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            PDF
          </button>
        </div>

        <main className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-auto">

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard title="Cyclomatic Complexity" value={cc} level={ccLevel(cc)} icon={GitBranch} description="Independent paths" />
            <MetricCard title="Maintainability Index" value={mi} unit="/100" level={miLevel(mi)} icon={Shield} description="Maintainability score" />
            <MetricCard title="Halstead Volume" value={Number(halstead.volume).toFixed(0)} level="neutral" icon={BarChart2} description="Program vocabulary" />
            <MetricCard title="Lines of Code" value={loc} level="neutral" icon={FileCode} description="Total source lines" />
          </div>

          {/* Project Explorer — ZIP only */}
          {isProject && <ProjectExplorer files={files} />}

          {/* Heatmap + Debt */}
          {isProject && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2"><HeatmapTable files={files} /></div>
              {debtScore !== null && <DebtGauge score={debtScore} label={debtLabel} />}
            </div>
          )}

          {/* Code Smells */}
          {isProject && <CodeSmells smells={allSmells} />}

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 card p-5">
              <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-4 text-sm">Metrics Overview</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e293b' : '#f1f5f9'} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: dark ? '#1e293b' : '#fff', border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`, borderRadius: 10, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Fixed MI Gauge */}
            <div className="card p-5 flex flex-col items-center justify-center">
              <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-4 text-sm self-start">MI Score</h3>
              <CircularGauge
                value={mi}
                color={radialFill}
                trackColor={dark ? '#1e293b' : '#f1f5f9'}
              />
            </div>
          </div>

          {/* Halstead details */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-4 text-sm">Halstead Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Volume',    value: Number(halstead.volume).toFixed(0) },
                { label: 'Effort',    value: Number(halstead.effort).toFixed(2) },
                { label: 'Functions', value: funcs },
                { label: 'LOC',       value: loc },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-xl font-display font-bold text-slate-900 dark:text-white">{value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-yellow-500" />
              <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">AI Insights</h3>
              <span className="badge-blue ml-auto">Powered by Groq</span>
            </div>
            <div className="space-y-3">

              {mlPrediction && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs uppercase tracking-wider text-slate-400">ML Defect Prediction</p>
                  <p className="text-2xl font-display font-bold mt-2 text-slate-900 dark:text-white">
                    {mlPrediction?.risk_level ?? 'Unknown'} Risk
                  </p>
                  <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
                    Confidence: {mlPrediction?.confidence ?? 0}%
                  </p>
                </div>
              )}

              {refactorLoading ? (
                <div className="flex items-center gap-2 p-4">
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                  <span className="text-xs text-slate-400 animate-pulse">Generating refactor recommendations...</span>
                </div>
              ) : aiRefactor && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Risk Level</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      aiRefactor.risk_level === 'High'   ? 'bg-red-100 text-red-600' :
                      aiRefactor.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>{aiRefactor.risk_level}</span>
                  </div>
                  {aiRefactor.root_cause && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Root Cause</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{aiRefactor.root_cause}</p>
                    </div>
                  )}
                  {aiRefactor.refactoring?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Refactoring</p>
                      {aiRefactor.refactoring.map((r, i) => (
                        <p key={i} className="text-sm text-slate-600 dark:text-slate-400">• {r}</p>
                      ))}
                    </div>
                  )}
                  {aiRefactor.architecture?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Architecture</p>
                      {aiRefactor.architecture.map((a, i) => (
                        <p key={i} className="text-sm text-slate-600 dark:text-slate.400">• {a}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {insights.map((ins, i) => (
                <Alert key={i} type={ins?.type === 'danger' ? 'error' : (ins?.type ?? 'info')} message={ins?.msg ?? ''} />
              ))}

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {tipLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                    <span className="animate-pulse text-xs">Generating AI tip...</span>
                  </div>
                ) : (
                  <>💡 <span className="font-medium">AI Tip:</span>{' '}
                  {aiTip || 'Keep functions small and focused for better maintainability.'}</>
                )}
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
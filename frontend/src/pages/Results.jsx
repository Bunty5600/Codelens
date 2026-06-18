import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GitBranch, Shield, BarChart2, FileCode, Zap,
  RefreshCw, ArrowLeft, Loader2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis, Cell
} from 'recharts'
import Sidebar    from '../components/Sidebar'
import MetricCard from '../components/MetricCard'
import Alert      from '../components/Alert'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

const miLevel = (v) => v >= 65 ? 'good' : v >= 45 ? 'warning' : 'danger'
const ccLevel = (v) => v <= 10 ? 'good' : v <= 20 ? 'warning' : 'danger'

export default function Results() {
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [data, setData]           = useState(null)
  const [aiTip, setAiTip]         = useState('')
  const [tipLoading, setTipLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('ciq_results')
    if (stored) {
      try {
        setData(JSON.parse(stored))
      } catch {
        console.error('Failed to parse ciq_results')
      }
    }
  }, [])

  // ── Derive metrics safely ──────────────────────────────
  const metrics      = data?.metrics      ?? {}
  const cc           = metrics.cc         ?? 0
  const mi           = metrics.mi         ?? 0
  const loc          = metrics.loc        ?? 0
  const funcs        = metrics.functions  ?? 0
  const insights     = Array.isArray(metrics.insights) ? metrics.insights : []
  const mlPrediction = data?.ml_prediction ?? null

  const halstead = {
    volume:     metrics.halstead?.volume     ?? 0,
    effort:     metrics.halstead?.effort     ?? 0,
    vocabulary: metrics.halstead?.vocabulary ?? 0,
    length:     metrics.halstead?.length     ?? 0,
    difficulty: metrics.halstead?.difficulty ?? 0,
  }

  // ── Groq AI Tip ────────────────────────────────────────
 const generateTip = useCallback(async () => {
  setTipLoading(true)
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/ai-tip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        prompt: `You are a Senior Software Architect...
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
    const result = await response.json()
    const content = result?.choices?.[0]?.message?.content
    setAiTip(content || 'Unable to generate tip.')
  } catch (err) {
    setAiTip('Keep functions small and focused.')
  } finally {
    setTipLoading(false)
  }
}, [cc, mi, loc, funcs, halstead.volume])

  useEffect(() => {
    if (!data) return
    if (cc === 0 && mi === 0) return
    generateTip()
  }, [data, generateTip])
  // ───────────────────────────────────────────────────────

  if (!data) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-10 text-center">
          <BarChart2 className="w-12 h-12 text-slate-300" />
          <h2 className="font-display font-bold text-xl text-slate-700 dark:text-slate-300">
            No results yet
          </h2>
          <p className="text-sm text-slate-400">Run an analysis to see metrics here.</p>
          <Link to="/upload" className="btn-primary mt-2">
            <Zap className="w-4 h-4" /> Analyze Code
          </Link>
        </div>
      </div>
    )
  }

  const barData = [
    { name: 'Cyclomatic', value: cc,    fill: cc <= 10 ? '#22c55e' : cc <= 20 ? '#eab308' : '#ef4444' },
    { name: 'MI Score',   value: mi,    fill: mi >= 65 ? '#22c55e' : mi >= 45 ? '#eab308' : '#ef4444' },
    { name: 'Functions',  value: funcs, fill: '#8b5cf6' },
  ]

  const radialFill  = mi >= 65 ? '#22c55e' : mi >= 45 ? '#eab308' : '#ef4444'
  const radialData  = [{ name: 'MI', value: mi, fill: radialFill }]

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="glass h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="btn-ghost w-8 h-8 p-0 rounded-lg"
              type="button"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Analysis</p>
              <h2 className="font-display font-bold text-slate-900 dark:text-white">Results</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggle()}
              className="btn-ghost w-9 h-9 p-0 rounded-xl"
              type="button"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/upload" className="btn-secondary text-sm py-2">
              <RefreshCw className="w-3.5 h-3.5" /> Re-analyze
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 overflow-auto">

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Cyclomatic Complexity"
              value={cc}
              level={ccLevel(cc)}
              icon={GitBranch}
              description="Number of linearly independent paths"
            />
            <MetricCard
              title="Maintainability Index"
              value={mi}
              unit="/100"
              level={miLevel(mi)}
              icon={Shield}
              description="Composite code maintainability score"
            />
            <MetricCard
              title="Halstead Volume"
              value={Number(halstead.volume).toFixed(0)}
              level="neutral"
              icon={BarChart2}
              description="Program vocabulary × program length"
            />
            <MetricCard
              title="Lines of Code"
              value={loc}
              level="neutral"
              icon={FileCode}
              description="Total source lines analyzed"
            />
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Bar chart */}
            <div className="lg:col-span-2 card p-5">
              <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-4 text-sm">
                Metrics Overview
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barSize={36}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={dark ? '#1e293b' : '#f1f5f9'}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background:   dark ? '#1e293b' : '#fff',
                      border:       `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
                      borderRadius: 10,
                      fontSize:     12,
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radial MI */}
            <div className="card p-5 flex flex-col items-center justify-center">
              <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-2 text-sm self-start">
                MI Score
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="90%"
                  data={radialData}
                  startAngle={90}
                  endAngle={90 - (mi / 100) * 360}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill={radialFill}
                    background={{ fill: dark ? '#1e293b' : '#f1f5f9' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="text-center -mt-12">
                <p
                  className="text-4xl font-display font-bold"
                  style={{ color: radialFill }}
                >
                  {mi}
                </p>
                <p className="text-xs text-slate-400 mt-1">out of 100</p>
              </div>
            </div>
          </div>

          {/* Halstead details */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-4 text-sm">
              Halstead Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Volume',    value: Number(halstead.volume).toFixed(0) },
                { label: 'Effort',    value: Number(halstead.effort).toFixed(2) },
                { label: 'Functions', value: funcs },
                { label: 'LOC',       value: loc },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                >
                  <p className="text-xl font-display font-bold text-slate-900 dark:text-white">
                    {value}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-yellow-500" />
              <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">
                AI Insights
              </h3>
              <span className="badge-blue ml-auto">Powered by AI</span>
            </div>

            <div className="space-y-3">

              {/* ML Prediction */}
              {mlPrediction && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    ML Defect Prediction
                  </p>
                  <p className="text-2xl font-display font-bold mt-2 text-slate-900 dark:text-white">
                    {mlPrediction?.risk_level ?? 'Unknown'} Risk
                  </p>
                  <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
                    Confidence: {mlPrediction?.confidence ?? 0}%
                  </p>
                </div>
              )}

              {/* Dynamic Insights */}
              {insights.map((ins, i) => {
                const alertType = ins?.type === 'danger' ? 'error' : (ins?.type ?? 'info')
                const alertMsg  = ins?.msg ?? ''
                return (
                  <Alert key={i} type={alertType} message={alertMsg} />
                )
              })}

              {/* Groq AI Tip */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {tipLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                    <span className="animate-pulse">Generating AI tip...</span>
                  </div>
                ) : (
                  <>
                    💡 <span className="font-medium">AI Tip:</span>{' '}
                    {aiTip || 'Keep functions small and focused for better maintainability.'}
                  </>
                )}
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  )
}

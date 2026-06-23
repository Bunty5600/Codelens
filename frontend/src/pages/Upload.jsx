import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Zap, ChevronRight } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import UploadBox from '../components/UploadBox'
import Alert from '../components/Alert'
import { useTheme } from '../context/ThemeContext.jsx'
import { Sun, Moon } from 'lucide-react'
import MobileNav from '../components/MobileNav'
import { analysisAPI } from '../services/api'

const STEPS = [
  'Parsing source code…',
  'Computing cyclomatic complexity…',
  'Calculating Halstead metrics…',
  'Scoring maintainability index…',
  'Generating AI insights…',
]

export default function Upload() {
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()

  const [file,     setFile]     = useState(null)
  const [code,     setCode]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [alert,    setAlert]    = useState(null)
  const [progress, setProgress] = useState(0)
  const [stepIdx,  setStepIdx]  = useState(0)

  const canAnalyze = file || code.trim().length > 10

  const handleAnalyze = async () => {
    if (!canAnalyze) {
      setAlert({ type: 'warning', message: 'Please upload a file or paste code first.' })
      return
    }

    setLoading(true)
    setAlert(null)
    setProgress(0)

    // Progress animation
    for (let i = 0; i < STEPS.length; i++) {
      setStepIdx(i)
      setProgress(Math.round(((i + 1) / STEPS.length) * 100))
      await new Promise(r => setTimeout(r, 500))
    }

    try {
      let res

      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const response = await analysisAPI.analyzeFile(formData)
        res = response.data
      } else {
        const response = await analysisAPI.analyzeCode(code)
        res = response.data
      }

      console.log("API RESULT:", res)
      localStorage.setItem('ciq_results', JSON.stringify(res))
      navigate('/results')

    } catch (err) {
      console.error('Backend Error:', err)
      setAlert({ type: 'error', message: err?.response?.data?.detail || 'Could not reach backend.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav />
        <header className="hidden md:flex glass h-16 items-center justify-between px-6 shrink-0">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Analyze</p>
            <h2 className="font-display font-bold text-slate-900 dark:text-white">Upload Code</h2>
          </div>
          <button onClick={toggle} className="btn-ghost w-9 h-9 p-0 rounded-xl">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        <main className="flex-1 p-3 md:p-6 max-w-3xl mx-auto w-full">
          <div className="space-y-6">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Dashboard</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Upload</span>
            </div>

            {/* Card */}
            <div className="card p-6 space-y-6">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Analyze your code
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Upload a .py / .zip file or paste code directly.
                </p>
              </div>

              {alert && <Alert {...alert} onClose={() => setAlert(null)} />}

              <UploadBox onFile={setFile} onCode={setCode} />

              {!loading ? (
                <button
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                  className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4" />
                  Run Analysis
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-500 shrink-0" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">{STEPS[stepIdx]}</p>
                    <span className="ml-auto text-sm font-mono text-emerald-500">{progress}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Supported inputs
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  ['Python files',    '.py',],
                  ['ZIP archives',    'Multiple files']

                ].map(([label, sub]) => (
                  <div key={label} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{label}</span>
                    <span className="text-slate-400 text-xs">— {sub}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
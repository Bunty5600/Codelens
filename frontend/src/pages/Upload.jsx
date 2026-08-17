import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ArrowRight, FileCode2, FolderArchive, Shield, Sparkles, Sun, Moon } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import UploadBox from '../components/UploadBox'
import Alert from '../components/Alert.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import MobileNav from '../components/MobileNav'
import { analysisAPI } from '../services/api'

const STEPS = [
  'Reading source files…',
  'Analyzing code complexity…',
  'Evaluating Halstead metrics…',
  'Calculating maintainability…',
  'Finishing up insights…',
]

export default function Upload() {
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()

  const [file, setFile] = useState(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [progress, setProgress] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)

  const canAnalyze = Boolean(file || code.trim().length > 10)

  const handleAnalyze = async () => {
    if (!canAnalyze) {
      setAlert({ type: 'warning', message: 'Please drop a file or paste code first.' })
      return
    }

    setLoading(true)
    setAlert(null)
    setProgress(0)

    for (let i = 0; i < STEPS.length; i++) {
      setStepIdx(i)
      setProgress(Math.round(((i + 1) / STEPS.length) * 100))
      await new Promise((r) => setTimeout(r, 450))
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

      localStorage.setItem('ciq_results', JSON.stringify(res))
      navigate('/results')
    } catch (err) {
      console.error('Backend Error:', err)
      setAlert({ type: 'error', message: err?.response?.data?.detail || 'Could not connect to the backend server.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-slate-200 font-sans selection:bg-slate-700 selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav />

        {/* Minimal Nav Header */}
        <header className="hidden md:flex h-14 items-center justify-between px-8 border-b border-slate-800/80 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Dashboard</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-200 font-semibold">New Analysis</span>
          </div>

          <button
            onClick={toggle}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-5 md:p-12 max-w-4xl mx-auto w-full flex flex-col justify-center">
          <div className="space-y-8">

            {/* Header Section */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-slate-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Ready for input</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Inspect your code
              </h1>
              <p className="text-sm text-slate-400 max-w-xl">
                Paste raw snippets or drag and drop your project files below for complexity and maintainability scoring.
              </p>
            </div>

            {alert && <Alert {...alert} onClose={() => setAlert(null)} />}

            {/* Main Interactive Container */}
            <div className="rounded-2xl bg-[#161b22] border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl">
              <UploadBox onFile={setFile} onCode={setCode} />

              <div className="pt-2">
                {!loading ? (
                  <button
                    onClick={handleAnalyze}
                    disabled={!canAnalyze}
                    className="w-full py-3 px-5 rounded-xl bg-slate-100 hover:bg-white text-slate-900 font-semibold text-sm transition-all disabled:opacity-30 disabled:hover:bg-slate-100 flex items-center justify-center gap-2 group shadow-sm"
                  >
                    <span>Analyze Code</span>
                    <ArrowRight className="w-4 h-4 text-slate-700 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  /* Clean Loading Bar */
                  <div className="p-4 rounded-xl bg-[#0d1117] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                        <span>{STEPS[stepIdx]}</span>
                      </div>
                      <span className="text-slate-400 font-medium">{progress}%</span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-200 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Format Notes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#161b22]/50 border border-slate-800/80 flex items-center gap-3">
                <FileCode2 className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-medium text-slate-200">Python files</span>
                  <p className="text-slate-500 mt-0.5">Single <code className="text-slate-400 font-mono">.py</code> scripts</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#161b22]/50 border border-slate-800/80 flex items-center gap-3">
                <FolderArchive className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-medium text-slate-200">ZIP archives</span>
                  <p className="text-slate-500 mt-0.5">Full folder repositories</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#161b22]/50 border border-slate-800/80 flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-medium text-slate-200">Private processing</span>
                  <p className="text-slate-500 mt-0.5">Parsed in memory only</p>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
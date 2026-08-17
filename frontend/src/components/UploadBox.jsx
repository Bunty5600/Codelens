import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileCode, FileArchive, X, CheckCircle2, Code2, Trash2 } from 'lucide-react'
import clsx from 'clsx'

export default function UploadBox({ onFile, onCode, accept = '.zip,.py,.js,.ts,.jsx,.tsx' }) {
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('file') // 'file' | 'paste'
  const [code, setCode] = useState('')

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) {
      setFile(accepted[0])
      onFile?.(accepted[0])
    }
  }, [onFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'text/x-python': ['.py'],
      'application/javascript': ['.js'],
      'text/javascript': ['.jsx', '.tsx', '.ts'],
    },
    maxFiles: 1,
  })

  const removeFile = () => {
    setFile(null)
    onFile?.(null)
  }

  const handleCodeChange = (e) => {
    setCode(e.target.value)
    onCode?.(e.target.value)
  }

  const clearCode = () => {
    setCode('')
    onCode?.('')
  }

  const isZip = file?.name?.endsWith('.zip')
  const lineCount = code ? code.split('\n').length : 0

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Modern Segmented Control */}
      <div className="relative flex p-1 bg-slate-100 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 w-fit">
        <button
          type="button"
          onClick={() => setMode('file')}
          className={clsx(
            'relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200',
            mode === 'file'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>UPLOAD FILE</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('paste')}
          className={clsx(
            'relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200',
            mode === 'paste'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>PASTE CODE</span>
        </button>
      </div>

      {mode === 'file' ? (
        file ? (
          /* File Preview Card */
          <div className="group relative flex items-center gap-4 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02] backdrop-blur-sm transition-all duration-200">
            <div className={clsx(
              'p-3 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
              isZip
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            )}>
              {isZip ? <FileArchive className="w-6 h-6" /> : <FileCode className="w-6 h-6" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                  {file.name}
                </p>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {(file.size / 1024).toFixed(1)} KB • {file.type || 'Source Code'}
              </p>
            </div>

            <button
              type="button"
              onClick={removeFile}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all duration-150"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Dropzone */
          <div
            {...getRootProps()}
            className={clsx(
              'relative group overflow-hidden border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
              isDragActive
                ? 'border-emerald-500 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.03] scale-[0.99]'
                : 'border-slate-300 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30'
            )}
          >
            <input {...getInputProps()} />

            {/* Subtle Gradient Glow background on active drag */}
            <div className={clsx(
              'absolute inset-0 pointer-events-none transition-opacity duration-300 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent',
              isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )} />

            <div className={clsx(
              'w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 shadow-sm border',
              isDragActive
                ? 'bg-emerald-500 text-white border-emerald-400 scale-110 shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200/80 dark:border-slate-700/50 group-hover:scale-105 group-hover:text-emerald-500'
            )}>
              <Upload className="w-5 h-5" />
            </div>

            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              {isDragActive ? 'Drop your file here' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports single script or archived project
            </p>

            <div className="flex items-center justify-center gap-1.5 mt-4">
              {['.py', '.js', '.ts', '.jsx', '.tsx', '.zip'].map((ext) => (
                <span
                  key={ext}
                  className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/40"
                >
                  {ext}
                </span>
              ))}
            </div>
          </div>
        )
      ) : (
        /* Code Editor Input Container */
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 focus-within:border-emerald-500/50 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-200">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/50 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Code Snippet
            </span>
            {code && (
              <div className="flex items-center gap-3">
                <span className="text-slate-500">{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
                <button
                  type="button"
                  onClick={clearCode}
                  className="hover:text-rose-400 transition-colors p-1"
                  title="Clear snippet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Textarea Code Input */}
          <textarea
            value={code}
            onChange={handleCodeChange}
            placeholder={`# Paste your code snippet here...\ndef main():\n    print("Ready to run!")`}
            rows={8}
            className="w-full px-4 py-3 font-mono text-sm bg-transparent text-emerald-400 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
          />
        </div>
      )}
    </div>
  )
}
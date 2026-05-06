import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileCode, FileArchive, X, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

export default function UploadBox({ onFile, onCode, accept = '.zip,.py,.js,.ts,.jsx,.tsx' }) {
  const [file,    setFile]    = useState(null)
  const [mode,    setMode]    = useState('file')   // 'file' | 'paste'
  const [code,    setCode]    = useState('')
  const [dragging, setDragging] = useState(false)

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) {
      setFile(accepted[0])
      onFile?.(accepted[0])
      setDragging(false)
    }
  }, [onFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip':   ['.zip'],
      'text/x-python':     ['.py'],
      'application/javascript': ['.js'],
      'text/javascript':   ['.jsx', '.tsx', '.ts'],
    },
    maxFiles: 1,
    onDragEnter: () => setDragging(true),
    onDragLeave: () => setDragging(false),
  })

  const removeFile = () => { setFile(null); onFile?.(null) }

  const handleCodeChange = (e) => {
    setCode(e.target.value)
    onCode?.(e.target.value)
  }

  const fileIcon = file?.name?.endsWith('.zip')
    ? <FileArchive className="w-8 h-8 text-yellow-500" />
    : <FileCode className="w-8 h-8 text-emerald-500" />

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {['file', 'paste'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              mode === m
                ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            {m === 'file' ? '📁 Upload File' : '💻 Paste Code'}
          </button>
        ))}
      </div>

      {mode === 'file' ? (
        file ? (
          /* File preview */
          <div className="flex items-center gap-4 p-5 card border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10">
            {fileIcon}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{file.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {(file.size / 1024).toFixed(1)} KB · {file.type || 'file'}
              </p>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <button
              onClick={removeFile}
              className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Drop zone */
          <div
            {...getRootProps()}
            className={clsx(
              'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200',
              isDragActive || dragging
                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            )}
          >
            <input {...getInputProps()} />
            <div className={clsx(
              'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all',
              isDragActive ? 'bg-emerald-100 dark:bg-emerald-900/30 scale-110' : 'bg-slate-100 dark:bg-slate-800'
            )}>
              <Upload className={clsx('w-6 h-6', isDragActive ? 'text-emerald-500' : 'text-slate-400')} />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              {isDragActive ? 'Drop it here!' : 'Drag & drop your file'}
            </p>
            <p className="text-sm text-slate-400 mt-1">or <span className="text-emerald-500 font-medium">browse files</span></p>
            <p className="text-xs text-slate-400 mt-3">.py · .js · .ts · .jsx · .tsx · .zip</p>
          </div>
        )
      ) : (
        /* Paste code */
        <div className="relative">
          <textarea
            value={code}
            onChange={handleCodeChange}
            placeholder={`# Paste your code here...\ndef example_function(n):\n    if n <= 1:\n        return n\n    return example_function(n-1) + example_function(n-2)`}
            className="w-full h-64 px-4 py-3 rounded-xl font-mono text-sm
                       border border-slate-200 dark:border-slate-700
                       bg-slate-950 text-emerald-400
                       placeholder:text-slate-600
                       focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                       resize-none"
          />
          {code && (
            <div className="absolute top-3 right-3 badge badge-green">
              {code.split('\n').length} lines
            </div>
          )}
        </div>
      )}
    </div>
  )
}
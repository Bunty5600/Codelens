import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:9000",
  timeout: 60000,
})

// Attach the current Clerk session token to every request. Clerk attaches
// itself to `window.Clerk` once loaded (this happens automatically inside
// <ClerkProvider>, see main.jsx), so this works from a plain module without
// needing a React hook at every call site.
API.interceptors.request.use(async (config) => {
  const token = await window.Clerk?.session?.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Analysis ────────────────────────────────────────────
export const analysisAPI = {
  analyzeCode: (code,filename = null)     => API.post('/analyze/code',    { code:code,filename, }),
  analyzeFile: (formData) => API.post('/analyze/upload',  formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getResults:  (id)       => API.get(`/analyze/results/${id}`),
  getById:     (id)       => API.get(`/analyze/result/${id}`),
  getHistory:  ()         => API.get('/analyze/history'),
  aiRefactor:  (data)     => API.post('/ai/refactor', data),
  generateReport: (data) => API.post('/report/generate', data, { responseType: 'blob' }),
  getDebt: (data) => API.post('/analyze/debt', data),
  analyzeGithub: (data) => API.post('/analyze/github', data),
}
export default API

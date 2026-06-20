import axios from 'axios'
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:9000",
  timeout: 30000,
})

// Attach token to every request
// Attach token to every request (skip auth routes)
API.interceptors.request.use((config) => {
  const isAuthRoute = config.url?.startsWith('/auth/')
  if (!isAuthRoute) {
    const user = localStorage.getItem('ciq_user')
    if (user) {
      const parsed = JSON.parse(user)
      if (parsed.token) config.headers.Authorization = `Bearer ${parsed.token}`
    }
  }
  return config
})

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login:  (data) => API.post('/auth/login',  data),
}

// ─── Analysis ────────────────────────────────────────────
export const analysisAPI = {
  analyzeCode: (code)     => API.post('/analyze/code',    { code:code,filename:"test.py" }),
  analyzeFile: (formData) => API.post('/analyze/upload',  formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getResults:  (id)       => API.get(`/analyze/results/${id}`),
  getHistory:  ()         => API.get('/analyze/history'),
  aiRefactor:  (data)     => API.post('/ai/refactor', data),
  generateReport: (data) => API.post('/report/generate', data, { responseType: 'blob' }),
  getDebt: (data) => API.post('/analyze/debt', data),
}
export default API
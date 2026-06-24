import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Context
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'

// Pages
import Landing   from './pages/Landing'
import Login     from './pages/Login'
import Signup    from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Upload    from './pages/Upload.jsx'
import Results   from './pages/Results.jsx'
import Profile   from './pages/Profile.jsx'
import History from './pages/History'
import GitHub from './pages/GitHub.jsx'

import './App.css'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"       element={<Landing />} />
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/upload"    element={<PrivateRoute><Upload /></PrivateRoute>} />
      <Route path="/results"      element={<PrivateRoute><Results /></PrivateRoute>} />
      <Route path="/results/:id"  element={<PrivateRoute><Results /></PrivateRoute>} />
      <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
       <Route path="/github" element={<PrivateRoute><GitHub /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
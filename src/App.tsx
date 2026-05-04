import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import CertPage from './pages/CertPage'
import DashboardPage from './pages/DashboardPage'
import SharePage from './pages/SharePage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cert/:id" element={<CertPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/share/:token" element={<SharePage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

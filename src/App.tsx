import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Home from './pages/Home'
import CertPage from './pages/CertPage'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cert/:id" element={<CertPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

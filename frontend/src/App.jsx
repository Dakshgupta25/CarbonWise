import { useState } from 'react'
import Navbar from './components/Navbar'
import PredictionForm from './components/PredictionForm'
import Dashboard from './components/Dashboard'
import Leaderboard from './components/Leaderboard'
import Badges from './components/Badges'

export default function App() {
  const [page, setPage] = useState('home')   // 'home' | 'dashboard' | 'leaderboard' | 'badges'
  const [result, setResult] = useState(null)
  const [formData, setFormData] = useState(null)

  const handleResult = (apiResult, submitted) => {
    setResult(apiResult)
    setFormData(submitted)
    setPage('dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar page={page} setPage={setPage} hasResult={!!result} />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 1.25rem 6rem' }}>
        {page === 'home'        && <PredictionForm onResult={handleResult} />}
        {page === 'dashboard'   && result && <Dashboard result={result} formData={formData} onBack={() => setPage('home')} />}
        {page === 'leaderboard' && <Leaderboard userResult={result} />}
        {page === 'badges'      && <Badges result={result} formData={formData} />}
      </main>
    </div>
  )
}

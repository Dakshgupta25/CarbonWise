import { useState } from 'react'
import Navbar from './components/Navbar'
import PredictionForm from './components/PredictionForm'
import Dashboard from './components/Dashboard'

export default function App() {
  const [result, setResult] = useState(null)   // holds API response
  const [formData, setFormData] = useState(null) // holds last submitted form values

  const handleResult = (apiResult, submittedForm) => {
    setResult(apiResult)
    setFormData(submittedForm)
  }

  const handleReset = () => {
    setResult(null)
    setFormData(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar onLogoClick={handleReset} />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
        {!result
          ? <PredictionForm onResult={handleResult} />
          : <Dashboard result={result} formData={formData} onBack={handleReset} />
        }
      </main>
    </div>
  )
}

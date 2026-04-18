import { useState } from 'react'

const API_URL = 'http://127.0.0.1:5000/predict'

export default function PredictionForm({ onResult }) {
  const [km,      setKm]     = useState('')
  const [loading, setLoad]   = useState(false)
  const [error,   setError]  = useState('')

  const handleSubmit = async () => {
    if (!km || parseFloat(km) <= 0) { setError('Please enter your monthly driving distance.'); return }
    setLoad(true); setError('')
    try {
      const res  = await fetch(API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle_monthly_distance_km: km }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      onResult(data, { vehicle_monthly_distance_km: parseFloat(km) })
    } catch (e) {
      setError(e.message || 'Cannot reach Flask server. Run: python app.py')
    } finally { setLoad(false) }
  }

  // Estimated annual emission preview as user types
  const kmVal  = parseFloat(km) || 0
  // rough estimate before API: ~0.21 kg per km per month × 12 months
  const preview = kmVal > 0 ? Math.round(kmVal * 0.21 * 12) : null

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', paddingTop: '1rem', marginBottom: '3rem' }} className="fade-up">
        <div style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: 99,
          border: '1px solid rgba(74,222,128,0.25)', background: 'var(--green-bg)',
          fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--green)',
          letterSpacing: '1px', marginBottom: 22,
        }}>
          SIMPLE LINEAR REGRESSION · y = β₀ + β₁x
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
          fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.05,
          color: 'var(--text)', marginBottom: 16,
        }}>
          One question.<br />
          <span style={{ color: 'var(--green)' }}>Your footprint.</span>
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.8, maxWidth: 380, margin: '0 auto' }}>
          Simple Linear Regression uses a <strong style={{ color: 'var(--text)' }}>single predictor</strong> to estimate your annual CO₂ — monthly vehicle distance, the strongest emission driver in our dataset.
        </p>
      </div>

      {/* Why one input — context card */}
      <div className="fade-up-1" style={{
        background: 'var(--surface)', borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border)', padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '0.5px', marginBottom: 12 }}>
          WHY ONE INPUT?
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '📐', title: 'SLR Definition', desc: 'Simple Linear Regression is defined as y = β₀ + β₁x — exactly one predictor variable.' },
            { icon: '🏆', title: 'Strongest Feature', desc: 'Vehicle distance has the highest Pearson correlation with CO₂ in our dataset (Hypothesis Test 1).' },
            { icon: '📊', title: 'Interpretable', desc: 'Each km/month added = β₁ kg more CO₂/year. Direct, human-readable coefficient.' },
            { icon: '✅', title: 'Statistically Justified', desc: 'Pearson r is statistically significant (p < 0.05), confirming it belongs as the predictor.' },
          ].map(c => (
            <div key={c.title} style={{ padding: '12px', background: 'var(--surface2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 16, marginBottom: 6 }}>{c.icon}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{c.title}</p>
              <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.5 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* THE input */}
      <div className="fade-up-2" style={{
        background: 'var(--surface)', borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border)', padding: '2rem',
        boxShadow: '0 0 60px rgba(0,0,0,0.4)',
      }}>
        <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)', letterSpacing: '0.5px', marginBottom: 8 }}>
          x  —  PREDICTOR VARIABLE
        </p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.3px' }}>
          How many km do you drive per month?
        </p>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20, lineHeight: 1.6 }}>
          Include all personal vehicle travel — commute, errands, trips. Don't include public transport.
        </p>

        <div style={{ position: 'relative' }}>
          <input
            type="number"
            value={km}
            onChange={e => { setKm(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. 500"
            min="0" max="10000"
            style={{
              width: '100%', padding: '16px 80px 16px 18px',
              background: 'var(--surface2)', border: '1.5px solid var(--border2)',
              borderRadius: 'var(--r-md)', fontSize: 28, fontWeight: 700,
              color: 'var(--text)', outline: 'none',
              fontFamily: 'var(--font-mono)', transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e => e.target.style.borderColor = 'var(--border2)'}
          />
          <span style={{
            position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
            fontSize: 13, color: 'var(--text3)', fontFamily: 'var(--font-mono)',
          }}>km/mo</span>
        </div>

        {/* Live preview */}
        {preview !== null && (
          <div style={{
            marginTop: 14, padding: '10px 16px', borderRadius: 'var(--r-sm)',
            background: 'var(--green-bg)', border: '1px solid rgba(74,222,128,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>
              Rough estimate
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
              ~{preview.toLocaleString()} kg CO₂/year
            </span>
          </div>
        )}

        {/* Common reference points */}
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: 8, letterSpacing: '0.3px' }}>
            QUICK PICK
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'Low', km: 200, desc: 'Occasional use' },
              { label: 'Average', km: 500, desc: 'Daily commute' },
              { label: 'High', km: 1000, desc: 'Heavy driver' },
              { label: 'Very high', km: 2000, desc: 'Long commutes' },
            ].map(p => (
              <button key={p.km} onClick={() => setKm(String(p.km))} style={{
                padding: '7px 14px', borderRadius: 99, fontSize: 12,
                border: km === String(p.km) ? '1px solid var(--green)' : '1px solid var(--border2)',
                background: km === String(p.km) ? 'var(--green-bg)' : 'transparent',
                color: km === String(p.km) ? 'var(--green)' : 'var(--text2)',
                cursor: 'pointer', transition: 'all 0.12s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              }}>
                <span style={{ fontWeight: 600 }}>{p.km} km</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>{p.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 'var(--r-sm)', background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--red)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
          ⚠ {error}
        </div>
      )}

      {/* Submit */}
      <button onClick={handleSubmit} disabled={loading} className="fade-up-3" style={{
        width: '100%', marginTop: '1.25rem', padding: '16px',
        borderRadius: 'var(--r-md)', fontSize: 16, fontWeight: 700,
        background: loading ? 'var(--surface2)' : 'var(--green)',
        border: 'none', color: loading ? 'var(--green)' : '#0a0f0a',
        cursor: loading ? 'default' : 'pointer',
        fontFamily: 'var(--font-display)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        boxShadow: loading ? 'none' : '0 0 30px rgba(74,222,128,0.35)',
        transition: 'all 0.2s',
      }}>
        {loading
          ? <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(74,222,128,0.3)', borderTopColor: 'var(--green)', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Running SLR model...</>
          : '🌿 Calculate My Footprint'}
      </button>

      {/* Formula footnote */}
      <p className="fade-up-3" style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
        ŷ = β₀ + β₁ × km_per_month · model trained on Carbon Emission dataset
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

import { useState } from 'react'

const API_URL = 'http://127.0.0.1:5000/predict'

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 14, background: 'var(--surface)',
  color: 'var(--text)', outline: 'none',
}

const labelStyle = {
  fontSize: 13, fontWeight: 500,
  color: 'var(--text-muted)', marginBottom: 6, display: 'block',
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={labelStyle}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: 'var(--text-hint)', marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function NumberInput({ value, onChange, min = 0, max, step = 1, placeholder }) {
  return (
    <input type="number" value={value} onChange={e => onChange(e.target.value)}
      min={min} max={max} step={step} placeholder={placeholder}
      style={inputStyle}
    />
  )
}

function ChipSelect({ options, selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const active = selected === o.value
        return (
          <button key={o.value} type="button" onClick={() => onToggle(o.value)}
            style={{
              padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500,
              border: active ? '1.5px solid var(--green-600)' : '1.5px solid var(--border)',
              background: active ? 'var(--green-100)' : 'var(--surface)',
              color: active ? 'var(--green-700)' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.12s',
            }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

const STEPS = ['Vehicle & Travel', 'Personal Info', 'Lifestyle']

export default function PredictionForm({ onResult }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Exactly the 7 inputs that map to your 10 model features
  const [form, setForm] = useState({
    vehicle_monthly_distance_km: '',
    air_travel_frequency: 'never',
    vehicle_type: 'petrol',
    new_clothes_monthly: '',
    waste_bag_weekly_count: '',
    sex: 'male',
    body_type: 'normal',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      onResult(data, form)
    } catch (e) {
      setError(e.message || 'Could not reach server. Is Flask running on port 5000?')
    } finally {
      setLoading(false)
    }
  }

  const stepContent = [
    <div key="vehicle" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Field label="Monthly driving distance" hint="(km)">
        <NumberInput value={form.vehicle_monthly_distance_km}
          onChange={v => set('vehicle_monthly_distance_km', v)}
          min={0} max={10000} placeholder="e.g. 500" />
        <p style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 4 }}>
          Biggest factor in your footprint — 37% importance in the model.
        </p>
      </Field>
      <Field label="Vehicle type">
        <ChipSelect
          options={[
            { value: 'petrol',    label: '⛽ Petrol' },
            { value: 'diesel',    label: '🛢️ Diesel' },
            { value: 'hybrid',    label: '🔋 Hybrid' },
            { value: 'electric',  label: '⚡ Electric' },
            { value: 'lpg',       label: '🔵 LPG' },
          ]}
          selected={form.vehicle_type}
          onToggle={v => set('vehicle_type', v)}
        />
      </Field>
      <Field label="Air travel frequency">
        <ChipSelect
          options={[
            { value: 'never',           label: '🚫 Never' },
            { value: 'rarely',          label: '✈️ Rarely' },
            { value: 'frequently',      label: '✈️✈️ Frequently' },
            { value: 'very frequently', label: '✈️✈️✈️ Very frequently' },
          ]}
          selected={form.air_travel_frequency}
          onToggle={v => set('air_travel_frequency', v)}
        />
        <p style={{ fontSize: 12, color: 'var(--text-hint)', marginTop: 4 }}>
          Second biggest factor — 18% importance in the model.
        </p>
      </Field>
    </div>,

    <div key="personal" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Field label="Sex">
        <ChipSelect
          options={[
            { value: 'male',   label: '👨 Male' },
            { value: 'female', label: '👩 Female' },
          ]}
          selected={form.sex}
          onToggle={v => set('sex', v)}
        />
      </Field>
      <Field label="Body type">
        <ChipSelect
          options={[
            { value: 'normal',      label: 'Normal' },
            { value: 'underweight', label: 'Underweight' },
            { value: 'overweight',  label: 'Overweight' },
            { value: 'obese',       label: 'Obese' },
          ]}
          selected={form.body_type}
          onToggle={v => set('body_type', v)}
        />
      </Field>
    </div>,

    <div key="lifestyle" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Field label="New clothes bought per month" hint="(items)">
        <NumberInput value={form.new_clothes_monthly}
          onChange={v => set('new_clothes_monthly', v)}
          min={0} max={100} placeholder="e.g. 3" />
      </Field>
      <Field label="Waste bags thrown per week" hint="(bags)">
        <NumberInput value={form.waste_bag_weekly_count}
          onChange={v => set('waste_bag_weekly_count', v)}
          min={0} max={20} placeholder="e.g. 2" />
      </Field>
      <div style={{
        padding: '1rem', borderRadius: 'var(--radius-md)',
        background: 'var(--green-50)', border: '1px solid var(--green-100)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-700)', marginBottom: 8, letterSpacing: '0.5px' }}>
          YOUR INPUTS
        </p>
        {[
          ['Driving',     `${form.vehicle_monthly_distance_km || 0} km/month`],
          ['Vehicle',     form.vehicle_type],
          ['Air travel',  form.air_travel_frequency],
          ['Sex',         form.sex],
          ['Body type',   form.body_type],
          ['New clothes', `${form.new_clothes_monthly || 0}/month`],
          ['Waste bags',  `${form.waste_bag_weekly_count || 0}/week`],
        ].map(([k, v]) => (
          <div key={k} style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 13, padding: '4px 0',
            borderBottom: '1px solid var(--green-100)',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>{k}</span>
            <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>,
  ]

  return (
    <div>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', padding: '5px 14px', borderRadius: 99,
          background: 'var(--green-100)', marginBottom: 14,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-700)', letterSpacing: '0.5px' }}>
            RANDOM FOREST · 10 FEATURES · SKLEARN
          </span>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.8px', marginBottom: 8 }}>
          What's your carbon footprint?
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 460, margin: '0 auto' }}>
          Answer 7 quick questions — our trained model predicts your annual CO₂ in kg.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{
              height: 5, borderRadius: 99,
              background: i <= step ? 'var(--green-600)' : 'var(--gray-100)',
              transition: 'background 0.3s',
            }} />
            <span style={{
              fontSize: 11, marginTop: 5, display: 'block',
              color: i === step ? 'var(--green-700)' : 'var(--text-hint)',
              fontWeight: i === step ? 600 : 400,
            }}>{s}</span>
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: '2rem',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)', marginBottom: '1rem',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '-0.3px' }}>
          {STEPS[step]}
        </h2>
        {stepContent[step]}
      </div>

      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          background: 'var(--red-50)', color: 'var(--red-600)', fontSize: 13,
          marginBottom: '1rem',
        }}>⚠️ {error}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
          style={{
            padding: '11px 24px', borderRadius: 'var(--radius-sm)', fontSize: 14,
            background: 'none', border: '1.5px solid var(--border)',
            color: step === 0 ? 'var(--gray-200)' : 'var(--text)',
            cursor: step === 0 ? 'default' : 'pointer',
          }}>← Back</button>

        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)}
            style={{
              padding: '11px 28px', borderRadius: 'var(--radius-sm)', fontSize: 14,
              fontWeight: 600, background: 'var(--green-700)',
              border: 'none', color: '#fff', cursor: 'pointer',
            }}>Next →</button>
        ) : (
          <button onClick={handleSubmit} disabled={loading}
            style={{
              padding: '11px 32px', borderRadius: 'var(--radius-sm)', fontSize: 14,
              fontWeight: 600,
              background: loading ? 'var(--green-400)' : 'var(--green-700)',
              border: 'none', color: '#fff', cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
            {loading ? 'Calculating...' : '🌿 Calculate Footprint'}
          </button>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

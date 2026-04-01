import { useState } from 'react'

const API_URL = 'http://127.0.0.1:5000/predict'

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 14, background: 'var(--surface)',
  color: 'var(--text)', outline: 'none',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  fontSize: 13, fontWeight: 500,
  color: 'var(--text-muted)', marginBottom: 6, display: 'block',
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: 'pointer' }}>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function NumberInput({ value, onChange, min = 0, max, step = 1, placeholder }) {
  return (
    <input type="number" value={value} onChange={e => onChange(e.target.value)}
      min={min} max={max} step={step} placeholder={placeholder}
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = 'var(--green-500)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
  )
}

function ChipSelect({ options, selected, onToggle, multi = false }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const active = multi ? selected.includes(o.value) : selected === o.value
        return (
          <button key={o.value} type="button" onClick={() => onToggle(o.value)}
            style={{
              padding: '7px 14px', borderRadius: 99, fontSize: 13, fontWeight: 500,
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

const STEPS = ['Transport', 'Lifestyle', 'Home & Energy', 'Review']

export default function PredictionForm({ onResult }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    vehicle_monthly_distance_km: '',
    vehicle_type: 'petrol',
    transport: 'private',
    air_travel_frequency: 'never',
    body_type: 'normal',
    sex: 'male',
    diet: 'omnivore',
    new_clothes_monthly: '',
    waste_bag_weekly_count: '',
    waste_bag_size: 'medium',
    social_activity: 'sometimes',
    internet_daily_hour: '',
    tv_pc_daily_hour: '',
    heating_energy_source: 'natural gas',
    energy_efficiency: 'Sometimes',
    recycling: [],
    cooking_with: [],
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const toggleMulti = (key, val) => {
    setForm(f => {
      const arr = f[key]
      return { ...f, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }
    })
  }

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
      setError(e.message || 'Could not reach the server. Is Flask running?')
    } finally {
      setLoading(false)
    }
  }

  const stepContent = [
    // Step 0 — Transport
    <div key="transport" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Field label="Monthly driving distance (km)">
        <NumberInput value={form.vehicle_monthly_distance_km}
          onChange={v => set('vehicle_monthly_distance_km', v)}
          min={0} max={10000} placeholder="e.g. 500" />
      </Field>
      <Field label="Vehicle type">
        <ChipSelect
          options={[
            { value: 'petrol', label: 'Petrol' },
            { value: 'diesel', label: 'Diesel' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'electric', label: 'Electric' },
            { value: 'lpg', label: 'LPG' },
          ]}
          selected={form.vehicle_type}
          onToggle={v => set('vehicle_type', v)}
        />
      </Field>
      <Field label="Primary mode of transport">
        <ChipSelect
          options={[
            { value: 'private', label: 'Private vehicle' },
            { value: 'public', label: 'Public transport' },
            { value: 'walk/bicycle', label: 'Walk / Bicycle' },
          ]}
          selected={form.transport}
          onToggle={v => set('transport', v)}
        />
      </Field>
      <Field label="Air travel frequency">
        <ChipSelect
          options={[
            { value: 'never', label: 'Never' },
            { value: 'rarely', label: 'Rarely' },
            { value: 'frequently', label: 'Frequently' },
            { value: 'very frequently', label: 'Very frequently' },
          ]}
          selected={form.air_travel_frequency}
          onToggle={v => set('air_travel_frequency', v)}
        />
      </Field>
    </div>,

    // Step 1 — Lifestyle
    <div key="lifestyle" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Field label="Sex">
        <ChipSelect
          options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]}
          selected={form.sex}
          onToggle={v => set('sex', v)}
        />
      </Field>
      <Field label="Body type">
        <ChipSelect
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'underweight', label: 'Underweight' },
            { value: 'overweight', label: 'Overweight' },
            { value: 'obese', label: 'Obese' },
          ]}
          selected={form.body_type}
          onToggle={v => set('body_type', v)}
        />
      </Field>
      <Field label="Diet type">
        <ChipSelect
          options={[
            { value: 'omnivore', label: 'Omnivore' },
            { value: 'pescatarian', label: 'Pescatarian' },
            { value: 'vegetarian', label: 'Vegetarian' },
            { value: 'vegan', label: 'Vegan' },
          ]}
          selected={form.diet}
          onToggle={v => set('diet', v)}
        />
      </Field>
      <Field label="New clothes bought per month">
        <NumberInput value={form.new_clothes_monthly}
          onChange={v => set('new_clothes_monthly', v)}
          min={0} max={100} placeholder="e.g. 3" />
      </Field>
      <Field label="Waste bags per week">
        <NumberInput value={form.waste_bag_weekly_count}
          onChange={v => set('waste_bag_weekly_count', v)}
          min={0} max={20} placeholder="e.g. 2" />
      </Field>
      <Field label="Waste bag size">
        <ChipSelect
          options={[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
            { value: 'extra large', label: 'Extra large' },
          ]}
          selected={form.waste_bag_size}
          onToggle={v => set('waste_bag_size', v)}
        />
      </Field>
      <Field label="Social activity">
        <ChipSelect
          options={[
            { value: 'never', label: 'Never' },
            { value: 'sometimes', label: 'Sometimes' },
            { value: 'often', label: 'Often' },
          ]}
          selected={form.social_activity}
          onToggle={v => set('social_activity', v)}
        />
      </Field>
      <Field label="Daily internet use (hours)">
        <NumberInput value={form.internet_daily_hour}
          onChange={v => set('internet_daily_hour', v)}
          min={0} max={24} step={0.5} placeholder="e.g. 4" />
      </Field>
      <Field label="Daily TV / PC use (hours)">
        <NumberInput value={form.tv_pc_daily_hour}
          onChange={v => set('tv_pc_daily_hour', v)}
          min={0} max={24} step={0.5} placeholder="e.g. 3" />
      </Field>
    </div>,

    // Step 2 — Home & Energy
    <div key="energy" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Field label="Heating energy source">
        <ChipSelect
          options={[
            { value: 'natural gas', label: 'Natural gas' },
            { value: 'electricity', label: 'Electricity' },
            { value: 'wood', label: 'Wood' },
            { value: 'coal', label: 'Coal' },
          ]}
          selected={form.heating_energy_source}
          onToggle={v => set('heating_energy_source', v)}
        />
      </Field>
      <Field label="Do you use energy-efficient appliances?">
        <ChipSelect
          options={[
            { value: 'Yes', label: 'Yes' },
            { value: 'Sometimes', label: 'Sometimes' },
            { value: 'No', label: 'No' },
          ]}
          selected={form.energy_efficiency}
          onToggle={v => set('energy_efficiency', v)}
        />
      </Field>
      <Field label="What do you recycle? (select all)">
        <ChipSelect
          options={[
            { value: 'Paper', label: 'Paper' },
            { value: 'Plastic', label: 'Plastic' },
            { value: 'Glass', label: 'Glass' },
            { value: 'Metal', label: 'Metal' },
          ]}
          selected={form.recycling}
          onToggle={v => toggleMulti('recycling', v)}
          multi
        />
      </Field>
      <Field label="How do you cook? (select all)">
        <ChipSelect
          options={[
            { value: 'stove', label: 'Stove' },
            { value: 'oven', label: 'Oven' },
            { value: 'microwave', label: 'Microwave' },
            { value: 'grill', label: 'Grill' },
            { value: 'airfryer', label: 'Air fryer' },
          ]}
          selected={form.cooking_with}
          onToggle={v => toggleMulti('cooking_with', v)}
          multi
        />
      </Field>
    </div>,

    // Step 3 — Review
    <div key="review" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Review your inputs before calculating your carbon footprint.
      </p>
      {[
        ['Monthly driving', `${form.vehicle_monthly_distance_km || 0} km`],
        ['Vehicle', form.vehicle_type],
        ['Transport mode', form.transport],
        ['Air travel', form.air_travel_frequency],
        ['Diet', form.diet],
        ['New clothes/month', form.new_clothes_monthly || 0],
        ['Waste bags/week', form.waste_bag_weekly_count || 0],
        ['Heating source', form.heating_energy_source],
        ['Energy efficient', form.energy_efficiency],
        ['Recycling', form.recycling.join(', ') || 'None'],
        ['Cooking methods', form.cooking_with.join(', ') || 'Not specified'],
      ].map(([k, v]) => (
        <div key={k} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 12px', background: 'var(--gray-50)',
          borderRadius: 'var(--radius-sm)', fontSize: 13,
        }}>
          <span style={{ color: 'var(--text-muted)' }}>{k}</span>
          <span style={{ fontWeight: 500, color: 'var(--text)', textTransform: 'capitalize' }}>{String(v)}</span>
        </div>
      ))}
    </div>,
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 8 }}>
          Calculate Your Carbon Footprint
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Answer a few questions — our AI model will estimate your annual CO₂ emissions.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '2rem' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{
              height: 4, borderRadius: 99,
              background: i <= step ? 'var(--green-600)' : 'var(--gray-100)',
              transition: 'background 0.3s',
            }} />
            <span style={{
              fontSize: 11, color: i === step ? 'var(--green-700)' : 'var(--text-hint)',
              fontWeight: i === step ? 600 : 400, display: 'block', marginTop: 5,
            }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: '2rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text)' }}>
          {STEPS[step]}
        </h2>
        {stepContent[step]}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          background: 'var(--red-50)', color: 'var(--red-600)', fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          style={{
            padding: '10px 22px', borderRadius: 'var(--radius-sm)', fontSize: 14,
            background: 'none', border: '1.5px solid var(--border)',
            color: step === 0 ? 'var(--gray-200)' : 'var(--text)',
            cursor: step === 0 ? 'default' : 'pointer',
          }}
        >
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            style={{
              padding: '10px 28px', borderRadius: 'var(--radius-sm)', fontSize: 14,
              fontWeight: 500,
              background: 'var(--green-700)', border: 'none', color: '#fff',
              cursor: 'pointer',
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '10px 28px', borderRadius: 'var(--radius-sm)', fontSize: 14,
              fontWeight: 600,
              background: loading ? 'var(--green-400)' : 'var(--green-700)',
              border: 'none', color: '#fff', cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Calculating...' : 'Calculate Footprint'}
          </button>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'

const API_URL = 'http://127.0.0.1:5000/predict'

function Chip({ options, selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const active = selected === o.value
        return (
          <button key={o.value} type="button" onClick={() => onToggle(o.value)} style={{
            padding: '9px 18px', borderRadius: 99, fontSize: 13, fontWeight: 500,
            border: active ? '1px solid var(--green)' : '1px solid var(--border2)',
            background: active ? 'var(--green-bg)' : 'transparent',
            color: active ? 'var(--green)' : 'var(--text2)',
            cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: 'var(--font-body)',
          }}>{o.label}</button>
        )
      })}
    </div>
  )
}

function MultiChip({ options, selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => {
        const active = selected.includes(o.value)
        return (
          <button key={o.value} type="button" onClick={() => onToggle(o.value)} style={{
            padding: '9px 18px', borderRadius: 99, fontSize: 13, fontWeight: 500,
            border: active ? '1px solid var(--green)' : '1px solid var(--border2)',
            background: active ? 'var(--green-bg)' : 'transparent',
            color: active ? 'var(--green)' : 'var(--text2)',
            cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: 'var(--font-body)',
          }}>{o.label}</button>
        )
      })}
    </div>
  )
}

function Num({ value, onChange, placeholder, min = 0, max, step = 1 }) {
  return (
    <input type="number" value={value} onChange={e => onChange(e.target.value)}
      min={min} max={max} step={step} placeholder={placeholder}
      style={{
        width: '100%', padding: '12px 16px',
        background: 'var(--surface2)', border: '1px solid var(--border2)',
        borderRadius: 'var(--r-sm)', fontSize: 15,
        color: 'var(--text)', outline: 'none',
        fontFamily: 'var(--font-mono)', transition: 'border-color 0.15s',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--green-dim)'}
      onBlur={e => e.target.style.borderColor = 'var(--border2)'}
    />
  )
}

function Label({ children, mono }) {
  return (
    <p style={{
      fontSize: 11, color: 'var(--text3)', letterSpacing: '0.5px',
      marginBottom: 10, fontFamily: 'var(--font-mono)', fontWeight: 500,
    }}>{children}</p>
  )
}

// RF has 3 steps, LR has 5 steps (more features)
const RF_STEPS = ['Vehicle & Travel', 'Personal', 'Habits']
const LR_STEPS = ['Vehicle & Travel', 'Personal', 'Home & Energy', 'Lifestyle', 'Review']

export default function PredictionForm({ onResult, modelType }) {
  const isLR    = modelType === 'lr'
  const STEPS   = isLR ? LR_STEPS : RF_STEPS

  const [step,    setStep]   = useState(0)
  const [loading, setLoad]   = useState(false)
  const [error,   setError]  = useState('')

  const [form, setForm] = useState({
    // shared — RF + LR
    vehicle_monthly_distance_km: '',
    air_travel_frequency: 'never',
    vehicle_type: 'petrol',
    new_clothes_monthly: '',
    waste_bag_weekly_count: '',
    sex: 'male',
    body_type: 'normal',
    // LR-only extras
    transport: 'public',
    waste_bag_size: 'medium',
    internet_daily_hour: '',
    tv_pc_daily_hour: '',
    heating_energy_source: 'natural gas',
    energy_efficiency: 'Sometimes',
    recycling: [],
    cooking_with: [],
  })

  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const tog  = (k, v) => setForm(f => {
    const arr = f[k]
    return { ...f, [k]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] }
  })

  // Reset to step 0 when modelType changes (parent already resets, but guard here too)
  useState(() => { setStep(0) }, [modelType])

  const handleSubmit = async () => {
    setLoad(true); setError('')
    try {
      const payload = { ...form, model_type: modelType }
      const res  = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      onResult(data, form)
    } catch (e) {
      setError(e.message || 'Cannot reach Flask. Run: python app.py')
    } finally { setLoad(false) }
  }

  // ── Step content ────────────────────────────────────────────────────────────
  const sharedStep0 = (
    <div key="travel" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Label>KM / MONTH — 37% MODEL IMPORTANCE</Label>
        <Num value={form.vehicle_monthly_distance_km} onChange={v => set('vehicle_monthly_distance_km', v)} placeholder="e.g. 500" max={10000} />
      </div>
      <div>
        <Label>VEHICLE TYPE</Label>
        <Chip options={[
          { value: 'petrol', label: '⛽ Petrol' }, { value: 'diesel', label: '🛢️ Diesel' },
          { value: 'hybrid', label: '🔋 Hybrid' }, { value: 'electric', label: '⚡ Electric' },
          { value: 'lpg', label: '🔵 LPG' },
        ]} selected={form.vehicle_type} onToggle={v => set('vehicle_type', v)} />
      </div>
      {isLR && (
        <div>
          <Label>TRANSPORT MODE</Label>
          <Chip options={[
            { value: 'private', label: '🚗 Private' },
            { value: 'public', label: '🚌 Public' },
            { value: 'walk/bicycle', label: '🚶 Walk / Bike' },
          ]} selected={form.transport} onToggle={v => set('transport', v)} />
        </div>
      )}
      <div>
        <Label>AIR TRAVEL — 18% MODEL IMPORTANCE</Label>
        <Chip options={[
          { value: 'never', label: '🚫 Never' }, { value: 'rarely', label: '✈️ Rarely' },
          { value: 'frequently', label: '✈️✈️ Frequently' }, { value: 'very frequently', label: '✈️✈️✈️ Very Frequently' },
        ]} selected={form.air_travel_frequency} onToggle={v => set('air_travel_frequency', v)} />
      </div>
    </div>
  )

  const sharedStep1 = (
    <div key="personal" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Label>SEX</Label>
        <Chip options={[{ value: 'male', label: '👨 Male' }, { value: 'female', label: '👩 Female' }]}
          selected={form.sex} onToggle={v => set('sex', v)} />
      </div>
      <div>
        <Label>BODY TYPE</Label>
        <Chip options={[
          { value: 'normal', label: 'Normal' }, { value: 'underweight', label: 'Underweight' },
          { value: 'overweight', label: 'Overweight' }, { value: 'obese', label: 'Obese' },
        ]} selected={form.body_type} onToggle={v => set('body_type', v)} />
      </div>
    </div>
  )

  // RF habits (step 2 for RF)
  const rfHabits = (
    <div key="rf-habits" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Label>NEW CLOTHES / MONTH</Label>
        <Num value={form.new_clothes_monthly} onChange={v => set('new_clothes_monthly', v)} placeholder="e.g. 3" max={100} />
      </div>
      <div>
        <Label>WASTE BAGS / WEEK</Label>
        <Num value={form.waste_bag_weekly_count} onChange={v => set('waste_bag_weekly_count', v)} placeholder="e.g. 2" max={20} />
      </div>
      {/* RF review summary */}
      <div style={{ background: 'var(--surface2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', padding: '1.25rem' }}>
        <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '1px', marginBottom: 10 }}>READY TO CALCULATE</p>
        {[
          ['Monthly km', form.vehicle_monthly_distance_km || '0'],
          ['Vehicle', form.vehicle_type], ['Air travel', form.air_travel_frequency],
          ['Sex', form.sex], ['Body type', form.body_type],
          ['New clothes', `${form.new_clothes_monthly || 0}/month`],
          ['Waste bags', `${form.waste_bag_weekly_count || 0}/week`],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <span style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{k.toUpperCase()}</span>
            <span style={{ color: 'var(--text)', fontWeight: 500, textTransform: 'capitalize' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )

  // LR step 2 — Home & Energy
  const lrEnergy = (
    <div key="lr-energy" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Label>HEATING ENERGY SOURCE</Label>
        <Chip options={[
          { value: 'natural gas', label: '🔥 Natural Gas' }, { value: 'electricity', label: '⚡ Electricity' },
          { value: 'wood', label: '🪵 Wood' }, { value: 'coal', label: '⬛ Coal' },
        ]} selected={form.heating_energy_source} onToggle={v => set('heating_energy_source', v)} />
      </div>
      <div>
        <Label>ENERGY-EFFICIENT APPLIANCES?</Label>
        <Chip options={[{ value: 'Yes', label: '✅ Yes' }, { value: 'Sometimes', label: '🔄 Sometimes' }, { value: 'No', label: '❌ No' }]}
          selected={form.energy_efficiency} onToggle={v => set('energy_efficiency', v)} />
      </div>
      <div>
        <Label>WHAT DO YOU RECYCLE? (SELECT ALL)</Label>
        <MultiChip options={[
          { value: 'Paper', label: '📄 Paper' }, { value: 'Plastic', label: '♳ Plastic' },
          { value: 'Glass', label: '🫙 Glass' }, { value: 'Metal', label: '🥫 Metal' },
        ]} selected={form.recycling} onToggle={v => tog('recycling', v)} />
      </div>
      <div>
        <Label>COOKING METHODS (SELECT ALL)</Label>
        <MultiChip options={[
          { value: 'stove', label: '🍳 Stove' }, { value: 'oven', label: '🏮 Oven' },
          { value: 'microwave', label: '📡 Microwave' }, { value: 'grill', label: '🔥 Grill' },
          { value: 'airfryer', label: '💨 Air Fryer' },
        ]} selected={form.cooking_with} onToggle={v => tog('cooking_with', v)} />
      </div>
    </div>
  )

  // LR step 3 — Lifestyle
  const lrLifestyle = (
    <div key="lr-lifestyle" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <Label>NEW CLOTHES / MONTH</Label>
        <Num value={form.new_clothes_monthly} onChange={v => set('new_clothes_monthly', v)} placeholder="e.g. 3" max={100} />
      </div>
      <div>
        <Label>WASTE BAGS / WEEK</Label>
        <Num value={form.waste_bag_weekly_count} onChange={v => set('waste_bag_weekly_count', v)} placeholder="e.g. 2" max={20} />
      </div>
      <div>
        <Label>WASTE BAG SIZE</Label>
        <Chip options={[
          { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }, { value: 'extra large', label: 'Extra Large' },
        ]} selected={form.waste_bag_size} onToggle={v => set('waste_bag_size', v)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <Label>INTERNET USE (HRS/DAY)</Label>
          <Num value={form.internet_daily_hour} onChange={v => set('internet_daily_hour', v)} placeholder="e.g. 4" max={24} step={0.5} />
        </div>
        <div>
          <Label>TV / PC USE (HRS/DAY)</Label>
          <Num value={form.tv_pc_daily_hour} onChange={v => set('tv_pc_daily_hour', v)} placeholder="e.g. 3" max={24} step={0.5} />
        </div>
      </div>
    </div>
  )

  // LR step 4 — Review
  const lrReview = (
    <div key="lr-review" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--surface2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', padding: '1.25rem' }}>
        <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--blue)', letterSpacing: '1px', marginBottom: 12 }}>LINEAR REGRESSION — ALL INPUTS</p>
        {[
          ['Monthly km',   form.vehicle_monthly_distance_km || '0'],
          ['Vehicle',      form.vehicle_type],
          ['Transport',    form.transport],
          ['Air travel',   form.air_travel_frequency],
          ['Sex',          form.sex],
          ['Body type',    form.body_type],
          ['Heating',      form.heating_energy_source],
          ['Efficiency',   form.energy_efficiency],
          ['Recycling',    form.recycling.join(', ') || 'None'],
          ['Cooking',      form.cooking_with.join(', ') || 'None'],
          ['New clothes',  `${form.new_clothes_monthly || 0}/month`],
          ['Waste bags',   `${form.waste_bag_weekly_count || 0}/week`],
          ['Waste size',   form.waste_bag_size],
          ['Internet',     `${form.internet_daily_hour || 0}h/day`],
          ['TV / PC',      `${form.tv_pc_daily_hour || 0}h/day`],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <span style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{k.toUpperCase()}</span>
            <span style={{ color: 'var(--text)', fontWeight: 500, textTransform: 'capitalize' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const rfPages = [sharedStep0, sharedStep1, rfHabits]
  const lrPages = [sharedStep0, sharedStep1, lrEnergy, lrLifestyle, lrReview]
  const pages   = isLR ? lrPages : rfPages

  const modelColor = isLR ? 'var(--blue)' : 'var(--green)'
  const modelBg    = isLR ? 'rgba(96,165,250,0.08)' : 'var(--green-bg)'
  const modelBdr   = isLR ? 'rgba(96,165,250,0.25)' : 'rgba(74,222,128,0.25)'
  const modelLabel = isLR ? 'LINEAR REGRESSION · SKLEARN · STANDARDSCALER' : 'RANDOM FOREST · SKLEARN · 10 FEATURES'

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '0.5rem' }} className="fade-up">
        <div style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: 99,
          border: `1px solid ${modelBdr}`, background: modelBg,
          fontSize: 11, fontFamily: 'var(--font-mono)', color: modelColor,
          letterSpacing: '1px', marginBottom: 20, transition: 'all 0.3s',
        }}>{modelLabel}</div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3rem)',
          fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1,
          color: 'var(--text)', marginBottom: 14,
        }}>
          Measure your<br />
          <span style={{ color: modelColor, transition: 'color 0.3s' }}>carbon footprint.</span>
        </h1>

        <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.7, maxWidth: 420, margin: '0 auto' }}>
          {isLR
            ? `${LR_STEPS.length - 1} steps · broader feature set · linear model`
            : '3 steps · 7 questions · tree-based model'}
        </p>
      </div>

      {/* Model indicator banner */}
      <div className="fade-up-1" style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
        borderRadius: 'var(--r-md)', border: `1px solid ${modelBdr}`,
        background: modelBg, marginBottom: '1.5rem', transition: 'all 0.3s',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: modelColor, boxShadow: `0 0 8px ${modelColor}`, flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: 'var(--text2)', flex: 1 }}>
          Using <span style={{ color: modelColor, fontWeight: 600 }}>{isLR ? 'Linear Regression' : 'Random Forest'}</span>
          {isLR ? ' — uses StandardScaler + more features for linear predictions' : ' — uses tree ensembles, no scaling needed'}
        </p>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
          Switch in navbar →
        </span>
      </div>

      {/* Step tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: 4 }} className="fade-up-1">
        {STEPS.map((s, i) => (
          <button key={s} style={{
            flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', fontSize: 12,
            fontWeight: i === step ? 600 : 400,
            background: i === step ? 'var(--surface2)' : 'transparent',
            color: i === step ? modelColor : i < step ? 'var(--text2)' : 'var(--text3)',
            cursor: 'default', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            {i < step && <span style={{ color: modelColor, fontSize: 10 }}>✓</span>}
            {s}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'var(--surface)', borderRadius: 99, marginBottom: '1.5rem', overflow: 'hidden' }} className="fade-up-1">
        <div style={{ height: '100%', width: `${((step + 1) / STEPS.length) * 100}%`, background: modelColor, borderRadius: 99, transition: 'width 0.4s ease, background 0.3s' }} />
      </div>

      {/* Form card */}
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border)', padding: '2rem',
        boxShadow: '0 0 60px rgba(0,0,0,0.4)',
        transition: 'border-color 0.3s',
      }} className="fade-up-2">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.3px', color: 'var(--text)' }}>
          {STEPS[step]}
        </h2>
        {pages[step]}
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 'var(--r-sm)', background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--red)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
          ⚠ {error}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', gap: 12 }} className="fade-up-3">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0} style={{
          padding: '12px 24px', borderRadius: 'var(--r-sm)', fontSize: 14, fontWeight: 500,
          background: 'transparent', border: '1px solid var(--border2)',
          color: step === 0 ? 'var(--text3)' : 'var(--text2)',
          cursor: step === 0 ? 'default' : 'pointer',
        }}>← Back</button>

        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} style={{
            flex: 1, padding: '12px 28px', borderRadius: 'var(--r-sm)', fontSize: 14, fontWeight: 700,
            background: modelColor, border: 'none', color: '#0a0f0a', cursor: 'pointer',
            fontFamily: 'var(--font-display)', transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => e.target.style.opacity = 0.88}
            onMouseLeave={e => e.target.style.opacity = 1}>
            Continue →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} style={{
            flex: 1, padding: '12px 28px', borderRadius: 'var(--r-sm)', fontSize: 14, fontWeight: 700,
            background: loading ? 'var(--surface2)' : modelColor,
            border: 'none', color: loading ? modelColor : '#0a0f0a',
            cursor: loading ? 'default' : 'pointer',
            fontFamily: 'var(--font-display)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: loading ? 'none' : `0 0 24px ${modelColor}55`,
          }}>
            {loading
              ? <><span style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${modelColor}44`, borderTopColor: modelColor, display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Calculating...</>
              : `🌿 Calculate with ${isLR ? 'Linear Regression' : 'Random Forest'}`}
          </button>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

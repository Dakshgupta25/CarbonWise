import { useState } from 'react'

const API_URL = 'http://127.0.0.1:5000/predict'

function ChipSelect({ options, selected, onToggle }) {
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

function NumInput({ value, onChange, placeholder, min=0, max, step=1 }) {
  return (
    <input type="number" value={value} onChange={e => onChange(e.target.value)}
      min={min} max={max} step={step} placeholder={placeholder}
      style={{
        width: '100%', padding: '12px 16px',
        background: 'var(--surface2)', border: '1px solid var(--border2)',
        borderRadius: 'var(--r-sm)', fontSize: 15,
        color: 'var(--text)', outline: 'none',
        fontFamily: 'var(--font-mono)',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--green-dim)'}
      onBlur={e => e.target.style.borderColor = 'var(--border2)'}
    />
  )
}

function SectionLabel({ children, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>{children}</p>
      {sub && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

const STEPS = [
  { key: 'travel',   label: 'Travel',   icon: '🚗' },
  { key: 'personal', label: 'Personal', icon: '👤' },
  { key: 'habits',   label: 'Habits',   icon: '♻️'  },
]

export default function PredictionForm({ onResult }) {
  const [step, setStep]     = useState(0)
  const [loading, setLoad]  = useState(false)
  const [error, setError]   = useState('')

  const [form, setForm] = useState({
    vehicle_monthly_distance_km: '',
    air_travel_frequency: 'never',
    vehicle_type: 'petrol',
    new_clothes_monthly: '',
    waste_bag_weekly_count: '',
    sex: 'male',
    body_type: 'normal',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setLoad(true); setError('')
    try {
      const res  = await fetch(API_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      onResult(data, form)
    } catch(e) {
      setError(e.message || 'Cannot reach Flask server. Run: python app.py')
    } finally { setLoad(false) }
  }

  const pages = [
    /* Step 0 — Travel */
    <div key="travel" style={{ display:'flex', flexDirection:'column', gap:28 }}>
      <SectionLabel sub="The biggest driver of your footprint — 37% of model importance">How much do you drive?</SectionLabel>
      <div>
        <p style={{ fontSize:12, color:'var(--text3)', fontFamily:'var(--font-mono)', marginBottom:8, letterSpacing:'0.5px' }}>KM / MONTH</p>
        <NumInput value={form.vehicle_monthly_distance_km} onChange={v => set('vehicle_monthly_distance_km', v)} placeholder="e.g. 500" max={10000} />
      </div>
      <div>
        <p style={{ fontSize:12, color:'var(--text3)', fontFamily:'var(--font-mono)', marginBottom:10, letterSpacing:'0.5px' }}>VEHICLE TYPE</p>
        <ChipSelect options={[
          {value:'petrol',   label:'⛽ Petrol'},
          {value:'diesel',   label:'🛢️ Diesel'},
          {value:'hybrid',   label:'🔋 Hybrid'},
          {value:'electric', label:'⚡ Electric'},
          {value:'lpg',      label:'🔵 LPG'},
        ]} selected={form.vehicle_type} onToggle={v => set('vehicle_type', v)} />
      </div>
      <div>
        <p style={{ fontSize:12, color:'var(--text3)', fontFamily:'var(--font-mono)', marginBottom:10, letterSpacing:'0.5px' }}>AIR TRAVEL — 18% MODEL IMPORTANCE</p>
        <ChipSelect options={[
          {value:'never',           label:'🚫 Never'},
          {value:'rarely',          label:'✈️ Rarely'},
          {value:'frequently',      label:'✈️✈️ Frequently'},
          {value:'very frequently', label:'✈️✈️✈️ Very Frequently'},
        ]} selected={form.air_travel_frequency} onToggle={v => set('air_travel_frequency', v)} />
      </div>
    </div>,

    /* Step 1 — Personal */
    <div key="personal" style={{ display:'flex', flexDirection:'column', gap:28 }}>
      <SectionLabel sub="Demographic factors used by the Random Forest model">Tell us about yourself</SectionLabel>
      <div>
        <p style={{ fontSize:12, color:'var(--text3)', fontFamily:'var(--font-mono)', marginBottom:10, letterSpacing:'0.5px' }}>SEX</p>
        <ChipSelect options={[{value:'male',label:'👨 Male'},{value:'female',label:'👩 Female'}]}
          selected={form.sex} onToggle={v => set('sex', v)} />
      </div>
      <div>
        <p style={{ fontSize:12, color:'var(--text3)', fontFamily:'var(--font-mono)', marginBottom:10, letterSpacing:'0.5px' }}>BODY TYPE</p>
        <ChipSelect options={[
          {value:'normal',      label:'Normal'},
          {value:'underweight', label:'Underweight'},
          {value:'overweight',  label:'Overweight'},
          {value:'obese',       label:'Obese'},
        ]} selected={form.body_type} onToggle={v => set('body_type', v)} />
      </div>
    </div>,

    /* Step 2 — Habits */
    <div key="habits" style={{ display:'flex', flexDirection:'column', gap:28 }}>
      <SectionLabel sub="Consumption habits that influence your footprint">Your lifestyle habits</SectionLabel>
      <div>
        <p style={{ fontSize:12, color:'var(--text3)', fontFamily:'var(--font-mono)', marginBottom:8, letterSpacing:'0.5px' }}>NEW CLOTHES / MONTH</p>
        <NumInput value={form.new_clothes_monthly} onChange={v => set('new_clothes_monthly', v)} placeholder="e.g. 3" max={100} />
      </div>
      <div>
        <p style={{ fontSize:12, color:'var(--text3)', fontFamily:'var(--font-mono)', marginBottom:8, letterSpacing:'0.5px' }}>WASTE BAGS / WEEK</p>
        <NumInput value={form.waste_bag_weekly_count} onChange={v => set('waste_bag_weekly_count', v)} placeholder="e.g. 2" max={20} />
      </div>

      {/* Summary card */}
      <div style={{
        background:'var(--surface2)', borderRadius:'var(--r-md)',
        border:'1px solid var(--border)', padding:'1.25rem',
        marginTop:4,
      }}>
        <p style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--green)', letterSpacing:'1px', marginBottom:12 }}>READY TO CALCULATE</p>
        {[
          ['Monthly km',   form.vehicle_monthly_distance_km || '0'],
          ['Vehicle',      form.vehicle_type],
          ['Air travel',   form.air_travel_frequency],
          ['Sex',          form.sex],
          ['Body type',    form.body_type],
          ['New clothes',  `${form.new_clothes_monthly||0}/month`],
          ['Waste bags',   `${form.waste_bag_weekly_count||0}/week`],
        ].map(([k,v]) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
            <span style={{ color:'var(--text3)', fontFamily:'var(--font-mono)', fontSize:11 }}>{k.toUpperCase()}</span>
            <span style={{ color:'var(--text)', fontWeight:500, textTransform:'capitalize' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>,
  ]

  return (
    <div style={{ maxWidth:620, margin:'0 auto' }}>
      {/* Hero */}
      <div style={{ textAlign:'center', marginBottom:'3rem', paddingTop:'1rem' }} className="fade-up">
        <div style={{
          display:'inline-block', padding:'6px 16px', borderRadius:99,
          border:'1px solid rgba(74,222,128,0.3)', background:'var(--green-bg)',
          fontSize:11, fontFamily:'var(--font-mono)', color:'var(--green)',
          letterSpacing:'1px', marginBottom:20,
        }}>RANDOM FOREST · SKLEARN · 10 FEATURES</div>
        <h1 style={{
          fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3.2rem)',
          fontWeight:800, letterSpacing:'-1.5px', lineHeight:1.1,
          color:'var(--text)', marginBottom:16,
        }}>
          Measure your<br/>
          <span style={{ color:'var(--green)' }}>carbon footprint.</span>
        </h1>
        <p style={{ color:'var(--text2)', fontSize:16, lineHeight:1.7, maxWidth:420, margin:'0 auto' }}>
          7 questions. AI-powered prediction. See exactly where your emissions come from.
        </p>
      </div>

      {/* Step tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:'2rem', background:'var(--surface)', borderRadius:'var(--r-md)', padding:4 }} className="fade-up-1">
        {STEPS.map((s, i) => (
          <button key={s.key} onClick={() => i < step || i === step ? null : null}
            style={{
              flex:1, padding:'10px 0', borderRadius:10, border:'none', fontSize:13,
              fontWeight: i === step ? 600 : 400,
              background: i === step ? 'var(--surface2)' : 'transparent',
              color: i === step ? 'var(--green)' : i < step ? 'var(--text2)' : 'var(--text3)',
              cursor:'default', transition:'all 0.2s',
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            }}>
            <span>{s.icon}</span> {s.label}
            {i < step && <span style={{ color:'var(--green)', fontSize:10 }}>✓</span>}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height:2, background:'var(--surface)', borderRadius:99, marginBottom:'2rem', overflow:'hidden' }} className="fade-up-1">
        <div style={{ height:'100%', width:`${((step+1)/STEPS.length)*100}%`, background:'var(--green)', borderRadius:99, transition:'width 0.4s ease' }} />
      </div>

      {/* Form card */}
      <div style={{
        background:'var(--surface)', borderRadius:'var(--r-lg)',
        border:'1px solid var(--border)', padding:'2rem',
        boxShadow:'0 0 60px rgba(0,0,0,0.4)',
      }} className="fade-up-2">
        {pages[step]}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop:12, padding:'12px 16px', borderRadius:'var(--r-sm)',
          background:'var(--red-bg)', border:'1px solid rgba(248,113,113,0.2)',
          color:'var(--red)', fontSize:13, fontFamily:'var(--font-mono)',
        }}>⚠ {error}</div>
      )}

      {/* Navigation */}
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:'1.25rem', gap:12 }} className="fade-up-3">
        <button onClick={() => setStep(s => s-1)} disabled={step===0} style={{
          padding:'12px 24px', borderRadius:'var(--r-sm)', fontSize:14, fontWeight:500,
          background:'transparent', border:'1px solid var(--border2)',
          color: step===0 ? 'var(--text3)' : 'var(--text2)',
          cursor: step===0 ? 'default' : 'pointer',
        }}>← Back</button>

        {step < STEPS.length-1 ? (
          <button onClick={() => setStep(s => s+1)} style={{
            flex:1, padding:'12px 28px', borderRadius:'var(--r-sm)', fontSize:14, fontWeight:600,
            background:'var(--green)', border:'none', color:'#0a0f0a', cursor:'pointer',
            fontFamily:'var(--font-display)',
            transition:'opacity 0.15s',
          }} onMouseEnter={e=>e.target.style.opacity=0.88} onMouseLeave={e=>e.target.style.opacity=1}>
            Continue →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} style={{
            flex:1, padding:'12px 28px', borderRadius:'var(--r-sm)', fontSize:14, fontWeight:700,
            background: loading ? 'var(--green-dark)' : 'var(--green)',
            border:'none', color:'#0a0f0a', cursor: loading ? 'default' : 'pointer',
            fontFamily:'var(--font-display)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            boxShadow: loading ? 'none' : '0 0 24px rgba(74,222,128,0.4)',
            animation: loading ? 'none' : 'glow 2s ease infinite',
          }}>
            {loading ? <><span style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(0,0,0,0.3)', borderTopColor:'#0a0f0a', display:'inline-block', animation:'spin 0.7s linear infinite' }} /> Calculating...</> : '🌿 Calculate My Footprint'}
          </button>
        )}
      </div>
    </div>
  )
}

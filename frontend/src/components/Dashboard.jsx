import { useEffect, useRef } from 'react'

const GLOBAL_AVG_KG = 4800   // global average ~4.8 tonnes = 4800 kg
const INDIA_AVG_KG  = 1900   // India average ~1.9 tonnes

const CATEGORY_META = {
  transport:  { label: 'Transport',    color: '#3B6D11', icon: '🚗' },
  air_travel: { label: 'Air Travel',   color: '#639922', icon: '✈️' },
  energy:     { label: 'Home Energy',  color: '#0F6E56', icon: '🏠' },
  shopping:   { label: 'Shopping',     color: '#1D9E75', icon: '🛍️' },
  waste:      { label: 'Waste',        color: '#97C459', icon: '♻️' },
}

function getRating(kg) {
  if (kg < 2000) return { label: 'Low',    color: 'var(--teal-600)',  bg: 'var(--teal-50)',  score: 1 }
  if (kg < 4000) return { label: 'Below Average', color: '#639922', bg: 'var(--green-50)', score: 2 }
  if (kg < 6000) return { label: 'Average', color: 'var(--amber-600)', bg: 'var(--amber-50)', score: 3 }
  if (kg < 9000) return { label: 'High',   color: '#BA7517',          bg: 'var(--amber-50)', score: 4 }
  return           { label: 'Very High', color: 'var(--red-600)',    bg: 'var(--red-50)',   score: 5 }
}

function getTips(formData, breakdown) {
  const tips = []
  if (!formData) return tips

  const km = parseFloat(formData.vehicle_monthly_distance_km || 0)
  const air = formData.air_travel_frequency

  if (km > 500) tips.push({ icon: '🚲', text: 'Replace 2 car trips/week with cycling or public transport', save: `~${Math.round(km * 0.0002 * 12 * 100) / 100} kg CO₂/year` })
  if (air === 'very frequently' || air === 'frequently') tips.push({ icon: '✈️', text: 'Replace one long-haul flight with train travel', save: '~500–2000 kg CO₂/year' })
  if (formData.diet === 'omnivore') tips.push({ icon: '🥦', text: 'Reducing red meat to 3 meals/week cuts food emissions significantly', save: '~500 kg CO₂/year' })
  if (!formData.recycling || formData.recycling.length < 2) tips.push({ icon: '♻️', text: 'Start recycling paper, plastic, and glass consistently', save: '~100–200 kg CO₂/year' })
  if (formData.energy_efficiency === 'No') tips.push({ icon: '💡', text: 'Switch to LED bulbs and energy-efficient appliances', save: '~300 kg CO₂/year' })
  if (formData.heating_energy_source === 'coal') tips.push({ icon: '🔥', text: 'Switch from coal to natural gas or electric heating', save: '~800 kg CO₂/year' })
  if (parseFloat(formData.new_clothes_monthly || 0) > 5) tips.push({ icon: '👕', text: 'Buy second-hand or reduce new clothing purchases', save: '~200 kg CO₂/year' })

  return tips.slice(0, 4)
}

export default function Dashboard({ result, formData, onBack }) {
  const donutRef = useRef(null)
  const barRef   = useRef(null)
  const donutChart = useRef(null)
  const barChart   = useRef(null)

  const kg = result.prediction
  const tonnes = (kg / 1000).toFixed(2)
  const rating = getRating(kg)
  const breakdown = result.breakdown
  const tips = getTips(formData, breakdown)

  const breakdownEntries = Object.entries(breakdown).filter(([k]) => CATEGORY_META[k])
  const donutLabels  = breakdownEntries.map(([k]) => CATEGORY_META[k].label)
  const donutData    = breakdownEntries.map(([, v]) => v)
  const donutColors  = breakdownEntries.map(([k]) => CATEGORY_META[k].color)

  useEffect(() => {
    let chartJs
    const load = async () => {
      // Dynamically import chart.js from CDN
      if (!window.Chart) {
        await new Promise((resolve) => {
          const s = document.createElement('script')
          s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'
          s.onload = resolve
          document.head.appendChild(s)
        })
      }
      chartJs = window.Chart

      // Donut chart
      if (donutRef.current) {
        if (donutChart.current) donutChart.current.destroy()
        donutChart.current = new chartJs(donutRef.current, {
          type: 'doughnut',
          data: {
            labels: donutLabels,
            datasets: [{ data: donutData, backgroundColor: donutColors, borderWidth: 0, hoverOffset: 6 }],
          },
          options: {
            responsive: true, maintainAspectRatio: true, cutout: '70%',
            plugins: { legend: { display: false }, tooltip: {
              callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(0)} kg` }
            }},
          },
        })
      }

      // Bar comparison chart
      if (barRef.current) {
        if (barChart.current) barChart.current.destroy()
        barChart.current = new chartJs(barRef.current, {
          type: 'bar',
          data: {
            labels: ['You', 'India avg', 'Global avg'],
            datasets: [{
              data: [kg, INDIA_AVG_KG, GLOBAL_AVG_KG],
              backgroundColor: [
                kg > GLOBAL_AVG_KG ? '#E24B4A' : kg > INDIA_AVG_KG ? '#EF9F27' : '#3B6D11',
                '#97C459', '#5DCAA5',
              ],
              borderRadius: 8, borderSkipped: false,
            }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: {
              callbacks: { label: ctx => ` ${ctx.parsed.y.toFixed(0)} kg CO₂/year` }
            }},
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 12 }, color: '#888780' } },
              y: {
                grid: { color: 'rgba(136,135,128,0.15)' },
                ticks: { font: { size: 11 }, color: '#888780', callback: v => v + ' kg' },
              },
            },
          },
        })
      }
    }
    load()
    return () => {
      donutChart.current?.destroy()
      barChart.current?.destroy()
    }
  }, [])

  const pct = Math.min(100, Math.round((kg / 10000) * 100))

  return (
    <div>
      {/* Back button */}
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', color: 'var(--text-muted)',
        fontSize: 14, cursor: 'pointer', marginBottom: '1.5rem', padding: 0,
      }}>
        ← Recalculate
      </button>

      {/* Hero result */}
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        padding: '2rem', marginBottom: '1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 20,
        boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
      }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6 }}>
            YOUR ANNUAL CARBON FOOTPRINT
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 52, fontWeight: 600, letterSpacing: '-2px', color: 'var(--text)' }}>
              {tonnes}
            </span>
            <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>tonnes CO₂/year</span>
          </div>
          <span style={{
            display: 'inline-block', marginTop: 10,
            padding: '5px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600,
            background: rating.bg, color: rating.color,
          }}>
            {rating.label} emissions
          </span>
        </div>

        {/* Gauge */}
        <div style={{ textAlign: 'center' }}>
          <svg width="120" height="70" viewBox="0 0 120 70">
            <path d="M10 65 A50 50 0 0 1 110 65" fill="none" stroke="#EAF3DE" strokeWidth="12" strokeLinecap="round"/>
            <path d="M10 65 A50 50 0 0 1 110 65" fill="none"
              stroke={rating.color}
              strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 157} 157`}
            />
            <text x="60" y="62" textAnchor="middle" fontSize="13" fontWeight="600" fill={rating.color}>
              {pct}%
            </text>
          </svg>
          <p style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: -4 }}>of 10t max scale</p>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
        gap: 12, marginBottom: '1.25rem',
      }}>
        {[
          { label: 'vs India avg', val: `${kg > INDIA_AVG_KG ? '+' : ''}${((kg - INDIA_AVG_KG) / INDIA_AVG_KG * 100).toFixed(0)}%`, bad: kg > INDIA_AVG_KG },
          { label: 'vs Global avg', val: `${kg > GLOBAL_AVG_KG ? '+' : ''}${((kg - GLOBAL_AVG_KG) / GLOBAL_AVG_KG * 100).toFixed(0)}%`, bad: kg > GLOBAL_AVG_KG },
          { label: 'Trees to offset', val: `${Math.ceil(kg / 21)}`, bad: false, unit: 'trees/year' },
        ].map(m => (
          <div key={m.label} style={{
            background: 'var(--surface)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)', padding: '1rem',
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</p>
            <p style={{ fontSize: 22, fontWeight: 600, color: m.bad ? 'var(--red-400)' : 'var(--teal-400)' }}>
              {m.val}
              {m.unit && <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>{m.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 12, marginBottom: '1.25rem',
      }}>
        {/* Donut */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: '1.5rem',
        }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Breakdown
          </p>
          <div style={{ maxWidth: 200, margin: '0 auto' }}>
            <canvas ref={donutRef} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: '1rem' }}>
            {breakdownEntries.map(([k, v]) => (
              <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: CATEGORY_META[k]?.color, display: 'inline-block' }} />
                {CATEGORY_META[k]?.label} {Math.round(v)} kg
              </span>
            ))}
          </div>
        </div>

        {/* Bar comparison */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: '1.5rem',
        }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            How you compare
          </p>
          <div style={{ position: 'relative', height: 200 }}>
            <canvas ref={barRef} />
          </div>
        </div>
      </div>

      {/* Category progress bars */}
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.25rem',
      }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Category Detail
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {breakdownEntries.map(([k, v]) => {
            const meta = CATEGORY_META[k]
            const pctBar = Math.min(100, Math.round((v / kg) * 100))
            return (
              <div key={k}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: 'var(--text)' }}>{meta.icon} {meta.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', fontFamily: 'DM Mono, monospace' }}>
                    {Math.round(v)} kg <span style={{ color: 'var(--text-hint)', fontWeight: 400 }}>({pctBar}%)</span>
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: 'var(--gray-100)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    width: `${pctBar}%`, background: meta.color,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: '1.5rem',
        }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Personalised Reduction Tips
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tips.map((tip, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--green-50)', border: '1px solid var(--green-100)',
              }}>
                <span style={{ fontSize: 20 }}>{tip.icon}</span>
                <div>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{tip.text}</p>
                  <p style={{ fontSize: 12, color: 'var(--green-700)', fontWeight: 500, marginTop: 3 }}>
                    Save {tip.save}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

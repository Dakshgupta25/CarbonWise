import { useEffect, useRef } from 'react'

const GLOBAL_AVG = 4800
const INDIA_AVG  = 1900

const CAT = {
  transport:  { label:'Transport',   color:'#4ade80', icon:'🚗' },
  air_travel: { label:'Air Travel',  color:'#22c55e', icon:'✈️' },
  energy:     { label:'Home Energy', color:'#2dd4bf', icon:'🏠' },
  shopping:   { label:'Shopping',    color:'#fbbf24', icon:'🛍️' },
  waste:      { label:'Waste',       color:'#86efac', icon:'♻️' },
}

function getRating(kg) {
  if (kg < 1500) return { label:'Excellent', color:'#4ade80', bg:'rgba(74,222,128,0.1)',  grade:'A+' }
  if (kg < 3000) return { label:'Good',       color:'#22c55e', bg:'rgba(34,197,94,0.1)',   grade:'A'  }
  if (kg < 5000) return { label:'Average',    color:'#fbbf24', bg:'rgba(251,191,36,0.1)',  grade:'B'  }
  if (kg < 8000) return { label:'High',       color:'#f97316', bg:'rgba(249,115,22,0.1)',  grade:'C'  }
  return               { label:'Very High',   color:'#f87171', bg:'rgba(248,113,113,0.1)', grade:'D'  }
}

function StatCard({ label, value, sub, color, delay }) {
  return (
    <div className={`fade-up-${delay}`} style={{
      background:'var(--surface)', borderRadius:'var(--r-md)',
      border:'1px solid var(--border)', padding:'1.25rem',
    }}>
      <p style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text3)', letterSpacing:'0.5px', marginBottom:8 }}>{label}</p>
      <p style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, color: color||'var(--text)', letterSpacing:'-0.5px' }}>{value}</p>
      {sub && <p style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>{sub}</p>}
    </div>
  )
}

function getTips(formData) {
  if (!formData) return []
  const tips = []
  const km  = parseFloat(formData.vehicle_monthly_distance_km||0)
  const air = formData.air_travel_frequency
  const clothes = parseFloat(formData.new_clothes_monthly||0)
  const waste   = parseFloat(formData.waste_bag_weekly_count||0)
  const v = formData.vehicle_type

  if (km>400 && v!=='electric') tips.push({ icon:'⚡', title:'Switch to electric vehicle', impact:'High', save:'~30-40% transport emissions', color:'var(--green)' })
  if (km>300) tips.push({ icon:'🚲', title:'Cycle 2 commutes/week', impact:'Medium', save:`~${Math.round(km*0.0002*12*100)/100} kg CO₂/yr`, color:'var(--green)' })
  if (air==='very frequently'||air==='frequently') tips.push({ icon:'🚄', title:'Take trains for short trips', impact:'High', save:'~500–2000 kg CO₂/yr', color:'var(--amber)' })
  if (clothes>4) tips.push({ icon:'👕', title:'Buy secondhand clothing', impact:'Medium', save:'~200 kg CO₂/yr', color:'var(--teal)' })
  if (waste>3) tips.push({ icon:'♻️', title:'Compost organic waste', impact:'Low', save:'~80 kg CO₂/yr', color:'var(--blue)' })
  tips.push({ icon:'🌱', title:'Offset remaining emissions', impact:'Variable', save:'Carbon credits from ₹500/mo', color:'var(--green)' })
  return tips.slice(0,4)
}

export default function Dashboard({ result, formData, onBack }) {
  const donutRef = useRef(null)
  const barRef   = useRef(null)
  const dChart   = useRef(null)
  const bChart   = useRef(null)

  const kg      = result.prediction
  const tonnes  = (kg/1000).toFixed(2)
  const rating  = getRating(kg)
  const bd      = result.breakdown
  const tips    = getTips(formData)
  const entries = Object.entries(bd).filter(([k])=>CAT[k])
  const pct     = Math.min(100, Math.round((kg/10000)*100))
  const treesNeeded = Math.ceil(kg/21)
  const vsIndia  = ((kg-INDIA_AVG)/INDIA_AVG*100).toFixed(0)
  const vsGlobal = ((kg-GLOBAL_AVG)/GLOBAL_AVG*100).toFixed(0)

  useEffect(()=>{
    const load = async ()=>{
      if (!window.Chart) {
        await new Promise(res=>{ const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'; s.onload=res; document.head.appendChild(s); })
      }
      const C = window.Chart
      if (donutRef.current) {
        dChart.current?.destroy()
        dChart.current = new C(donutRef.current,{
          type:'doughnut',
          data:{ labels:entries.map(([k])=>CAT[k].label), datasets:[{ data:entries.map(([,v])=>v), backgroundColor:entries.map(([k])=>CAT[k].color), borderWidth:0, hoverOffset:8 }] },
          options:{ responsive:true, maintainAspectRatio:true, cutout:'72%', plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:ctx=>` ${ctx.label}: ${ctx.parsed.toFixed(0)} kg` } } } }
        })
      }
      if (barRef.current) {
        bChart.current?.destroy()
        bChart.current = new C(barRef.current,{
          type:'bar',
          data:{
            labels:['You','India avg','Global avg'],
            datasets:[{ data:[kg,INDIA_AVG,GLOBAL_AVG], backgroundColor:[rating.color,'#22c55e','#2dd4bf'], borderRadius:10, borderSkipped:false }]
          },
          options:{
            responsive:true, maintainAspectRatio:false,
            plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:ctx=>` ${ctx.parsed.y.toFixed(0)} kg CO₂/yr` } } },
            scales:{
              x:{ grid:{display:false}, ticks:{ color:'#4a6b4a', font:{size:12,family:'JetBrains Mono'} } },
              y:{ grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#4a6b4a', font:{size:11,family:'JetBrains Mono'}, callback:v=>v+'kg' } }
            }
          }
        })
      }
    }
    load()
    return ()=>{ dChart.current?.destroy(); bChart.current?.destroy() }
  },[])

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:10 }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:'var(--text3)', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'var(--font-mono)' }}>
          ← RECALCULATE
        </button>
        {result.model && (
          <div style={{
            display:'flex', alignItems:'center', gap:8, padding:'6px 14px',
            borderRadius:99, fontSize:11, fontFamily:'var(--font-mono)',
            background: result.model_info?.type==='lr' ? 'rgba(96,165,250,0.08)' : 'var(--green-bg)',
            border: `1px solid ${result.model_info?.type==='lr' ? 'rgba(96,165,250,0.25)' : 'rgba(74,222,128,0.25)'}`,
            color: result.model_info?.type==='lr' ? 'var(--blue)' : 'var(--green)',
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor', display:'inline-block' }} />
            {result.model} · {result.model_info?.features} features
            {result.model_info?.scaled && ' · scaled'}
          </div>
        )}
      </div>

      {/* Hero result */}
      <div className="fade-up" style={{
        background:'var(--surface)', borderRadius:'var(--r-xl)',
        border:'1px solid var(--border)',
        padding:'2.5rem', marginBottom:'1rem',
        position:'relative', overflow:'hidden',
      }}>
        {/* Glow bg */}
        <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:rating.bg, filter:'blur(60px)', pointerEvents:'none' }} />

        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:20, position:'relative' }}>
          <div>
            <p style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text3)', letterSpacing:'1px', marginBottom:12 }}>YOUR ANNUAL CARBON FOOTPRINT</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:16 }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'clamp(3rem,8vw,5rem)', fontWeight:800, letterSpacing:'-3px', color:'var(--text)', animation:'countUp 0.6s ease both' }}>
                {tonnes}
              </span>
              <span style={{ fontSize:18, color:'var(--text2)', fontFamily:'var(--font-mono)' }}>t CO₂/yr</span>
            </div>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:10,
              padding:'8px 18px', borderRadius:99,
              background: rating.bg, border:`1px solid ${rating.color}33`,
            }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:800, color:rating.color }}>{rating.grade}</span>
              <span style={{ fontSize:14, color:rating.color, fontWeight:500 }}>{rating.label} emissions</span>
            </div>
          </div>

          {/* Circular gauge */}
          <div style={{ textAlign:'center', minWidth:120 }}>
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="46" fill="none" stroke="var(--surface2)" strokeWidth="10"/>
              <circle cx="55" cy="55" r="46" fill="none" stroke={rating.color} strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(pct/100)*289} 289`}
                strokeDashoffset="72"
                style={{ transition:'stroke-dasharray 1.2s ease', filter:`drop-shadow(0 0 8px ${rating.color}88)` }}
              />
              <text x="55" y="52" textAnchor="middle" fontSize="18" fontWeight="700" fill={rating.color} fontFamily="JetBrains Mono">{pct}%</text>
              <text x="55" y="68" textAnchor="middle" fontSize="9" fill="#4a6b4a" fontFamily="JetBrains Mono">OF MAX</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:10, marginBottom:'1rem' }}>
        <StatCard delay={1} label="VS INDIA AVG" value={`${vsIndia>0?'+':''}${vsIndia}%`} sub="India: 1.9t/year" color={kg>INDIA_AVG?'var(--red)':'var(--green)'} />
        <StatCard delay={2} label="VS GLOBAL AVG" value={`${vsGlobal>0?'+':''}${vsGlobal}%`} sub="Global: 4.8t/year" color={kg>GLOBAL_AVG?'var(--red)':'var(--green)'} />
        <StatCard delay={3} label="TREES TO OFFSET" value={treesNeeded} sub="mature trees/year" color="var(--teal)" />
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:10, marginBottom:'1rem' }}>
        <div className="fade-up-2" style={{ background:'var(--surface)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)', padding:'1.5rem' }}>
          <p style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text3)', letterSpacing:'0.5px', marginBottom:'1.25rem' }}>BREAKDOWN</p>
          <div style={{ maxWidth:180, margin:'0 auto 1rem' }}>
            <canvas ref={donutRef} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {entries.map(([k,v])=>(
              <div key={k} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
                <span style={{ width:8, height:8, borderRadius:2, background:CAT[k].color, flexShrink:0 }} />
                <span style={{ color:'var(--text2)', flex:1 }}>{CAT[k].label}</span>
                <span style={{ fontFamily:'var(--font-mono)', color:'var(--text)', fontSize:11 }}>{Math.round(v)} kg</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fade-up-3" style={{ background:'var(--surface)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)', padding:'1.5rem' }}>
          <p style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text3)', letterSpacing:'0.5px', marginBottom:'1.25rem' }}>HOW YOU COMPARE</p>
          <div style={{ position:'relative', height:200 }}>
            <canvas ref={barRef} />
          </div>
        </div>
      </div>

      {/* Category bars */}
      <div className="fade-up-2" style={{ background:'var(--surface)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)', padding:'1.5rem', marginBottom:'1rem' }}>
        <p style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text3)', letterSpacing:'0.5px', marginBottom:'1.5rem' }}>EMISSION SOURCES</p>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {entries.map(([k,v])=>{
            const p = Math.min(100, Math.round((v/kg)*100))
            return (
              <div key={k}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:13, color:'var(--text)' }}>{CAT[k].icon} {CAT[k].label}</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text2)' }}>{Math.round(v)} kg <span style={{ color:'var(--text3)' }}>({p}%)</span></span>
                </div>
                <div style={{ height:6, borderRadius:99, background:'var(--surface2)', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${p}%`, background:CAT[k].color, borderRadius:99, transition:'width 1.2s ease', boxShadow:`0 0 10px ${CAT[k].color}66` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="fade-up-3" style={{ background:'var(--surface)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)', padding:'1.5rem' }}>
        <p style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text3)', letterSpacing:'0.5px', marginBottom:'1.25rem' }}>PERSONALISED REDUCTION TIPS</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {tips.map((t,i)=>(
            <div key={i} style={{
              padding:'1rem', borderRadius:'var(--r-md)',
              border:'1px solid var(--border)',
              background:'var(--surface2)',
              transition:'border-color 0.15s',
            }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border2)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
            >
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <span style={{ fontSize:20 }}>{t.icon}</span>
                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background:'var(--green-bg)', color:'var(--green)', fontFamily:'var(--font-mono)', fontWeight:500 }}>{t.impact}</span>
              </div>
              <p style={{ fontSize:13, color:'var(--text)', fontWeight:500, marginBottom:4, lineHeight:1.4 }}>{t.title}</p>
              <p style={{ fontSize:12, color:'var(--green-dim)', fontFamily:'var(--font-mono)' }}>{t.save}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

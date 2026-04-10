const ALL_BADGES = [
  {
    id:'eco_warrior',
    icon:'🌍',
    title:'Eco Warrior',
    desc:'Annual footprint under 2 tonnes',
    condition: (r,f) => r && r.prediction < 2000,
    color:'#4ade80',
    rare:'Legendary',
  },
  {
    id:'ev_driver',
    icon:'⚡',
    title:'EV Pioneer',
    desc:'Driving an electric vehicle',
    condition: (r,f) => f && f.vehicle_type==='electric',
    color:'#60a5fa',
    rare:'Rare',
  },
  {
    id:'grounded',
    icon:'✈️',
    title:'Grounded',
    desc:'Never or rarely flies',
    condition: (r,f) => f && (f.air_travel_frequency==='never'||f.air_travel_frequency==='rarely'),
    color:'#2dd4bf',
    rare:'Common',
  },
  {
    id:'light_packer',
    icon:'🧳',
    title:'Light Packer',
    desc:'Buys fewer than 3 new clothes/month',
    condition: (r,f) => f && parseFloat(f.new_clothes_monthly||0)<3,
    color:'#f472b6',
    rare:'Common',
  },
  {
    id:'waste_warrior',
    icon:'♻️',
    title:'Waste Warrior',
    desc:'Under 2 waste bags per week',
    condition: (r,f) => f && parseFloat(f.waste_bag_weekly_count||0)<2,
    color:'#a3e635',
    rare:'Common',
  },
  {
    id:'hybrid_hero',
    icon:'🔋',
    title:'Hybrid Hero',
    desc:'Driving a hybrid vehicle',
    condition: (r,f) => f && f.vehicle_type==='hybrid',
    color:'#fbbf24',
    rare:'Uncommon',
  },
  {
    id:'below_average',
    icon:'📉',
    title:'Below Average',
    desc:'Footprint below global average (4.8t)',
    condition: (r,f) => r && r.prediction < 4800,
    color:'#22c55e',
    rare:'Uncommon',
  },
  {
    id:'india_champ',
    icon:'🇮🇳',
    title:'India Champion',
    desc:'Below India average (1.9t)',
    condition: (r,f) => r && r.prediction < 1900,
    color:'#f97316',
    rare:'Rare',
  },
  {
    id:'first_calc',
    icon:'🌱',
    title:'First Steps',
    desc:'Completed your first calculation',
    condition: (r,f) => !!r,
    color:'#4ade80',
    rare:'Starter',
  },
]

const RARITY_COLOR = {
  Starter:'var(--text2)',
  Common:'#86efac',
  Uncommon:'#60a5fa',
  Rare:'#f472b6',
  Legendary:'#fbbf24',
}

export default function Badges({ result, formData }) {
  const earned = ALL_BADGES.filter(b => b.condition(result, formData))
  const locked = ALL_BADGES.filter(b => !b.condition(result, formData))

  return (
    <div>
      <div className="fade-up" style={{ marginBottom:'2rem' }}>
        <div style={{ display:'inline-block', padding:'5px 14px', borderRadius:99, border:'1px solid rgba(251,191,36,0.3)', background:'rgba(251,191,36,0.08)', fontSize:11, fontFamily:'var(--font-mono)', color:'var(--amber)', letterSpacing:'1px', marginBottom:14 }}>
          ACHIEVEMENT BADGES
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, letterSpacing:'-1px', color:'var(--text)', marginBottom:8 }}>
          Your achievements
        </h1>
        <p style={{ color:'var(--text2)', fontSize:15 }}>
          {result
            ? `You've earned ${earned.length} of ${ALL_BADGES.length} badges.`
            : 'Complete a calculation to unlock badges.'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="fade-up-1" style={{ background:'var(--surface)', borderRadius:'var(--r-md)', border:'1px solid var(--border)', padding:'1.25rem', marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ fontSize:13, color:'var(--text2)' }}>Collection progress</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--green)' }}>{earned.length}/{ALL_BADGES.length}</span>
        </div>
        <div style={{ height:8, background:'var(--surface2)', borderRadius:99, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${(earned.length/ALL_BADGES.length)*100}%`, background:'linear-gradient(90deg,#166534,#4ade80)', borderRadius:99, transition:'width 1s ease', boxShadow:'0 0 12px rgba(74,222,128,0.4)' }} />
        </div>
      </div>

      {/* Earned */}
      {earned.length>0 && (
        <div className="fade-up-2" style={{ marginBottom:'2rem' }}>
          <p style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--green)', letterSpacing:'0.5px', marginBottom:'1rem' }}>EARNED — {earned.length}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
            {earned.map(b=>(
              <div key={b.id} style={{
                background:'var(--surface)', borderRadius:'var(--r-md)',
                border:`1px solid ${b.color}33`,
                padding:'1.25rem',
                position:'relative', overflow:'hidden',
                transition:'transform 0.15s, border-color 0.15s',
              }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor=b.color+'88' }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor=b.color+'33' }}
              >
                <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:b.color+'11', filter:'blur(20px)' }} />
                <div style={{ fontSize:32, marginBottom:10 }}>{b.icon}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:'var(--text)' }}>{b.title}</p>
                </div>
                <p style={{ fontSize:12, color:'var(--text2)', lineHeight:1.5, marginBottom:10 }}>{b.desc}</p>
                <span style={{ fontSize:10, fontFamily:'var(--font-mono)', padding:'3px 8px', borderRadius:99, background:`${b.color}15`, color:RARITY_COLOR[b.rare]||b.color }}>
                  {b.rare}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length>0 && (
        <div className="fade-up-3">
          <p style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text3)', letterSpacing:'0.5px', marginBottom:'1rem' }}>LOCKED — {locked.length}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
            {locked.map(b=>(
              <div key={b.id} style={{
                background:'var(--surface)', borderRadius:'var(--r-md)',
                border:'1px solid var(--border)',
                padding:'1.25rem', opacity:0.5,
                filter:'grayscale(1)',
              }}>
                <div style={{ fontSize:32, marginBottom:10, filter:'blur(1px)' }}>🔒</div>
                <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', marginBottom:6 }}>{b.title}</p>
                <p style={{ fontSize:12, color:'var(--text2)', lineHeight:1.5, marginBottom:10 }}>{b.desc}</p>
                <span style={{ fontSize:10, fontFamily:'var(--font-mono)', padding:'3px 8px', borderRadius:99, background:'var(--surface2)', color:'var(--text3)' }}>
                  {b.rare}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

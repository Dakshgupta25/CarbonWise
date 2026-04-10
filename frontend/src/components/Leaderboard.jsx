import { useState } from 'react'

// Simulated community data
const COMMUNITY = [
  { rank:1,  name:'Aryan S.',      city:'Chandigarh', kg:1240, vehicle:'electric', badge:'🏆' },
  { rank:2,  name:'Priya M.',      city:'Bangalore',  kg:1580, vehicle:'hybrid',   badge:'🥈' },
  { rank:3,  name:'Rohan K.',      city:'Pune',       kg:1820, vehicle:'electric', badge:'🥉' },
  { rank:4,  name:'Sneha P.',      city:'Mumbai',     kg:2100, vehicle:'petrol',   badge:null },
  { rank:5,  name:'Vikram J.',     city:'Delhi',      kg:2340, vehicle:'petrol',   badge:null },
  { rank:6,  name:'Ananya T.',     city:'Hyderabad',  kg:2680, vehicle:'hybrid',   badge:null },
  { rank:7,  name:'Mohit R.',      city:'Jaipur',     kg:3020, vehicle:'petrol',   badge:null },
  { rank:8,  name:'Kavya L.',      city:'Chennai',    kg:3180, vehicle:'electric', badge:null },
  { rank:9,  name:'Aditya B.',     city:'Kolkata',    kg:3450, vehicle:'petrol',   badge:null },
  { rank:10, name:'Deepika N.',    city:'Ahmedabad',  kg:3900, vehicle:'lpg',      badge:null },
]

function getRankColor(rank) {
  if (rank===1) return '#fbbf24'
  if (rank===2) return '#94a3b8'
  if (rank===3) return '#cd7c2f'
  return 'var(--text3)'
}

function getBar(kg) {
  const max = 5000
  return Math.min(100, Math.round((kg/max)*100))
}

export default function Leaderboard({ userResult }) {
  const [filter, setFilter] = useState('all')

  const userKg = userResult?.prediction || null

  // Insert user into the list if they have a result
  let list = [...COMMUNITY]
  let userRank = null
  if (userKg) {
    const inserted = { rank:0, name:'You 👈', city:'Your city', kg:userKg, vehicle:'-', badge:null, isUser:true }
    list.push(inserted)
    list.sort((a,b)=>a.kg-b.kg)
    list = list.map((item,i)=>({ ...item, rank:i+1 }))
    userRank = list.find(x=>x.isUser)?.rank
  }

  const filtered = filter==='top5' ? list.slice(0,5) : list

  return (
    <div>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom:'2rem' }}>
        <div style={{ display:'inline-block', padding:'5px 14px', borderRadius:99, border:'1px solid rgba(251,191,36,0.3)', background:'rgba(251,191,36,0.08)', fontSize:11, fontFamily:'var(--font-mono)', color:'var(--amber)', letterSpacing:'1px', marginBottom:14 }}>
          COMMUNITY LEADERBOARD
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, letterSpacing:'-1px', color:'var(--text)', marginBottom:8 }}>
          How do you rank?
        </h1>
        <p style={{ color:'var(--text2)', fontSize:15 }}>
          Lower is better — ranked by annual kg CO₂.
          {userKg && <span style={{ color:'var(--green)', fontWeight:500 }}> You're #{userRank} out of {list.length} users.</span>}
        </p>
      </div>

      {/* User spotlight */}
      {userKg && (
        <div className="fade-up-1" style={{
          background:'var(--green-bg)', borderRadius:'var(--r-lg)',
          border:'1px solid rgba(74,222,128,0.25)', padding:'1.25rem 1.5rem',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:'1.25rem', flexWrap:'wrap', gap:12,
        }}>
          <div>
            <p style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--green)', letterSpacing:'0.5px', marginBottom:4 }}>YOUR POSITION</p>
            <p style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, color:'var(--text)' }}>
              #{userRank} <span style={{ fontSize:15, fontWeight:400, color:'var(--text2)' }}>out of {list.length}</span>
            </p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:11, fontFamily:'var(--font-mono)', color:'var(--text3)', marginBottom:4 }}>YOUR FOOTPRINT</p>
            <p style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:700, color:'var(--green)' }}>
              {(userKg/1000).toFixed(2)}t
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="fade-up-1" style={{ display:'flex', gap:8, marginBottom:'1.25rem' }}>
        {[['all','All users'],['top5','Top 5']].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{
            padding:'7px 16px', borderRadius:99, fontSize:13, fontWeight:500,
            border: filter===v ? '1px solid var(--green)' : '1px solid var(--border2)',
            background: filter===v ? 'var(--green-bg)' : 'transparent',
            color: filter===v ? 'var(--green)' : 'var(--text2)', cursor:'pointer',
          }}>{l}</button>
        ))}
      </div>

      {/* Table */}
      <div className="fade-up-2" style={{ background:'var(--surface)', borderRadius:'var(--r-lg)', border:'1px solid var(--border)', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 140px 100px', padding:'12px 20px', borderBottom:'1px solid var(--border)', background:'var(--surface2)' }}>
          {['RANK','USER','FOOTPRINT','VEHICLE'].map(h=>(
            <span key={h} style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--text3)', letterSpacing:'0.5px' }}>{h}</span>
          ))}
        </div>

        {filtered.map((u, i) => (
          <div key={u.rank} style={{
            display:'grid', gridTemplateColumns:'60px 1fr 140px 100px',
            padding:'14px 20px',
            borderBottom: i < filtered.length-1 ? '1px solid var(--border)' : 'none',
            background: u.isUser ? 'rgba(74,222,128,0.05)' : 'transparent',
            transition:'background 0.15s',
          }}
            onMouseEnter={e=>!u.isUser && (e.currentTarget.style.background='var(--surface2)')}
            onMouseLeave={e=>!u.isUser && (e.currentTarget.style.background='transparent')}
          >
            {/* Rank */}
            <div style={{ display:'flex', alignItems:'center' }}>
              {u.badge
                ? <span style={{ fontSize:20 }}>{u.badge}</span>
                : <span style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:600, color:getRankColor(u.rank) }}>#{u.rank}</span>
              }
            </div>

            {/* Name + bar */}
            <div>
              <p style={{ fontSize:14, fontWeight:u.isUser?700:400, color:u.isUser?'var(--green)':'var(--text)', marginBottom:5 }}>
                {u.name}
                {u.isUser && <span style={{ marginLeft:8, fontSize:10, padding:'2px 6px', background:'var(--green-bg)', color:'var(--green)', borderRadius:4, fontFamily:'var(--font-mono)' }}>YOU</span>}
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ flex:1, height:4, background:'var(--surface2)', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${getBar(u.kg)}%`, background: u.isUser?'var(--green)':u.rank<=3?getRankColor(u.rank):'var(--text3)', borderRadius:99, transition:'width 1s ease' }} />
                </div>
                <span style={{ fontSize:10, color:'var(--text3)', fontFamily:'var(--font-mono)', minWidth:30 }}>{u.city}</span>
              </div>
            </div>

            {/* kg */}
            <div style={{ display:'flex', alignItems:'center' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:13, color:u.isUser?'var(--green)':'var(--text)', fontWeight:u.isUser?600:400 }}>
                {u.kg.toLocaleString()} kg
              </span>
            </div>

            {/* vehicle */}
            <div style={{ display:'flex', alignItems:'center' }}>
              <span style={{ fontSize:12, color:'var(--text2)', textTransform:'capitalize' }}>{u.vehicle}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="fade-up-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginTop:'1.25rem' }}>
        {[
          { label:'COMMUNITY AVG', value:`${(COMMUNITY.reduce((a,b)=>a+b.kg,0)/COMMUNITY.length/1000).toFixed(1)}t`, sub:'kg CO₂/year' },
          { label:'BEST SCORE',    value:`${(Math.min(...COMMUNITY.map(c=>c.kg))/1000).toFixed(2)}t`, sub:'community leader' },
          { label:'TOTAL USERS',   value:list.length, sub:'and growing' },
        ].map(s=>(
          <div key={s.label} style={{ background:'var(--surface)', borderRadius:'var(--r-md)', border:'1px solid var(--border)', padding:'1.25rem' }}>
            <p style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--text3)', letterSpacing:'0.5px', marginBottom:8 }}>{s.label}</p>
            <p style={{ fontFamily:'var(--font-display)', fontSize:24, fontWeight:700, color:'var(--text)' }}>{s.value}</p>
            <p style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

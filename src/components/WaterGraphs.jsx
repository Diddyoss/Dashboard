import { useState, useMemo } from 'react'
import { getDayKey } from '../utils/date'
import styles from './WaterGraphs.module.css'

const W = 300
const H_D = 130
const H_W = 120
const PAD = { l: 38, r: 10, t: 12, b: 24 }
const CW = W - PAD.l - PAD.r
const CH_D = H_D - PAD.t - PAD.b
const CH_W = H_W - PAD.t - PAD.b

function readWaterDay(offsetDays) {
  const key = `dashboard:water:${getDayKey(offsetDays)}`
  try {
    const raw = JSON.parse(localStorage.getItem(key) || '{}')
    return { total: raw.total || 0, entries: raw.entries || [] }
  } catch {
    return { total: 0, entries: [] }
  }
}

function getPastWeek(goal) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const { total } = readWaterDay(-i)
    days.push({ daysAgo: i, date: d, total, hitGoal: total >= goal })
  }
  return days
}

function DailyChart({ entries, goal }) {
  const sorted = [...entries].sort((a, b) => a.ts - b.ts)
  const cumTotal = sorted.reduce((s, e) => s + e.ml, 0)
  const maxY = Math.max(goal * 1.15, cumTotal * 1.15, 300)

  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()

  const tx = (mins) => PAD.l + (mins / 1440) * CW
  const ty = (ml) => PAD.t + CH_D - (ml / maxY) * CH_D

  let cum = 0
  const pts = [{ x: tx(0), y: ty(0) }]
  for (const e of sorted) {
    const d = new Date(e.ts)
    const mins = d.getHours() * 60 + d.getMinutes()
    pts.push({ x: tx(mins), y: ty(cum) })
    cum += e.ml
    pts.push({ x: tx(mins), y: ty(cum) })
  }
  pts.push({ x: tx(nowMins), y: ty(cum) })

  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaD = `${lineD} L${tx(nowMins).toFixed(1)},${ty(0).toFixed(1)} L${tx(0).toFixed(1)},${ty(0).toFixed(1)} Z`
  const goalY = ty(goal)

  const yStep = maxY > 1800 ? 1000 : 500
  const yTicks = []
  for (let v = 0; v <= maxY; v += yStep) yTicks.push(v)

  let cumDot = 0

  return (
    <svg viewBox={`0 0 ${W} ${H_D}`} className={styles.chart}>
      {yTicks.map(v => (
        <line key={v} x1={PAD.l} y1={ty(v)} x2={PAD.l + CW} y2={ty(v)}
          stroke="#1e1e1e" strokeWidth="0.5" />
      ))}
      <line x1={PAD.l} y1={goalY} x2={PAD.l + CW} y2={goalY}
        stroke="#333333" strokeWidth="0.8" strokeDasharray="4,3" />
      <text x={PAD.l + CW - 1} y={goalY - 3} className={styles.goalLbl} textAnchor="end">goal</text>
      <path d={areaD} fill="#3b82f6" fillOpacity="0.07" />
      <path d={lineD} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round" />
      {sorted.map((e, i) => {
        const d2 = new Date(e.ts)
        const mins = d2.getHours() * 60 + d2.getMinutes()
        cumDot += e.ml
        return <circle key={i} cx={tx(mins)} cy={ty(cumDot)} r="2.5" fill="#3b82f6" opacity="0.75" />
      })}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + CH_D} stroke="#222222" strokeWidth="0.5" />
      <line x1={PAD.l} y1={PAD.t + CH_D} x2={PAD.l + CW} y2={PAD.t + CH_D} stroke="#222222" strokeWidth="0.5" />
      {[0, 6, 12, 18, 24].map(h => (
        <g key={h}>
          <line x1={tx(h * 60)} y1={PAD.t + CH_D} x2={tx(h * 60)} y2={PAD.t + CH_D + 3}
            stroke="#222222" strokeWidth="0.5" />
          {h < 24 && (
            <text x={tx(h * 60)} y={H_D - 6} className={styles.axisLbl} textAnchor="middle">
              {`${h}h`}
            </text>
          )}
        </g>
      ))}
      {yTicks.map(v => {
        const y = ty(v)
        if (y > PAD.t + CH_D + 2) return null
        return (
          <text key={v} x={PAD.l - 4} y={y + 3} className={styles.axisLbl} textAnchor="end">
            {v >= 1000 ? `${v / 1000}L` : `${v}`}
          </text>
        )
      })}
    </svg>
  )
}

function WeekChart({ data, goal }) {
  const maxY = Math.max(goal * 1.2, ...data.map(d => d.total), 100)
  const ty = (ml) => PAD.t + CH_W - (ml / maxY) * CH_W
  const slotW = CW / 7
  const barW = Math.floor(slotW * 0.55)
  const barOff = (slotW - barW) / 2

  const yStep = maxY > 1800 ? 1000 : 500
  const yTicks = []
  for (let v = 0; v <= maxY; v += yStep) yTicks.push(v)

  return (
    <svg viewBox={`0 0 ${W} ${H_W}`} className={styles.chart}>
      {yTicks.map(v => (
        <line key={v} x1={PAD.l} y1={ty(v)} x2={PAD.l + CW} y2={ty(v)}
          stroke="#1e1e1e" strokeWidth="0.5" />
      ))}
      <line x1={PAD.l} y1={ty(goal)} x2={PAD.l + CW} y2={ty(goal)}
        stroke="#333333" strokeWidth="0.8" strokeDasharray="4,3" />
      <text x={PAD.l + CW - 1} y={ty(goal) - 3} className={styles.goalLbl} textAnchor="end">goal</text>
      {data.map((day, i) => {
        const barH = (day.total / maxY) * CH_W
        const x = PAD.l + i * slotW + barOff
        const y = PAD.t + CH_W - barH
        const label = day.daysAgo === 0
          ? 'Today'
          : day.date.toLocaleDateString('en-US', { weekday: 'short' })
        return (
          <g key={i}>
            {day.total > 0 && (
              <rect x={x} y={y} width={barW} height={barH}
                fill={day.hitGoal ? '#3b82f6' : '#2d2d2d'} rx="1.5" />
            )}
            <text
              x={x + barW / 2} y={H_W - 6}
              className={`${styles.axisLbl} ${day.daysAgo === 0 ? styles.todayLbl : ''}`}
              textAnchor="middle"
            >
              {label}
            </text>
          </g>
        )
      })}
      <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + CH_W} stroke="#222222" strokeWidth="0.5" />
      <line x1={PAD.l} y1={PAD.t + CH_W} x2={PAD.l + CW} y2={PAD.t + CH_W} stroke="#222222" strokeWidth="0.5" />
      {yTicks.map(v => {
        const y = ty(v)
        if (y > PAD.t + CH_W + 2) return null
        return (
          <text key={v} x={PAD.l - 4} y={y + 3} className={styles.axisLbl} textAnchor="end">
            {v >= 1000 ? `${v / 1000}L` : `${v}`}
          </text>
        )
      })}
    </svg>
  )
}

export default function WaterGraphs({ entries, goal }) {
  const [view, setView] = useState('today')
  const weekData = useMemo(() => getPastWeek(goal), [goal])

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <p className={styles.label}>Intake history</p>
        <div className={styles.tabs}>
          {[['today', 'Today'], ['week', '7 days']].map(([v, lbl]) => (
            <button
              key={v}
              className={`${styles.tab} ${view === v ? styles.activeTab : ''}`}
              onClick={() => setView(v)}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>
      {view === 'today'
        ? <DailyChart entries={entries} goal={goal} />
        : <WeekChart data={weekData} goal={goal} />
      }
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { todayKey, formatTime, parseTimeToMinutes, nowMinutes } from '../utils/date'
import ProgressRing from './ProgressRing'
import TodoList from './TodoList'
import styles from './HomeTab.module.css'

const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

function getDayPct(settings) {
  const wake = parseTimeToMinutes(settings.wakeTime || '07:00')
  const sleep = parseTimeToMinutes(settings.sleepTime || '23:00')
  if (sleep <= wake) return 0
  return clamp(((nowMinutes() - wake) / (sleep - wake)) * 100, 0, 100)
}

function goalColor(pct, total) {
  if (total === 0) return '#cccccc'
  if (pct >= 100) return '#111111'
  return `hsl(0,0%,${Math.round(60 - pct * 0.5)}%)`
}

export default function HomeTab({ settings, setSettings }) {
  const [todos, setTodos] = useLocalStorage(`dashboard:todos:${todayKey()}`, [])
  const [showSettings, setShowSettings] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const dayPct = Math.round(getDayPct(settings))
  const total = todos.length
  const done = todos.filter((t) => t.completed).length
  const goalPct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Today</h1>
        <button
          className={styles.gearBtn}
          onClick={() => setShowSettings((s) => !s)}
          aria-label="Settings"
        >
          <GearIcon />
        </button>
      </header>

      {showSettings && (
        <div className={styles.settingsCard}>
          <div className={styles.settingRow}>
            <label className={styles.settingLabel}>Wake time</label>
            <input
              type="time"
              className={styles.timeInput}
              value={settings.wakeTime || '07:00'}
              onChange={(e) => setSettings((s) => ({ ...s, wakeTime: e.target.value }))}
            />
          </div>
          <div className={styles.settingRow}>
            <label className={styles.settingLabel}>Sleep time</label>
            <input
              type="time"
              className={styles.timeInput}
              value={settings.sleepTime || '23:00'}
              onChange={(e) => setSettings((s) => ({ ...s, sleepTime: e.target.value }))}
            />
          </div>
        </div>
      )}

      <div className={styles.ringsCard}>
        <ProgressRing
          title="Day Elapsed"
          percentage={dayPct}
          color="#111111"
          label={`${dayPct}%`}
          sublabel={formatTime(now)}
        />
        <ProgressRing
          title="Goal Progress"
          percentage={goalPct}
          color={goalColor(goalPct, total)}
          label={`${goalPct}%`}
          sublabel={total === 0 ? 'No tasks' : `${done} of ${total}`}
        />
      </div>

      <TodoList todos={todos} setTodos={setTodos} />
    </div>
  )
}

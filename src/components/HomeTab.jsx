import { useState, useEffect, useRef } from 'react'
import { getDayKey, formatTime, parseTimeToMinutes, nowMinutes } from '../utils/date'
import ProgressRing from './ProgressRing'
import TodoList from './TodoList'
import PulseDot from './PulseDot'
import StreakTracker from './StreakTracker'
import styles from './HomeTab.module.css'

const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

const QUOTES = [
  'Small steps every day.',
  'Done is better than perfect.',
  'Discipline beats motivation.',
  'Make today count.',
  'Progress, not perfection.',
  'One task at a time.',
  'Start before you feel ready.',
  'Consistency compounds.',
  'Future you is watching.',
  'Win the morning, win the day.',
  'Action cures fear.',
  'You won’t always be motivated. Be disciplined.',
  'The best time to start is now.',
  'Show up, even on the hard days.',
  'Little by little becomes a lot.',
  'Energy flows where focus goes.',
  'Do it for the person you want to become.',
  'Momentum loves a first move.',
  'Effort today, ease tomorrow.',
  'Keep the promise you made to yourself.',
]

function randomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)]
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

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
  if (total === 0) return '#2a2a2a'
  if (pct >= 100) return '#aaaaaa'
  return `hsl(0,0%,${Math.round(20 + pct * 0.5)}%)`
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()
}

function getDayRingColor(now) {
  const m = now.getHours() * 60 + now.getMinutes()
  if (m < 12 * 60) return '#fbbf24'
  if (m < 17 * 60) return '#f97316'
  if (m < 21 * 60) return '#ef4444'
  return '#6366f1'
}

function getStatus(todos, dayOffset) {
  if (todos.length === 0) {
    return {
      type: 'empty',
      msg: dayOffset === 0
        ? 'No goals set for today — add one to get rolling.'
        : 'Nothing planned for tomorrow yet.',
    }
  }
  const incomplete = todos.filter(t => !t.completed)
  if (incomplete.length === 0) {
    return {
      type: 'done',
      msg: dayOffset === 0 ? 'All goals completed for today.' : 'All tasks planned for tomorrow.',
    }
  }
  return { type: 'next', task: incomplete[0].text }
}

export default function HomeTab({ settings, setSettings }) {
  const [dayOffset, setDayOffset] = useState(0)
  const activeKey = `dashboard:todos:${getDayKey(dayOffset)}`
  const activeKeyRef = useRef(activeKey)
  activeKeyRef.current = activeKey

  const [todos, setTodos] = useState(() => {
    try {
      const item = localStorage.getItem(`dashboard:todos:${getDayKey(0)}`)
      return item ? JSON.parse(item) : []
    } catch { return [] }
  })

  const [showSettings, setShowSettings] = useState(false)
  const [now, setNow] = useState(new Date())
  const [quote] = useState(randomQuote)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    try {
      const item = localStorage.getItem(activeKey)
      setTodos(item ? JSON.parse(item) : [])
    } catch { setTodos([]) }
  }, [activeKey])

  // Save on todos change; activeKeyRef always holds the current key at save time
  useEffect(() => {
    try { localStorage.setItem(activeKeyRef.current, JSON.stringify(todos)) } catch {}
  }, [todos]) // eslint-disable-line react-hooks/exhaustive-deps

  const dayPct = Math.round(getDayPct(settings))
  const total = todos.length
  const done = todos.filter(t => t.completed).length
  const goalPct = total > 0 ? Math.round((done / total) * 100) : 0
  const status = getStatus(todos, dayOffset)

  const headerDate = (() => {
    const d = new Date()
    d.setDate(d.getDate() + dayOffset)
    return d
  })()

  const pushToTomorrow = () => {
    const incomplete = todos.filter(t => !t.completed)
    if (!incomplete.length) return
    const tomorrowKey = `dashboard:todos:${getDayKey(1)}`
    try {
      const existing = JSON.parse(localStorage.getItem(tomorrowKey) || '[]')
      const pushed = incomplete.map(t => ({ ...t, id: uid() }))
      localStorage.setItem(tomorrowKey, JSON.stringify([...existing, ...pushed]))
    } catch {}
    setTodos(prev => prev.filter(t => t.completed))
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.headingRow}>
            <PulseDot color="#f97316" />
            <h1 className={styles.heading}>{dayOffset === 0 ? 'Today' : 'Tomorrow'}</h1>
            <p className={styles.quote}>“{quote}”</p>
          </div>
          <p className={styles.date}>{formatDate(headerDate)}</p>
        </div>
        <button
          className={styles.gearBtn}
          onClick={() => setShowSettings(s => !s)}
          aria-label="Settings"
        >
          <GearIcon />
        </button>
      </header>

      {showSettings && (
        <div className={styles.settingsCard}>
          <p className={styles.settingsTitle}>Active day window</p>
          <div className={styles.settingRow}>
            <label className={styles.settingLabel}>Wake</label>
            <input
              type="time"
              className={styles.timeInput}
              value={settings.wakeTime || '07:00'}
              onChange={(e) => setSettings(s => ({ ...s, wakeTime: e.target.value }))}
            />
          </div>
          <div className={styles.settingRow}>
            <label className={styles.settingLabel}>Sleep</label>
            <input
              type="time"
              className={styles.timeInput}
              value={settings.sleepTime || '23:00'}
              onChange={(e) => setSettings(s => ({ ...s, sleepTime: e.target.value }))}
            />
          </div>
          <div className={styles.settingRow}>
            <label className={styles.settingLabel}>Water goal</label>
            <div className={styles.inlineEdit}>
              <input
                type="number"
                className={styles.numInput}
                value={settings.waterGoal || 2000}
                onChange={(e) => {
                  const v = parseInt(e.target.value)
                  if (v > 0) setSettings(s => ({ ...s, waterGoal: v }))
                }}
              />
              <span className={styles.unit}>ml</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.daySelector}>
        {[0, 1].map(offset => (
          <button
            key={offset}
            className={`${styles.dayTab} ${dayOffset === offset ? styles.activeDayTab : ''}`}
            onClick={() => setDayOffset(offset)}
          >
            {offset === 0 ? 'Today' : 'Tomorrow'}
          </button>
        ))}
      </div>

      <div className={styles.ringsCard}>
        <ProgressRing
          title="Day Elapsed"
          percentage={dayPct}
          color={getDayRingColor(now)}
          label={`${dayPct}%`}
          sublabel={formatTime(now)}
        />
        <div className={styles.ringDivider} />
        <ProgressRing
          title="Goal Progress"
          percentage={goalPct}
          color={goalColor(goalPct, total)}
          label={`${goalPct}%`}
          sublabel={total === 0 ? 'No tasks' : `${done} of ${total}`}
        />
      </div>

      <StreakTracker todos={todos} dayOffset={dayOffset} waterGoal={settings.waterGoal} />

      <div className={`${styles.statusCard} ${styles[`status_${status.type}`]}`}>
        {status.type === 'empty' && (
          <p className={styles.statusText}>{status.msg}</p>
        )}
        {status.type === 'done' && (
          <>
            <span className={styles.statusTag}>DONE</span>
            <p className={styles.statusText}>{status.msg}</p>
          </>
        )}
        {status.type === 'next' && (
          <>
            <span className={styles.statusTag}>NEXT</span>
            <p className={styles.statusText}>{status.task}</p>
          </>
        )}
      </div>

      <TodoList
        todos={todos}
        setTodos={setTodos}
        dayOffset={dayOffset}
        onPushToTomorrow={pushToTomorrow}
      />
    </div>
  )
}

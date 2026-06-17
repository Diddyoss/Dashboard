import { useMemo, useEffect } from 'react'
import { getDayKey } from '../utils/date'
import { useLocalStorage } from '../hooks/useLocalStorage'
import styles from './StreakTracker.module.css'

const FlameIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
  </svg>
)

function readTodos(offset) {
  try {
    return JSON.parse(localStorage.getItem(`dashboard:todos:${getDayKey(offset)}`) || '[]')
  } catch {
    return []
  }
}

function readWaterTotal(offset) {
  try {
    return JSON.parse(localStorage.getItem(`dashboard:water:${getDayKey(offset)}`) || '{}').total || 0
  } catch {
    return 0
  }
}

const tasksHit = (offset) => {
  const t = readTodos(offset)
  return t.length > 0 && t.every(x => x.completed)
}

const waterHit = (offset, goal) => readWaterTotal(offset) >= goal

// Count consecutive successful days ending today. If today isn't met yet,
// start from yesterday so an in-progress day doesn't reset the streak.
function computeStreak(hit) {
  let offset = hit(0) ? 0 : -1
  let streak = 0
  while (hit(offset)) {
    streak++
    offset--
  }
  return streak
}

function StreakCell({ count, best, label, met }) {
  return (
    <div className={styles.cell}>
      <div className={`${styles.flame} ${count > 0 ? styles.flameActive : ''}`}>
        <FlameIcon active={count > 0} />
      </div>
      <div className={styles.count}>{count}</div>
      <div className={styles.unit}>{count === 1 ? 'day' : 'days'}</div>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {met && <span className={styles.todayDot} title="Logged today" />}
      </div>
      <div className={styles.best}>Best {best}</div>
    </div>
  )
}

export default function StreakTracker({ todos, dayOffset, waterGoal = 2000 }) {
  const { tasksStreak, waterStreak, tasksMet, waterMet } = useMemo(() => ({
    tasksStreak: computeStreak(tasksHit),
    waterStreak: computeStreak(o => waterHit(o, waterGoal)),
    tasksMet: tasksHit(0),
    waterMet: waterHit(0, waterGoal),
  }), [todos, dayOffset, waterGoal])

  const [best, setBest] = useLocalStorage('dashboard:streaks', { tasksBest: 0, waterBest: 0 })

  useEffect(() => {
    setBest(prev => {
      const tasksBest = Math.max(prev.tasksBest || 0, tasksStreak)
      const waterBest = Math.max(prev.waterBest || 0, waterStreak)
      if (tasksBest === prev.tasksBest && waterBest === prev.waterBest) return prev
      return { tasksBest, waterBest }
    })
  }, [tasksStreak, waterStreak, setBest])

  return (
    <div className={styles.card}>
      <p className={styles.title}>Streaks</p>
      <div className={styles.row}>
        <StreakCell count={tasksStreak} best={best.tasksBest || 0} label="Tasks" met={tasksMet} />
        <div className={styles.divider} />
        <StreakCell count={waterStreak} best={best.waterBest || 0} label="Water" met={waterMet} />
      </div>
    </div>
  )
}

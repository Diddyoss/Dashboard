import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { todayKey, formatTime } from '../utils/date'
import ProgressRing from './ProgressRing'
import styles from './WaterTab.module.css'

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

export default function WaterTab({ settings, setSettings }) {
  const [waterData, setWaterData] = useLocalStorage(
    `dashboard:water:${todayKey()}`,
    { entries: [], total: 0 }
  )
  const [customAmount, setCustomAmount] = useState('')
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState('')

  const goal = settings.waterGoal || 2000
  const total = waterData.total || 0
  const entries = waterData.entries || []
  const pct = Math.min(Math.round((total / goal) * 100), 100)
  const remaining = Math.max(0, goal - total)
  const recentEntries = [...entries].reverse().slice(0, 6)

  const addWater = (ml) => {
    const amount = Math.round(Number(ml))
    if (!amount || amount <= 0) return
    setWaterData((prev) => ({
      entries: [...(prev.entries || []), { ml: amount, ts: Date.now() }],
      total: (prev.total || 0) + amount,
    }))
  }

  const handleCustomAdd = () => {
    addWater(customAmount)
    setCustomAmount('')
  }

  const undoLast = () => {
    setWaterData((prev) => {
      const e = [...(prev.entries || [])]
      if (!e.length) return prev
      const last = e.pop()
      return { entries: e, total: Math.max(0, (prev.total || 0) - last.ml) }
    })
  }

  const resetDay = () => setWaterData({ entries: [], total: 0 })

  const startEditGoal = () => {
    setGoalInput(String(goal))
    setEditingGoal(true)
  }

  const commitGoal = () => {
    const g = Math.round(Number(goalInput))
    if (g > 0) setSettings((prev) => ({ ...prev, waterGoal: g }))
    setEditingGoal(false)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Water</h1>
        <div className={styles.goalRow}>
          <span className={styles.goalLabel}>Daily goal</span>
          {editingGoal ? (
            <span className={styles.goalEdit}>
              <input
                className={styles.goalInput}
                type="number"
                value={goalInput}
                autoFocus
                onChange={(e) => setGoalInput(e.target.value)}
                onBlur={commitGoal}
                onKeyDown={(e) => e.key === 'Enter' && commitGoal()}
              />
              <span className={styles.goalUnit}>ml</span>
            </span>
          ) : (
            <button className={styles.goalValueBtn} onClick={startEditGoal}>
              <span>{goal} ml</span>
              <span className={styles.editIcon}><EditIcon /></span>
            </button>
          )}
        </div>
      </header>

      <div className={styles.ringCard}>
        <ProgressRing
          percentage={pct}
          color="#888888"
          label={`${pct}%`}
          sublabel={`${total} ml`}
          size={170}
        />
        <div className={styles.ringMeta}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>CONSUMED</span>
            <span className={styles.metaValue}>{total} ml</span>
          </div>
          <div className={styles.metaDivider} />
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>REMAINING</span>
            <span className={styles.metaValue}>{remaining > 0 ? `${remaining} ml` : 'Done'}</span>
          </div>
          <div className={styles.metaDivider} />
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>GOAL</span>
            <span className={styles.metaValue}>{goal} ml</span>
          </div>
        </div>
        {pct >= 100 && <p className={styles.goalReached}>GOAL REACHED</p>}
      </div>

      <div className={styles.quickCard}>
        <p className={styles.sectionLabel}>Quick add</p>
        <div className={styles.quickBtns}>
          {[150, 250, 350, 500].map((ml) => (
            <button key={ml} className={styles.quickBtn} onClick={() => addWater(ml)}>
              +{ml}
            </button>
          ))}
        </div>
        <div className={styles.customRow}>
          <input
            className={styles.customInput}
            type="number"
            placeholder="Custom ml"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
          />
          <button className={styles.customAddBtn} onClick={handleCustomAdd}>Add</button>
        </div>
      </div>

      {recentEntries.length > 0 && (
        <div className={styles.logCard}>
          <p className={styles.sectionLabel}>Today's log</p>
          <ul className={styles.logList}>
            {recentEntries.map((entry, i) => (
              <li key={i} className={styles.logRow}>
                <span className={styles.logAmt}>+{entry.ml} ml</span>
                <span className={styles.logTime}>{formatTime(new Date(entry.ts))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.actionsCard}>
        <button
          className={styles.undoBtn}
          onClick={undoLast}
          disabled={!entries.length}
        >
          Undo last
        </button>
        <button className={styles.resetBtn} onClick={resetDay}>
          Reset day
        </button>
      </div>
    </div>
  )
}

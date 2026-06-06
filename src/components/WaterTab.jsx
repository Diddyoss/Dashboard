import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { todayKey } from '../utils/date'
import ProgressRing from './ProgressRing'
import styles from './WaterTab.module.css'

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
  const pct = Math.min(Math.round((total / goal) * 100), 100)
  const ringColor = '#111111'

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
      const entries = [...(prev.entries || [])]
      if (!entries.length) return prev
      const last = entries.pop()
      return { entries, total: Math.max(0, (prev.total || 0) - last.ml) }
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
          <span className={styles.goalLabel}>Daily goal:</span>
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
            <button className={styles.goalValue} onClick={startEditGoal}>
              {goal} ml
            </button>
          )}
        </div>
      </header>

      <div className={styles.ringCard}>
        <ProgressRing
          percentage={pct}
          color={ringColor}
          label={`${pct}%`}
          sublabel={`${total} ml of ${goal} ml`}
          size={170}
        />
        {pct >= 100 && <p className={styles.goalReached}>Goal reached!</p>}
      </div>

      <div className={styles.quickCard}>
        <p className={styles.sectionLabel}>Quick add</p>
        <div className={styles.quickBtns}>
          {[250, 500].map((ml) => (
            <button key={ml} className={styles.quickBtn} onClick={() => addWater(ml)}>
              +{ml} ml
            </button>
          ))}
        </div>
        <div className={styles.customRow}>
          <input
            className={styles.customInput}
            type="number"
            placeholder="Custom amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
          />
          <span className={styles.customUnit}>ml</span>
          <button className={styles.customAddBtn} onClick={handleCustomAdd}>Add</button>
        </div>
      </div>

      <div className={styles.actionsCard}>
        <button
          className={styles.undoBtn}
          onClick={undoLast}
          disabled={!waterData.entries?.length}
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

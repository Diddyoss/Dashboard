import { useLocalStorage } from '../hooks/useLocalStorage'
import { todayKey } from '../utils/date'
import SupplementSection from './SupplementSection'
import PulseDot from './PulseDot'
import styles from './HealthTab.module.css'

const TIME_SECTIONS = ['Morning', 'Afternoon', 'Evening', 'Night']

const DEFAULT_SUPPLEMENTS = { Morning: [], Afternoon: [], Evening: [], Night: [] }

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export default function HealthTab() {
  const [supplements, setSupplements] = useLocalStorage('dashboard:supplements', DEFAULT_SUPPLEMENTS)
  const [taken, setTaken] = useLocalStorage(`dashboard:supplements:taken:${todayKey()}`, {})

  const allItems = Object.values(supplements).flat()
  const totalCount = allItems.length
  const takenCount = allItems.filter((s) => taken[s.id]).length
  const progressPct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0

  const addSupplement = (section, name, dose) => {
    setSupplements((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), { id: uid(), name, dose }],
    }))
  }

  const removeSupplement = (section, id) => {
    setSupplements((prev) => ({
      ...prev,
      [section]: prev[section].filter((s) => s.id !== id),
    }))
    setTaken((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const toggleTaken = (id) =>
    setTaken((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headingRow}>
            <PulseDot color="#22c55e" />
            <h1 className={styles.heading}>Health</h1>
          </div>
          <span className={styles.fraction}>{takenCount}/{totalCount}</span>
        </div>
        <p className={styles.summary}>supplements taken today</p>
        <div className={styles.barTrack}>
          <div
            className={styles.barFill}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className={styles.barLabels}>
          <span>{progressPct}% complete</span>
          {totalCount === 0 && <span className={styles.hint}>Add supplements below</span>}
        </div>
      </header>

      {TIME_SECTIONS.map((section) => (
        <SupplementSection
          key={section}
          title={section}
          supplements={supplements[section] || []}
          taken={taken}
          onAdd={(name, dose) => addSupplement(section, name, dose)}
          onRemove={(id) => removeSupplement(section, id)}
          onToggle={toggleTaken}
        />
      ))}
    </div>
  )
}

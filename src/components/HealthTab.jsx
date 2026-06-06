import { useLocalStorage } from '../hooks/useLocalStorage'
import { todayKey } from '../utils/date'
import SupplementSection from './SupplementSection'
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
        <h1 className={styles.heading}>Health</h1>
        <p className={styles.summary}>
          <span className={styles.count}>{takenCount} of {totalCount}</span>
          {' '}supplements taken today
        </p>
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

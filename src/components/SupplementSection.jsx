import { useState } from 'react'
import styles from './SupplementSection.module.css'

const SECTION_LABELS = {
  Morning: 'AM',
  Afternoon: 'MID',
  Evening: 'PM',
  Night: 'NIGHT',
}

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export default function SupplementSection({ title, supplements, taken, onAdd, onRemove, onToggle }) {
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')
  const [dose, setDose] = useState('')

  const sectionTaken = supplements.filter((s) => taken[s.id]).length

  const handleAdd = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed, dose.trim())
    setName('')
    setDose('')
    setIsAdding(false)
  }

  const cancel = () => {
    setIsAdding(false)
    setName('')
    setDose('')
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>
          <span className={styles.tag}>{SECTION_LABELS[title]}</span>
          {title}
          {supplements.length > 0 && (
            <span className={styles.count}>{sectionTaken}/{supplements.length}</span>
          )}
        </h2>
        <button
          className={styles.addBtn}
          onClick={() => setIsAdding((s) => !s)}
          aria-label={`Add to ${title}`}
        >
          <PlusIcon />
        </button>
      </div>

      {isAdding && (
        <div className={styles.form}>
          <input
            className={styles.nameInput}
            placeholder="Supplement name"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <input
            className={styles.doseInput}
            placeholder="Dose (optional, e.g. 2000 IU)"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={cancel}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleAdd}>Add</button>
          </div>
        </div>
      )}

      <ul className={styles.list}>
        {supplements.length === 0 && !isAdding && (
          <li className={styles.empty}>No supplements — tap + to add</li>
        )}
        {supplements.map((supp) => (
          <li key={supp.id} className={`${styles.item} ${taken[supp.id] ? styles.done : ''}`}>
            <button
              className={`${styles.checkbox} ${taken[supp.id] ? styles.checked : ''}`}
              onClick={() => onToggle(supp.id)}
              aria-label={taken[supp.id] ? 'Mark untaken' : 'Mark taken'}
            >
              {taken[supp.id] && <CheckIcon />}
            </button>
            <div className={styles.info}>
              <span className={styles.suppName}>{supp.name}</span>
              {supp.dose && <span className={styles.suppDose}>{supp.dose}</span>}
            </div>
            <button className={styles.removeBtn} onClick={() => onRemove(supp.id)} aria-label="Remove">
              <XIcon />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

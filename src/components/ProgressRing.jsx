import { useState, useEffect } from 'react'
import styles from './ProgressRing.module.css'

export default function ProgressRing({ percentage, color, title, label, sublabel, size = 130 }) {
  const stroke = 13
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const pct = Math.min(Math.max(percentage, 0), 100)
  const offset = mounted
    ? circumference - (pct / 100) * circumference
    : circumference

  return (
    <div className={styles.wrapper}>
      {title && <p className={styles.title}>{title}</p>}
      <div className={styles.ringWrap}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            className={styles.track}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            stroke={color}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              transition: mounted
                ? 'stroke-dashoffset 0.7s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease'
                : 'none',
            }}
          />
        </svg>
        <div className={styles.center}>
          <span className={styles.pct}>{label}</span>
          {sublabel && <span className={styles.sub}>{sublabel}</span>}
        </div>
      </div>
    </div>
  )
}

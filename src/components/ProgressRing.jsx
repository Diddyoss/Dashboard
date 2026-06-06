import { useRef, useEffect } from 'react'
import styles from './ProgressRing.module.css'

export default function ProgressRing({ percentage, color, title, label, sublabel, size = 130 }) {
  const stroke = 13
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const circleRef = useRef(null)
  const didMount = useRef(false)

  // Mount animation: paint empty ring first, then animate to target via double-RAF
  useEffect(() => {
    const el = circleRef.current
    if (!el) return

    el.style.transition = 'none'
    el.style.strokeDashoffset = circumference

    let r2
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        el.style.transition = 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1), stroke 0.5s ease'
        const pct = Math.min(Math.max(percentage, 0), 100)
        el.style.strokeDashoffset = circumference - (pct / 100) * circumference
        didMount.current = true
      })
    })
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Animate on every subsequent percentage change (e.g. minute ticks, todo checks)
  useEffect(() => {
    if (!didMount.current) return
    const el = circleRef.current
    if (!el) return
    const pct = Math.min(Math.max(percentage, 0), 100)
    el.style.strokeDashoffset = circumference - (pct / 100) * circumference
  }, [percentage, circumference])

  return (
    <div className={styles.wrapper}>
      {title && <p className={styles.title}>{title}</p>}
      <div className={styles.ringWrap}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className={styles.track} />
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            stroke={color}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
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

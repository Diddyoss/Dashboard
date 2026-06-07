import styles from './PulseDot.module.css'

export default function PulseDot({ color }) {
  return (
    <span className={styles.wrapper} aria-hidden="true">
      <span className={styles.ping} style={{ background: color }} />
      <span className={styles.dot} style={{ background: color }} />
    </span>
  )
}

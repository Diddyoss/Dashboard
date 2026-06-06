import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import Nav from './components/Nav'
import HomeTab from './components/HomeTab'
import HealthTab from './components/HealthTab'
import WaterTab from './components/WaterTab'
import styles from './App.module.css'

const DEFAULT_SETTINGS = {
  wakeTime: '07:00',
  sleepTime: '23:00',
  waterGoal: 2000,
}

export default function App() {
  const [tab, setTab] = useState('home')
  const [settings, setSettings] = useLocalStorage('dashboard:settings', DEFAULT_SETTINGS)

  return (
    <div className={styles.app}>
      <main className={styles.main}>
        {tab === 'home' && <HomeTab settings={settings} setSettings={setSettings} />}
        {tab === 'health' && <HealthTab />}
        {tab === 'water' && <WaterTab settings={settings} setSettings={setSettings} />}
      </main>
      <Nav activeTab={tab} onTabChange={setTab} />
    </div>
  )
}

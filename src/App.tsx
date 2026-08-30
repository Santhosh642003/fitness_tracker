import { useState } from 'react'
import { TopBar, type Tab } from './components/TopBar'
import { SettingsPanel } from './components/SettingsPanel'
import { useAppState } from './lib/useAppState'
import { Today } from './screens/Today'
import { Tracker } from './screens/Tracker'
import { Program } from './screens/Program'
import { Kitchen } from './screens/Kitchen'

function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { state, setState } = useAppState()

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopBar active={tab} onChange={setTab} onOpenSettings={() => setSettingsOpen(true)} />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
        {tab === 'today' && <Today state={state} setState={setState} onNavigate={setTab} />}
        {tab === 'tracker' && <Tracker state={state} setState={setState} />}
        {tab === 'program' && <Program state={state} setState={setState} />}
        {tab === 'kitchen' && <Kitchen state={state} setState={setState} />}
      </main>
      {settingsOpen && (
        <SettingsPanel state={state} setState={setState} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  )
}

export default App

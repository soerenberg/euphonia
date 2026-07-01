import { useState } from 'react'
import { BracketTabs, type BracketTab } from './components/BracketTabs'
import { Panel } from './components/Panel'
import { FunctionKeyFooter, type FunctionKey } from './components/FunctionKeyFooter'
import { HamburgerMenu } from './components/HamburgerMenu'
import { useSettings } from './store/SettingsContext'
import { PitchMainTab } from './tabs/PitchMainTab'
import { FreeTalkTab } from './tabs/FreeTalkTab'
import { CompareTab } from './tabs/CompareTab'
import './App.css'

const TABS: BracketTab[] = [
  { id: 'pitch', label: 'PITCH' },
  { id: 'talk', label: 'TALK' },
  { id: 'compare', label: 'COMPARE' },
]

function App() {
  const [activeId, setActiveId] = useState('pitch')
  const [menuOpen, setMenuOpen] = useState(false)
  const { timeWindowSeconds, setTimeWindowSeconds } = useSettings()

  const footerKeys: FunctionKey[] = [{ key: 'F1', label: 'MENU', onPress: () => setMenuOpen((open) => !open) }]
  if (activeId === 'pitch') {
    footerKeys.push({ key: 'F2', label: 'CALIBRATE', onPress: () => alert('Calibration — not built yet (Phase 4)') })
  } else if (activeId === 'talk') {
    footerKeys.push({ key: 'F3', label: 'NEXT', onPress: () => alert('Next prompt — not built yet (Phase 5)') })
  } else if (activeId === 'compare') {
    footerKeys.push({ key: 'F10', label: 'SAVE', onPress: () => alert('Save clip — not built yet (Phase 6)') })
  }

  return (
    <div className="app">
      <BracketTabs tabs={TABS} activeId={activeId} onSelect={setActiveId} />
      <Panel title="Euphonia">
        {activeId === 'pitch' && <PitchMainTab />}
        {activeId === 'talk' && <FreeTalkTab />}
        {activeId === 'compare' && <CompareTab />}
      </Panel>
      <FunctionKeyFooter keys={footerKeys} />
      <HamburgerMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        timeWindowSeconds={timeWindowSeconds}
        onChangeTimeWindow={setTimeWindowSeconds}
      />
    </div>
  )
}

export default App

import { useState } from 'react'
import { BracketTabs, type BracketTab } from './components/BracketTabs'
import { Panel } from './components/Panel'
import { FunctionKeyFooter, type FunctionKey } from './components/FunctionKeyFooter'
import { HamburgerMenu } from './components/HamburgerMenu'
import { CalibrationFlow, type CalibrationMode } from './components/CalibrationFlow'
import { useSettings } from './store/SettingsContext'
import { PitchMainTab } from './tabs/PitchMainTab'
import { FreeTalkTab } from './tabs/FreeTalkTab'
import { CompareTab } from './tabs/CompareTab'
import { generateFor, pickDifferent, keyOf, type CategoryId } from './tabs/freeTalkContent'
import './App.css'

const TABS: BracketTab[] = [
  { id: 'pitch', label: 'PITCH' },
  { id: 'talk', label: 'TALK' },
  { id: 'compare', label: 'COMPARE' },
]

function App() {
  const [activeId, setActiveId] = useState('pitch')
  const [menuOpen, setMenuOpen] = useState(false)
  const [calibrationMode, setCalibrationMode] = useState<CalibrationMode | null | 'closed'>('closed')
  const [freeTalkCategory, setFreeTalkCategory] = useState<CategoryId>('smalltalk')
  const [freeTalkContent, setFreeTalkContent] = useState(() => generateFor('smalltalk'))
  const {
    timeWindowSeconds,
    setTimeWindowSeconds,
    targetRangeHz,
    setTargetRangeHz,
    baselineRangeHz,
  } = useSettings()

  const launchCalibration = (mode: CalibrationMode | null) => {
    setMenuOpen(false)
    setCalibrationMode(mode)
  }

  const handleFreeTalkCategoryChange = (category: CategoryId) => {
    setFreeTalkCategory(category)
    setFreeTalkContent(generateFor(category))
  }

  const handleFreeTalkNext = () => {
    setFreeTalkContent((prev) => pickDifferent(freeTalkCategory, keyOf(prev)))
  }

  const footerKeys: FunctionKey[] = [{ key: 'F1', label: 'MENU', onPress: () => setMenuOpen((open) => !open) }]
  if (activeId === 'pitch') {
    footerKeys.push({ key: 'F2', label: 'CALIBRATE', onPress: () => launchCalibration(null) })
  } else if (activeId === 'talk') {
    footerKeys.push({ key: 'F3', label: 'NEXT', onPress: handleFreeTalkNext })
  } else if (activeId === 'compare') {
    footerKeys.push({ key: 'F10', label: 'SAVE', onPress: () => alert('Save clip — not built yet (Phase 6)') })
  }

  return (
    <div className="app">
      <BracketTabs tabs={TABS} activeId={activeId} onSelect={setActiveId} />
      <Panel title="Euphonia">
        {activeId === 'pitch' && <PitchMainTab />}
        {activeId === 'talk' && (
          <FreeTalkTab
            category={freeTalkCategory}
            content={freeTalkContent}
            onCategoryChange={handleFreeTalkCategoryChange}
            onNext={handleFreeTalkNext}
          />
        )}
        {activeId === 'compare' && <CompareTab />}
      </Panel>
      <FunctionKeyFooter keys={footerKeys} />
      <HamburgerMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        timeWindowSeconds={timeWindowSeconds}
        onChangeTimeWindow={setTimeWindowSeconds}
        targetRangeHz={targetRangeHz}
        onChangeTargetRange={setTargetRangeHz}
        baselineRangeHz={baselineRangeHz}
        onLaunchCalibration={launchCalibration}
      />
      {calibrationMode !== 'closed' && (
        <CalibrationFlow mode={calibrationMode} onClose={() => setCalibrationMode('closed')} />
      )}
    </div>
  )
}

export default App

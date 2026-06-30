import { useState } from 'react'
import { Panel } from '../components/Panel'
import { BracketTabs } from '../components/BracketTabs'
import { FunctionKeyFooter, type FunctionKey } from '../components/FunctionKeyFooter'
import { AudioTestPage } from './AudioTestPage'

const TABS = [
  { id: 'pitch', label: 'PITCH' },
  { id: 'talk', label: 'TALK' },
  { id: 'compare', label: 'COMPARE' },
]

const FOOTER_KEYS: Record<string, FunctionKey[]> = {
  pitch: [
    { key: 'F1', label: 'MENU', onPress: () => alert('Menu — not built yet (Phase 4)') },
    { key: 'F2', label: 'CALIBRATE', onPress: () => alert('Calibration — not built yet (Phase 4)') },
  ],
  talk: [
    { key: 'F1', label: 'MENU', onPress: () => alert('Menu — not built yet (Phase 4)') },
    { key: 'F3', label: 'NEXT', onPress: () => alert('Next prompt — not built yet (Phase 5)') },
  ],
  compare: [
    { key: 'F1', label: 'MENU', onPress: () => alert('Menu — not built yet (Phase 4)') },
    { key: 'F10', label: 'SAVE', onPress: () => alert('Save clip — not built yet (Phase 6)') },
  ],
}

export function ChromeDemoPage() {
  const [activeId, setActiveId] = useState('pitch')

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <BracketTabs tabs={TABS} activeId={activeId} onSelect={setActiveId} />
      <Panel title="Euphonia">
        {activeId === 'pitch' && <AudioTestPage />}
        {activeId === 'talk' && <p>Free Talk — not built yet (Phase 5).</p>}
        {activeId === 'compare' && <p>Compare — not built yet (Phase 6).</p>}
      </Panel>
      <FunctionKeyFooter keys={FOOTER_KEYS[activeId]} />
    </div>
  )
}

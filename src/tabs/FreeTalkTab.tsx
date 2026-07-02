import { useState } from 'react'
import { CATEGORIES, type CategoryId, type Content } from './freeTalkContent'
import { FloatingPitchWidget } from '../components/FloatingPitchWidget'
import './FreeTalkTab.css'

interface FreeTalkTabProps {
  category: CategoryId
  content: Content
  onCategoryChange: (category: CategoryId) => void
  onNext: () => void
}

export function FreeTalkTab({ category, content, onCategoryChange, onNext }: FreeTalkTabProps) {
  const [widgetVisible, setWidgetVisible] = useState(true)

  return (
    <div className="free-talk-tab">
      <div className="free-talk-tab-controls">
        <select
          className="free-talk-tab-select"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as CategoryId)}
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="free-talk-tab-widget-toggle"
          onClick={() => setWidgetVisible((v) => !v)}
        >
          [ WIDGET {widgetVisible ? 'ON' : 'OFF'} ]
        </button>
      </div>

      <div className="free-talk-tab-content">
        {content.kind === 'prompt' ? (
          <p className="free-talk-tab-prompt">{content.prompt.text}</p>
        ) : (
          <p className="free-talk-tab-emoji">
            {content.combo.subject} {content.combo.location} {content.combo.action} {content.combo.object}
          </p>
        )}
      </div>

      <button type="button" className="free-talk-tab-button" onClick={onNext}>
        Next
      </button>

      {widgetVisible && <FloatingPitchWidget onHide={() => setWidgetVisible(false)} />}
    </div>
  )
}

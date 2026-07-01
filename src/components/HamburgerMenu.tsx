import { Panel } from './Panel'
import './HamburgerMenu.css'

const TIME_WINDOW_OPTIONS = [10, 30, 60]

interface HamburgerMenuProps {
  open: boolean
  onClose: () => void
  timeWindowSeconds: number
  onChangeTimeWindow: (seconds: number) => void
}

export function HamburgerMenu({ open, onClose, timeWindowSeconds, onChangeTimeWindow }: HamburgerMenuProps) {
  if (!open) return null

  return (
    <div className="hamburger-menu-overlay" onClick={onClose}>
      <div className="hamburger-menu" onClick={(e) => e.stopPropagation()}>
        <Panel title="Menu">
          <p className="hamburger-menu-section-label">TIME WINDOW</p>
          <div className="hamburger-menu-options">
            {TIME_WINDOW_OPTIONS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                className="hamburger-menu-option"
                aria-pressed={timeWindowSeconds === seconds}
                onClick={() => onChangeTimeWindow(seconds)}
              >
                {seconds}S
              </button>
            ))}
          </div>
          <button type="button" className="hamburger-menu-close" onClick={onClose}>
            [ CLOSE ]
          </button>
        </Panel>
      </div>
    </div>
  )
}

import { Panel } from './Panel'
import { TargetRangeSettings } from './TargetRangeSettings'
import type { TargetRange } from '../audio/pitchStats'
import type { CalibrationMode } from './CalibrationFlow'
import './HamburgerMenu.css'

const TIME_WINDOW_OPTIONS = [10, 30, 60]

function formatRange(range: TargetRange | null): string {
  if (!range || (range.min == null && range.max == null)) return 'not calibrated'
  return `${range.min?.toFixed(0) ?? '–'}–${range.max?.toFixed(0) ?? '–'} Hz`
}

interface HamburgerMenuProps {
  open: boolean
  onClose: () => void
  timeWindowSeconds: number
  onChangeTimeWindow: (seconds: number) => void
  targetRangeHz: TargetRange
  onChangeTargetRange: (range: TargetRange) => void
  baselineRangeHz: TargetRange | null
  onLaunchCalibration: (mode: CalibrationMode) => void
}

export function HamburgerMenu({
  open,
  onClose,
  timeWindowSeconds,
  onChangeTimeWindow,
  targetRangeHz,
  onChangeTargetRange,
  baselineRangeHz,
  onLaunchCalibration,
}: HamburgerMenuProps) {
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

          <p className="hamburger-menu-section-label">TARGET RANGE</p>
          <TargetRangeSettings value={targetRangeHz} onChange={onChangeTargetRange} />

          <p className="hamburger-menu-section-label">YOUR BASELINE</p>
          <p className="hamburger-menu-readout">{formatRange(baselineRangeHz)}</p>

          <p className="hamburger-menu-section-label">CALIBRATE</p>
          <div className="hamburger-menu-options">
            <button
              type="button"
              className="hamburger-menu-option"
              onClick={() => onLaunchCalibration('baseline')}
            >
              Baseline
            </button>
            <button type="button" className="hamburger-menu-option" onClick={() => onLaunchCalibration('target')}>
              Target
            </button>
          </div>

          <button type="button" className="hamburger-menu-close" onClick={onClose}>
            [ CLOSE ]
          </button>
        </Panel>
      </div>
    </div>
  )
}

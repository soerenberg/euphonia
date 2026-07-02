import { usePitchStream } from '../audio/usePitchStream'
import { useSessionSamples } from '../audio/useSessionSamples'
import { CLARITY_THRESHOLD } from '../audio/pitchStats'
import { useSettings } from '../store/SettingsContext'
import { SteppedPitchGraph } from './SteppedPitchGraph'
import './FloatingPitchWidget.css'

const WIDGET_WINDOW_SECONDS = 8

interface FloatingPitchWidgetProps {
  onHide: () => void
}

// Hiding the widget unmounts it, which stops its mic session via
// usePitchStream's own unmount cleanup — no separate Stop button needed.
export function FloatingPitchWidget({ onHide }: FloatingPitchWidgetProps) {
  const { status, pitch, clarity, error, start } = usePitchStream()
  const { targetRangeHz } = useSettings()
  const samples = useSessionSamples(status, pitch, clarity)
  const currentPitch = clarity != null && clarity >= CLARITY_THRESHOLD ? pitch : null

  return (
    <div className="floating-pitch-widget">
      <div className="floating-pitch-widget-header">
        <span className="floating-pitch-widget-hz">
          {currentPitch != null ? `${currentPitch.toFixed(0)} Hz` : '—'}
        </span>
        <button type="button" className="floating-pitch-widget-close" onClick={onHide} aria-label="Hide pitch widget">
          ×
        </button>
      </div>

      {status === 'idle' || status === 'stopped' ? (
        <button type="button" className="floating-pitch-widget-start" onClick={start}>
          Start
        </button>
      ) : (
        <SteppedPitchGraph series={[{ samples }]} windowSeconds={WIDGET_WINDOW_SECONDS} targetRange={targetRangeHz} />
      )}

      {error && <p className="floating-pitch-widget-error">{error}</p>}
    </div>
  )
}

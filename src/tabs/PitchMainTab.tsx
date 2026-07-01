import { usePitchStream } from '../audio/usePitchStream'
import { useSessionSamples } from '../audio/useSessionSamples'
import { CLARITY_THRESHOLD, computeSessionStats } from '../audio/pitchStats'
import { useSettings } from '../store/SettingsContext'
import { SteppedPitchGraph } from '../components/SteppedPitchGraph'
import './PitchMainTab.css'

function formatHz(hz: number | null): string {
  return hz != null ? `${hz.toFixed(1)} Hz` : '—'
}

export function PitchMainTab() {
  const { status, pitch, clarity, error, start, stop } = usePitchStream()
  const { timeWindowSeconds, targetRangeHz } = useSettings()
  const samples = useSessionSamples(status, pitch, clarity)

  const currentPitch = clarity != null && clarity >= CLARITY_THRESHOLD ? pitch : null
  const { average, percentInRange } = computeSessionStats(samples, targetRangeHz)
  const hasTarget = targetRangeHz.min != null || targetRangeHz.max != null

  return (
    <div className="pitch-main-tab">
      <div className="pitch-main-tab-controls">
        {status === 'idle' || status === 'stopped' ? (
          <button type="button" className="pitch-main-tab-button" onClick={start}>
            Start mic
          </button>
        ) : (
          <button
            type="button"
            className="pitch-main-tab-button"
            onClick={stop}
            disabled={status === 'requesting-permission'}
          >
            Stop
          </button>
        )}
        <span className="pitch-main-tab-status">status: {status}</span>
      </div>

      {error && <p className="pitch-main-tab-error">error: {error}</p>}

      <SteppedPitchGraph samples={samples} windowSeconds={timeWindowSeconds} targetRange={targetRangeHz} />

      <div className="pitch-main-tab-stats">
        <div>
          <p className="pitch-main-tab-stat-label">CURRENT</p>
          <p className="pitch-main-tab-stat-value">{formatHz(currentPitch)}</p>
        </div>
        <div>
          <p className="pitch-main-tab-stat-label">AVERAGE</p>
          <p className="pitch-main-tab-stat-value">{formatHz(average)}</p>
        </div>
        <div>
          <p className="pitch-main-tab-stat-label">% IN RANGE</p>
          <p className="pitch-main-tab-stat-value">
            {!hasTarget ? 'target not set' : percentInRange != null ? `${percentInRange.toFixed(0)}%` : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}

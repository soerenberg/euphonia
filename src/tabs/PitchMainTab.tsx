import { useEffect, useRef, useState } from 'react'
import { usePitchStream } from '../audio/usePitchStream'
import { CLARITY_THRESHOLD, computeSessionStats, type PitchSample } from '../audio/pitchStats'
import { useSettings } from '../store/SettingsContext'
import { SteppedPitchGraph } from '../components/SteppedPitchGraph'
import './PitchMainTab.css'

function formatHz(hz: number | null): string {
  return hz != null ? `${hz.toFixed(1)} Hz` : '—'
}

export function PitchMainTab() {
  const { status, pitch, clarity, error, start, stop } = usePitchStream()
  const { timeWindowSeconds, targetRangeHz } = useSettings()
  const [samples, setSamples] = useState<PitchSample[]>([])
  const prevStatusRef = useRef(status)

  useEffect(() => {
    if (status === 'running' && prevStatusRef.current !== 'running') {
      setSamples([])
    }
    prevStatusRef.current = status
  }, [status])

  useEffect(() => {
    if (status !== 'running' || pitch == null || clarity == null) return
    setSamples((prev) => [...prev, { t: Date.now(), pitch, clarity }])
  }, [status, pitch, clarity])

  const currentPitch = clarity != null && clarity >= CLARITY_THRESHOLD ? pitch : null
  const { average, percentInRange } = computeSessionStats(samples, targetRangeHz)

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
            {percentInRange != null ? `${percentInRange.toFixed(0)}%` : 'target not set'}
          </p>
        </div>
      </div>
    </div>
  )
}

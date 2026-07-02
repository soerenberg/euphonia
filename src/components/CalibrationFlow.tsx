import { useState } from 'react'
import { Panel } from './Panel'
import { usePitchStream } from '../audio/usePitchStream'
import { useSessionSamples } from '../audio/useSessionSamples'
import { computePercentileRange, type TargetRange } from '../audio/pitchStats'
import { useSettings } from '../store/SettingsContext'
import './CalibrationFlow.css'

export type CalibrationMode = 'baseline' | 'target'
type Step = 'choose-mode' | 'recording' | 'review'
type ReviewResult = TargetRange | 'insufficient'

interface CalibrationFlowProps {
  mode: CalibrationMode | null
  onClose: () => void
}

export function CalibrationFlow({ mode: initialMode, onClose }: CalibrationFlowProps) {
  const [mode, setMode] = useState<CalibrationMode | null>(initialMode)
  const [step, setStep] = useState<Step>(initialMode ? 'recording' : 'choose-mode')
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null)
  const { status, pitch, clarity, start, stop } = usePitchStream()
  const samples = useSessionSamples(status, pitch, clarity)
  const { setTargetRangeHz, setBaselineRangeHz } = useSettings()

  const chooseMode = (m: CalibrationMode) => {
    setMode(m)
    setStep('recording')
  }

  const finishRecording = () => {
    stop()
    setReviewResult(computePercentileRange(samples) ?? 'insufficient')
    setStep('review')
  }

  const retry = () => {
    setReviewResult(null)
    setStep('recording')
  }

  const confirm = () => {
    if (mode && reviewResult && reviewResult !== 'insufficient') {
      if (mode === 'target') setTargetRangeHz(reviewResult)
      else setBaselineRangeHz(reviewResult)
    }
    onClose()
  }

  return (
    <div className="calibration-flow-overlay" onClick={onClose}>
      <div className="calibration-flow" onClick={(e) => e.stopPropagation()}>
        <Panel title="Calibrate">
          {step === 'choose-mode' && (
            <div className="calibration-flow-actions">
              <button type="button" className="calibration-flow-button" onClick={() => chooseMode('baseline')}>
                Calibrate baseline
              </button>
              <button type="button" className="calibration-flow-button" onClick={() => chooseMode('target')}>
                Calibrate target
              </button>
            </div>
          )}

          {step === 'recording' && (
            <>
              <p>
                {mode === 'baseline'
                  ? 'Speak in your current, natural voice for a few seconds, then tap Stop.'
                  : 'Speak in your practice voice for a few seconds, then tap Stop.'}
              </p>
              <p className="calibration-flow-status">status: {status}</p>
              <div className="calibration-flow-actions">
                {status === 'idle' || status === 'stopped' ? (
                  <button type="button" className="calibration-flow-button" onClick={start}>
                    Start
                  </button>
                ) : (
                  <button
                    type="button"
                    className="calibration-flow-button"
                    onClick={finishRecording}
                    disabled={status === 'requesting-permission'}
                  >
                    Stop
                  </button>
                )}
              </div>
            </>
          )}

          {step === 'review' && (
            <>
              {reviewResult === 'insufficient' ? (
                <p>Not enough clear voice detected — try speaking more clearly or for longer.</p>
              ) : (
                <p>
                  Detected range: {reviewResult?.min?.toFixed(0)}–{reviewResult?.max?.toFixed(0)} Hz
                </p>
              )}
              <div className="calibration-flow-actions">
                <button type="button" className="calibration-flow-button" onClick={retry}>
                  Retry
                </button>
                {reviewResult !== 'insufficient' && (
                  <button type="button" className="calibration-flow-button" onClick={confirm}>
                    Confirm
                  </button>
                )}
              </div>
            </>
          )}

          <button type="button" className="calibration-flow-close" onClick={onClose}>
            [ CLOSE ]
          </button>
        </Panel>
      </div>
    </div>
  )
}

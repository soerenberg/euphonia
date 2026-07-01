import { useEffect, useRef, useState } from 'react'
import type { PitchStreamStatus } from './usePitchStream'
import type { PitchSample } from './pitchStats'

// Accumulates samples while `status` is 'running', clearing on every fresh
// start (idle/stopped -> running) so each recording begins its own session.
export function useSessionSamples(
  status: PitchStreamStatus,
  pitch: number | null,
  clarity: number | null,
): PitchSample[] {
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

  return samples
}

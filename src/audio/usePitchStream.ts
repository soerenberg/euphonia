import { useCallback, useEffect, useRef, useState } from 'react'
import { openPitchPipeline, closePitchPipeline, type PitchPipeline } from './pitchPipeline'

export type PitchStreamStatus = 'idle' | 'requesting-permission' | 'running' | 'stopped' | 'error'

interface PitchStreamState {
  status: PitchStreamStatus
  pitch: number | null
  clarity: number | null
  rms: number | null
  error: string | null
  sampleRate: number | null
}

interface PitchMessage {
  pitch: number
  clarity: number
  rms: number
}

const initialState: PitchStreamState = {
  status: 'idle',
  pitch: null,
  clarity: null,
  rms: null,
  error: null,
  sampleRate: null,
}

export function usePitchStream() {
  const [state, setState] = useState<PitchStreamState>(initialState)
  const pipelineRef = useRef<PitchPipeline | null>(null)

  // Must only be called from inside a user-gesture handler (e.g. a button
  // onClick) — iOS Safari refuses to start an AudioContext otherwise.
  const start = useCallback(async () => {
    setState((s) => ({ ...s, status: 'requesting-permission', error: null }))
    try {
      const pipeline = await openPitchPipeline()
      pipelineRef.current = pipeline

      pipeline.workletNode.port.onmessage = (event: MessageEvent<PitchMessage>) => {
        const { pitch, clarity, rms } = event.data
        setState((s) => ({ ...s, pitch, clarity, rms }))
      }

      setState((s) => ({ ...s, status: 'running', sampleRate: pipeline.audioContext.sampleRate }))
    } catch (err) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      }))
    }
  }, [])

  const stop = useCallback(() => {
    if (pipelineRef.current) closePitchPipeline(pipelineRef.current)
    pipelineRef.current = null
    setState((s) => ({ ...initialState, status: 'stopped', sampleRate: s.sampleRate }))
  }, [])

  // Consumers that unmount without calling stop() (e.g. hiding an overlay
  // mid-recording) shouldn't leave the mic/AudioContext running invisibly.
  useEffect(() => {
    return () => {
      if (pipelineRef.current) closePitchPipeline(pipelineRef.current)
    }
  }, [])

  return { ...state, start, stop }
}

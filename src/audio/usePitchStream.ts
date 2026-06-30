import { useCallback, useRef, useState } from 'react'
import workletUrl from './pitchWorklet.ts?worker&url'

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
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Must only be called from inside a user-gesture handler (e.g. a button
  // onClick) — iOS Safari refuses to start an AudioContext otherwise.
  const start = useCallback(async () => {
    setState((s) => ({ ...s, status: 'requesting-permission', error: null }))
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      streamRef.current = stream

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      await audioContext.audioWorklet.addModule(workletUrl)
      await audioContext.resume()

      const source = audioContext.createMediaStreamSource(stream)
      const workletNode = new AudioWorkletNode(audioContext, 'pitch-processor')
      workletNode.port.onmessage = (event: MessageEvent<PitchMessage>) => {
        const { pitch, clarity, rms } = event.data
        setState((s) => ({ ...s, pitch, clarity, rms }))
      }
      source.connect(workletNode)
      // Silent (process() never writes output) — connecting to destination
      // just keeps this node in the pulled render graph so it keeps running.
      workletNode.connect(audioContext.destination)

      setState((s) => ({ ...s, status: 'running', sampleRate: audioContext.sampleRate }))
    } catch (err) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      }))
    }
  }, [])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    void audioContextRef.current?.close()
    audioContextRef.current = null
    setState((s) => ({ ...initialState, status: 'stopped', sampleRate: s.sampleRate }))
  }, [])

  return { ...state, start, stop }
}

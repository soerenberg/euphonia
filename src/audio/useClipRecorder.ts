import { useCallback, useEffect, useRef, useState } from 'react'
import { openPitchPipeline, closePitchPipeline, type PitchPipeline } from './pitchPipeline'
import type { PitchSample } from './pitchStats'

export type ClipRecorderStatus = 'idle' | 'requesting-permission' | 'recording' | 'error'

export interface RecordedClip {
  blob: Blob
  mimeType: string
  durationMs: number
  samples: PitchSample[]
}

const CANDIDATE_MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']

function pickMimeType(): string {
  return CANDIDATE_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
}

export function useClipRecorder() {
  const [status, setStatus] = useState<ClipRecorderStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const pipelineRef = useRef<PitchPipeline | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const samplesRef = useRef<PitchSample[]>([])
  const startedAtRef = useRef(0)

  const start = useCallback(async () => {
    setStatus('requesting-permission')
    setError(null)
    try {
      const pipeline = await openPitchPipeline()
      pipelineRef.current = pipeline
      samplesRef.current = []
      chunksRef.current = []

      pipeline.workletNode.port.onmessage = (event: MessageEvent<{ pitch: number; clarity: number }>) => {
        const { pitch, clarity } = event.data
        samplesRef.current.push({ t: Date.now(), pitch, clarity })
      }

      const mimeType = pickMimeType()
      const recorder = new MediaRecorder(pipeline.stream, mimeType ? { mimeType } : undefined)
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.start()
      recorderRef.current = recorder
      startedAtRef.current = Date.now()

      setStatus('recording')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [])

  // Don't leave the mic/MediaRecorder running if the tab unmounts mid-recording.
  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
      if (pipelineRef.current) closePitchPipeline(pipelineRef.current)
    }
  }, [])

  const stop = useCallback((): Promise<RecordedClip | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current
      const pipeline = pipelineRef.current
      if (!recorder || !pipeline) {
        resolve(null)
        return
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        const durationMs = Date.now() - startedAtRef.current
        closePitchPipeline(pipeline)
        pipelineRef.current = null
        recorderRef.current = null
        setStatus('idle')
        resolve({ blob, mimeType: recorder.mimeType, durationMs, samples: samplesRef.current })
      }
      recorder.stop()
    })
  }, [])

  return { status, error, start, stop }
}

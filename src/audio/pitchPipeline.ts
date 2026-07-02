import workletUrl from './pitchWorklet.ts?worker&url'

export interface PitchPipeline {
  audioContext: AudioContext
  stream: MediaStream
  workletNode: AudioWorkletNode
}

// Must only be called from inside a user-gesture handler (e.g. a button
// onClick) — iOS Safari refuses to start an AudioContext otherwise.
export async function openPitchPipeline(): Promise<PitchPipeline> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  })

  const audioContext = new AudioContext()
  await audioContext.audioWorklet.addModule(workletUrl)
  await audioContext.resume()

  const source = audioContext.createMediaStreamSource(stream)
  const workletNode = new AudioWorkletNode(audioContext, 'pitch-processor')
  source.connect(workletNode)
  // Silent (process() never writes output) — connecting to destination
  // just keeps this node in the pulled render graph so it keeps running.
  workletNode.connect(audioContext.destination)

  return { audioContext, stream, workletNode }
}

export function closePitchPipeline(pipeline: PitchPipeline): void {
  pipeline.stream.getTracks().forEach((track) => track.stop())
  void pipeline.audioContext.close()
}

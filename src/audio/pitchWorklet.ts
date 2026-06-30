import { PitchDetector } from 'pitchy'

// 2048 samples covers 2+ full cycles down to ~43Hz at 44.1kHz, well below
// the speaking-voice range this app cares about.
const WINDOW_SIZE = 2048
const ANALYSIS_INTERVAL_SECONDS = 0.05

class PitchProcessor extends AudioWorkletProcessor {
  private readonly detector = PitchDetector.forFloat32Array(WINDOW_SIZE)
  private readonly window = new Float32Array(WINDOW_SIZE)
  private readonly hopSize = Math.round(sampleRate * ANALYSIS_INTERVAL_SECONDS)
  private samplesSinceAnalysis = 0

  process(inputs: Float32Array[][]): boolean {
    const input = inputs[0]?.[0]
    if (!input || input.length === 0) return true

    this.window.set(this.window.subarray(input.length))
    this.window.set(input, WINDOW_SIZE - input.length)

    this.samplesSinceAnalysis += input.length
    if (this.samplesSinceAnalysis < this.hopSize) return true
    this.samplesSinceAnalysis = 0

    let sumSquares = 0
    for (let i = 0; i < WINDOW_SIZE; i++) {
      sumSquares += this.window[i] * this.window[i]
    }
    const rms = Math.sqrt(sumSquares / WINDOW_SIZE)

    const [pitch, clarity] = this.detector.findPitch(this.window, sampleRate)
    this.port.postMessage({ pitch, clarity, rms })

    return true
  }
}

registerProcessor('pitch-processor', PitchProcessor)

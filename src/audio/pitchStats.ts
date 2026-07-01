export interface PitchSample {
  t: number
  pitch: number
  clarity: number
}

export interface TargetRange {
  min: number | null
  max: number | null
}

export const CLARITY_THRESHOLD = 0.6

export function isVoiced(sample: PitchSample): boolean {
  return sample.clarity >= CLARITY_THRESHOLD
}

export function isInRange(pitch: number, range: TargetRange): boolean {
  if (range.min != null && pitch < range.min) return false
  if (range.max != null && pitch > range.max) return false
  return true
}

export interface SessionStats {
  average: number | null
  percentInRange: number | null
}

export function computeSessionStats(samples: PitchSample[], range: TargetRange): SessionStats {
  const voiced = samples.filter(isVoiced)
  if (voiced.length === 0) return { average: null, percentInRange: null }

  const average = voiced.reduce((sum, s) => sum + s.pitch, 0) / voiced.length

  const percentInRange =
    range.min == null && range.max == null
      ? null
      : (voiced.filter((s) => isInRange(s.pitch, range)).length / voiced.length) * 100

  return { average, percentInRange }
}

export const MIN_CALIBRATION_SAMPLES = 10

export function computePercentileRange(
  samples: PitchSample[],
  lowerPct = 10,
  upperPct = 90,
): TargetRange | null {
  const voiced = samples.filter(isVoiced)
  if (voiced.length < MIN_CALIBRATION_SAMPLES) return null

  const pitches = voiced.map((s) => s.pitch).sort((a, b) => a - b)
  const at = (pct: number) => pitches[Math.floor((pct / 100) * (pitches.length - 1))]

  return { min: at(lowerPct), max: at(upperPct) }
}

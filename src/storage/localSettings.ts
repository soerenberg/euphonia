import type { TargetRange } from '../audio/pitchStats'

const STORAGE_KEY = 'euphonia.settings.v1'

export interface StoredSettings {
  timeWindowSeconds: number
  targetRangeHz: TargetRange
  baselineRangeHz: TargetRange | null
}

export function loadSettings(): Partial<StoredSettings> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveSettings(settings: StoredSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // localStorage unavailable (e.g. private browsing) — settings just won't persist.
  }
}

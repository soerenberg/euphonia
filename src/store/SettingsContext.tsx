import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { TargetRange } from '../audio/pitchStats'
import { loadSettings, saveSettings } from '../storage/localSettings'

interface SettingsValue {
  timeWindowSeconds: number
  targetRangeHz: TargetRange
  baselineRangeHz: TargetRange | null
  setTimeWindowSeconds: (seconds: number) => void
  setTargetRangeHz: (range: TargetRange) => void
  setBaselineRangeHz: (range: TargetRange) => void
}

const DEFAULT_TARGET_RANGE: TargetRange = { min: null, max: null }

const SettingsContext = createContext<SettingsValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [stored] = useState(() => loadSettings())
  const [timeWindowSeconds, setTimeWindowSeconds] = useState(stored.timeWindowSeconds ?? 30)
  const [targetRangeHz, setTargetRangeHz] = useState<TargetRange>(stored.targetRangeHz ?? DEFAULT_TARGET_RANGE)
  const [baselineRangeHz, setBaselineRangeHz] = useState<TargetRange | null>(stored.baselineRangeHz ?? null)

  useEffect(() => {
    saveSettings({ timeWindowSeconds, targetRangeHz, baselineRangeHz })
  }, [timeWindowSeconds, targetRangeHz, baselineRangeHz])

  const value = useMemo(
    () => ({
      timeWindowSeconds,
      targetRangeHz,
      baselineRangeHz,
      setTimeWindowSeconds,
      setTargetRangeHz,
      setBaselineRangeHz,
    }),
    [timeWindowSeconds, targetRangeHz, baselineRangeHz],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext)
  if (!value) throw new Error('useSettings must be used within a SettingsProvider')
  return value
}

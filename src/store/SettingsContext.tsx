import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { TargetRange } from '../audio/pitchStats'

interface SettingsValue {
  timeWindowSeconds: number
  targetRangeHz: TargetRange
  setTimeWindowSeconds: (seconds: number) => void
}

const DEFAULT_TARGET_RANGE: TargetRange = { min: null, max: null }

const SettingsContext = createContext<SettingsValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [timeWindowSeconds, setTimeWindowSeconds] = useState(30)

  const value = useMemo(
    () => ({ timeWindowSeconds, targetRangeHz: DEFAULT_TARGET_RANGE, setTimeWindowSeconds }),
    [timeWindowSeconds],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext)
  if (!value) throw new Error('useSettings must be used within a SettingsProvider')
  return value
}

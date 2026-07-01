import type { TargetRange } from '../audio/pitchStats'
import './TargetRangeSettings.css'

interface TargetRangeSettingsProps {
  value: TargetRange
  onChange: (range: TargetRange) => void
}

function parseBound(raw: string): number | null {
  if (raw.trim() === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function normalize(range: TargetRange): TargetRange {
  if (range.min != null && range.max != null && range.min > range.max) {
    return { min: range.max, max: range.min }
  }
  return range
}

export function TargetRangeSettings({ value, onChange }: TargetRangeSettingsProps) {
  return (
    <div className="target-range-settings">
      <input
        type="number"
        inputMode="numeric"
        placeholder="min Hz"
        value={value.min ?? ''}
        onChange={(e) => onChange({ ...value, min: parseBound(e.target.value) })}
        onBlur={() => onChange(normalize(value))}
      />
      <span className="target-range-settings-sep">–</span>
      <input
        type="number"
        inputMode="numeric"
        placeholder="max Hz"
        value={value.max ?? ''}
        onChange={(e) => onChange({ ...value, max: parseBound(e.target.value) })}
        onBlur={() => onChange(normalize(value))}
      />
    </div>
  )
}

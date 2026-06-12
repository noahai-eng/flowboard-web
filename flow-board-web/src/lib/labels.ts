import type { CSSProperties } from 'react'

// Preset-Palette (Sparring-Entscheidung): feste Token-Liste, kein freier Picker.
// Werte muessen mit dem DB-CHECK auf labels.color uebereinstimmen.
export const LABEL_COLORS = [
  'red',
  'orange',
  'amber',
  'green',
  'teal',
  'blue',
  'violet',
  'pink',
] as const

export type LabelColor = (typeof LABEL_COLORS)[number]

export function isLabelColor(value: string): value is LabelColor {
  return (LABEL_COLORS as readonly string[]).includes(value)
}

function colorVar(color: LabelColor) {
  return `var(--label-${color})`
}

// Chip: getoente, gelayerte Flaeche (color-mix) statt flacher Fuellung.
export function labelChipStyle(color: LabelColor): CSSProperties {
  const c = colorVar(color)
  return {
    backgroundColor: `color-mix(in oklch, ${c} 22%, transparent)`,
    color: c,
    borderColor: `color-mix(in oklch, ${c} 35%, transparent)`,
  }
}

export function labelDotStyle(color: LabelColor): CSSProperties {
  return { backgroundColor: colorVar(color) }
}

// Priority nutzt cards.priority (1=urgent … 4=low, null=keine).
export const PRIORITIES = [
  { value: 1, label: 'Dringend', color: 'var(--label-red)' },
  { value: 2, label: 'Hoch', color: 'var(--label-orange)' },
  { value: 3, label: 'Mittel', color: 'var(--label-amber)' },
  { value: 4, label: 'Niedrig', color: 'var(--label-blue)' },
] as const

export function priorityConfig(priority: number | null) {
  return PRIORITIES.find((p) => p.value === priority) ?? null
}

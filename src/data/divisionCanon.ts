export const DIVISION_NAMES = {
  oconnor: "Brian O'Connor Memorial Division",
  toretto: 'Toretto Family Division',
} as const

export type DivisionKey = keyof typeof DIVISION_NAMES

export function divisionKey(name: string): DivisionKey | null {
  if (name.includes('Toretto')) return 'toretto'
  if (
    name.includes("O'Connor")
    || name.includes('O’Connor')
    || name.includes("O'Conner")
    || name.includes('O’Conner')
    || name.includes('OConner')
  ) return 'oconnor'
  return null
}

export function canonicalDivisionName(name: string): string {
  const key = divisionKey(name)
  return key ? DIVISION_NAMES[key] : name
}

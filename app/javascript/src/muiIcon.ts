export default function muiIcon(mod: any) {
  let current = mod
  while (current && typeof current === 'object' && 'default' in current) {
    current = current.default
  }
  return current
}

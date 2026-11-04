export function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}

export function formatSeconds(elapsedMs: number): string {
  if (elapsedMs < 100) return 'under 0.1 seconds'
  return `${(elapsedMs / 1000).toFixed(1)} seconds`
}

export function jumpCaption(from: number, over: number, to: number): string {
  return `${from} jumps over ${over} and lands in ${to}`
}

export const JUMP_MS = 460

export function arcMidpoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lift: number,
): { x: number; y: number } {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.hypot(dx, dy) || 1
  let px = -dy / length
  let py = dx / length
  if (py > 0) {
    px = -px
    py = -py
  }
  return {
    x: (x1 + x2) / 2 + px * lift,
    y: (y1 + y2) / 2 + py * lift,
  }
}

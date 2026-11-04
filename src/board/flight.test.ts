import { describe, expect, it } from 'vitest'
import { arcMidpoint } from './flight.ts'

describe('arcMidpoint', () => {
  it('lifts a jump above the straight line', () => {
    const mid = arcMidpoint(0, 10, 40, 10, 8)
    expect(mid.x).toBeCloseTo(20)
    expect(mid.y).toBeLessThan(10)
  })

  it('retraces the same arc backward', () => {
    const forward = arcMidpoint(4, 12, 36, 48, 6)
    const back = arcMidpoint(36, 48, 4, 12, 6)
    expect(back.x).toBeCloseTo(forward.x)
    expect(back.y).toBeCloseTo(forward.y)
  })
})

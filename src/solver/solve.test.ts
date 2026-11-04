import { describe, expect, it } from 'vitest'
import { applyJump, isLegal, moveIndexFor, patternToBoard } from './moves.ts'
import { replay } from './replay.ts'
import { solve } from './solve.ts'
import { STARTS } from './starts.ts'

const cornerSequence = [
  [3, 1, 0],
  [5, 4, 3],
  [0, 2, 5],
  [6, 3, 1],
  [12, 7, 3],
  [1, 3, 6],
  [9, 8, 7],
  [6, 7, 8],
  [14, 13, 12],
  [11, 12, 13],
  [5, 8, 12],
  [13, 12, 11],
  [10, 11, 12],
] as const

function popcount(board: number): number {
  let count = 0
  let bits = board
  while (bits) {
    count += bits & 1
    bits >>= 1
  }
  return count
}

describe('moves', () => {
  it('plays the usual corner solution down to one peg', () => {
    let board = patternToBoard('011111111111111')
    for (const [from, over, to] of cornerSequence) {
      const index = moveIndexFor(from, over, to)
      expect(isLegal(board, index)).toBe(true)
      board = applyJump(board, index)
    }
    expect(popcount(board)).toBe(1)
    expect(board).toBe(1 << 12)
  })

  it('rejects a jump out of an empty hole', () => {
    const board = patternToBoard('011111111111111')
    expect(isLegal(board, moveIndexFor(0, 1, 3))).toBe(false)
  })
})

describe('published solution counts', () => {
  // Solution totals are the published sequence counts for these four starts.
  // Dead ends are terminal boards with no legal jump before the 13th.
  const expected = {
    corner: { solutions: 29760, deadEnds: 538870 },
    edge: { solutions: 14880, deadEnds: 279663 },
    side: { solutions: 85258, deadEnds: 1064310 },
    center: { solutions: 1550, deadEnds: 136296 },
  } as const

  it.each(STARTS)('solves $name', (start) => {
    const result = solve(start.pattern)
    const counts = expected[start.id]
    expect(result.solutionCount).toBe(counts.solutions)
    expect(result.deadEndCount).toBe(counts.deadEnds)
    expect(result.moves.length).toBe(counts.solutions * 13)
    expect(result.endingPegs.reduce((sum, count) => sum + count, 0)).toBe(counts.solutions)
    expect(result.deadEndsByPly.reduce((sum, count) => sum + count, 0)).toBe(counts.deadEnds)

    for (const index of [0, counts.solutions - 1]) {
      const played = replay(start.pattern, result.moves, index)
      expect(popcount(played.boards[13])).toBe(1)
    }

    if (start.id === 'corner') expect(result.deadEndsByPly[6]).toBe(2)
    if (start.id === 'center') expect(result.deadEndsByPly[4]).toBe(2)
  }, 120_000)

  it('counts where the corner start leaves the last peg', { timeout: 120_000 }, () => {
    const result = solve('011111111111111')
    expect(result.endingPegs).toEqual([
      6816, 0, 0, 0, 0, 0, 3408, 0, 0, 3408, 0, 0, 16128, 0, 0,
    ])
  })
})

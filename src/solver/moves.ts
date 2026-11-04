//        0
//       1 2
//      3 4 5
//    6 7 8 9
// 10 11 12 13 14

export type Jump = {
  readonly from: number
  readonly over: number
  readonly to: number
}

export const JUMPS: readonly Jump[] = [
  { from: 0, over: 1, to: 3 },
  { from: 0, over: 2, to: 5 },
  { from: 1, over: 3, to: 6 },
  { from: 1, over: 4, to: 8 },
  { from: 2, over: 4, to: 7 },
  { from: 2, over: 5, to: 9 },
  { from: 3, over: 1, to: 0 },
  { from: 3, over: 4, to: 5 },
  { from: 3, over: 6, to: 10 },
  { from: 3, over: 7, to: 12 },
  { from: 4, over: 7, to: 11 },
  { from: 4, over: 8, to: 13 },
  { from: 5, over: 2, to: 0 },
  { from: 5, over: 4, to: 3 },
  { from: 5, over: 8, to: 12 },
  { from: 5, over: 9, to: 14 },
  { from: 6, over: 3, to: 1 },
  { from: 6, over: 7, to: 8 },
  { from: 7, over: 4, to: 2 },
  { from: 7, over: 8, to: 9 },
  { from: 8, over: 4, to: 1 },
  { from: 8, over: 7, to: 6 },
  { from: 9, over: 5, to: 2 },
  { from: 9, over: 8, to: 7 },
  { from: 10, over: 6, to: 3 },
  { from: 10, over: 11, to: 12 },
  { from: 11, over: 7, to: 4 },
  { from: 11, over: 12, to: 13 },
  { from: 12, over: 7, to: 3 },
  { from: 12, over: 8, to: 5 },
  { from: 12, over: 11, to: 10 },
  { from: 12, over: 13, to: 14 },
  { from: 13, over: 8, to: 4 },
  { from: 13, over: 12, to: 11 },
  { from: 14, over: 9, to: 5 },
  { from: 14, over: 13, to: 12 },
]

export const HOLE_COUNT = 15
export const JUMP_COUNT = 13

const xorMask = JUMPS.map(
  (jump) => (1 << jump.from) | (1 << jump.over) | (1 << jump.to),
)

export function patternToBoard(pattern: string): number {
  if (pattern.length !== HOLE_COUNT) {
    throw new Error(`Expected ${HOLE_COUNT} holes, received ${pattern.length}.`)
  }

  let board = 0
  for (let hole = 0; hole < HOLE_COUNT; hole++) {
    const cell = pattern[hole]
    if (cell === '1') {
      board |= 1 << hole
    } else if (cell !== '0') {
      throw new Error(`Hole ${hole} must be 0 or 1.`)
    }
  }
  return board
}

export function isLegal(board: number, moveIndex: number): boolean {
  const jump = JUMPS[moveIndex]
  const from = 1 << jump.from
  const over = 1 << jump.over
  const to = 1 << jump.to
  return (board & from) !== 0 && (board & over) !== 0 && (board & to) === 0
}

export function applyJump(board: number, moveIndex: number): number {
  return board ^ xorMask[moveIndex]
}

export function moveIndexFor(from: number, over: number, to: number): number {
  const index = JUMPS.findIndex(
    (jump) => jump.from === from && jump.over === over && jump.to === to,
  )
  if (index < 0) {
    throw new Error(`No jump from ${from} over ${over} to ${to}.`)
  }
  return index
}

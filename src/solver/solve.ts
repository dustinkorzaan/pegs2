import { HOLE_COUNT, JUMP_COUNT, JUMPS, patternToBoard } from './moves.ts'

export type Progress = {
  solutions: number
  deadEnds: number
  elapsedMs: number
}

export type SolveResult = {
  solutionCount: number
  deadEndCount: number
  deadEndsByPly: number[]
  endingPegs: number[]
  elapsedMs: number
  moves: Uint8Array
}

const BOARD_COUNT = 1 << HOLE_COUNT

const fromBit = new Uint16Array(JUMPS.length)
const overBit = new Uint16Array(JUMPS.length)
const toBit = new Uint16Array(JUMPS.length)
const xorMask = new Uint16Array(JUMPS.length)

for (let index = 0; index < JUMPS.length; index++) {
  const jump = JUMPS[index]
  fromBit[index] = 1 << jump.from
  overBit[index] = 1 << jump.over
  toBit[index] = 1 << jump.to
  xorMask[index] = fromBit[index] | overBit[index] | toBit[index]
}

const legalCount = new Uint8Array(BOARD_COUNT)
const legalOffset = new Int32Array(BOARD_COUNT)
let legalTotal = 0

for (let board = 0; board < BOARD_COUNT; board++) {
  let count = 0
  for (let index = 0; index < JUMPS.length; index++) {
    if (
      (board & fromBit[index]) !== 0 &&
      (board & overBit[index]) !== 0 &&
      (board & toBit[index]) === 0
    ) {
      count++
    }
  }
  legalCount[board] = count
  legalTotal += count
}

const legalMoves = new Uint8Array(legalTotal)
let cursor = 0
for (let board = 0; board < BOARD_COUNT; board++) {
  legalOffset[board] = cursor
  for (let index = 0; index < JUMPS.length; index++) {
    if (
      (board & fromBit[index]) !== 0 &&
      (board & overBit[index]) !== 0 &&
      (board & toBit[index]) === 0
    ) {
      legalMoves[cursor++] = index
    }
  }
}

function endingHole(board: number): number {
  return 31 - Math.clz32(board)
}

export function solve(
  pattern: string,
  onProgress?: (progress: Progress) => void,
): SolveResult {
  const start = patternToBoard(pattern)
  const started = performance.now()
  const stack = new Uint8Array(JUMP_COUNT)
  const deadEndsByPly = new Uint32Array(JUMP_COUNT)
  const endingPegs = new Uint32Array(HOLE_COUNT)

  let capacity = 4096
  let moves = new Uint8Array(capacity * JUMP_COUNT)
  let solutionCount = 0
  let deadEndCount = 0
  let nodes = 0
  let lastReport = started

  const report = () => {
    if (!onProgress) return
    const now = performance.now()
    if (now - lastReport < 50) return
    lastReport = now
    onProgress({
      solutions: solutionCount,
      deadEnds: deadEndCount,
      elapsedMs: now - started,
    })
  }

  const search = (board: number, ply: number) => {
    nodes++
    if ((nodes & 65535) === 0) report()

    if (ply === JUMP_COUNT) {
      if (solutionCount === capacity) {
        capacity *= 2
        const next = new Uint8Array(capacity * JUMP_COUNT)
        next.set(moves)
        moves = next
      }
      const dest = solutionCount * JUMP_COUNT
      for (let step = 0; step < JUMP_COUNT; step++) {
        moves[dest + step] = stack[step]
      }
      solutionCount++
      endingPegs[endingHole(board)]++
      return
    }

    const count = legalCount[board]
    if (count === 0) {
      deadEndsByPly[ply]++
      deadEndCount++
      return
    }

    const offset = legalOffset[board]
    for (let index = 0; index < count; index++) {
      const move = legalMoves[offset + index]
      stack[ply] = move
      search(board ^ xorMask[move], ply + 1)
    }
  }

  search(start, 0)

  return {
    solutionCount,
    deadEndCount,
    deadEndsByPly: Array.from(deadEndsByPly),
    endingPegs: Array.from(endingPegs),
    elapsedMs: performance.now() - started,
    moves: moves.slice(0, solutionCount * JUMP_COUNT),
  }
}

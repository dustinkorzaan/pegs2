import { JUMP_COUNT, JUMPS, applyJump, patternToBoard, type Jump } from './moves.ts'

export type Replay = {
  boards: number[]
  jumps: Jump[]
}

export function replay(pattern: string, moves: Uint8Array, solutionIndex: number): Replay {
  const offset = solutionIndex * JUMP_COUNT
  let board = patternToBoard(pattern)
  const boards = [board]
  const jumps: Jump[] = []

  for (let step = 0; step < JUMP_COUNT; step++) {
    const moveIndex = moves[offset + step]
    jumps.push(JUMPS[moveIndex])
    board = applyJump(board, moveIndex)
    boards.push(board)
  }

  return { boards, jumps }
}

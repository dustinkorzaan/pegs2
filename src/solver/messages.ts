import type { SolveResult } from './solve.ts'

export type SolveRequest = {
  type: 'solve'
  requestId: number
  pattern: string
}

export type ProgressMessage = {
  type: 'progress'
  requestId: number
  solutions: number
  deadEnds: number
  elapsedMs: number
}

export type DoneMessage = {
  type: 'done'
  requestId: number
} & SolveResult

export type ErrorMessage = {
  type: 'error'
  requestId: number
  message: string
}

export type WorkerOutbound = ProgressMessage | DoneMessage | ErrorMessage

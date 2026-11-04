import type { SolveRequest } from './messages.ts'
import { solve } from './solve.ts'

type SolverScope = {
  onmessage: ((event: MessageEvent<SolveRequest>) => void) | null
  postMessage: (message: unknown, transfer?: Transferable[]) => void
}

const scope = self as unknown as SolverScope

scope.onmessage = (event: MessageEvent<SolveRequest>) => {
  const { requestId, pattern } = event.data
  try {
    const result = solve(pattern, (progress) => {
      scope.postMessage({ type: 'progress', requestId, ...progress })
    })
    const moves = result.moves
    scope.postMessage({ type: 'done', requestId, ...result, moves }, [moves.buffer])
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The search failed.'
    scope.postMessage({ type: 'error', requestId, message })
  }
}

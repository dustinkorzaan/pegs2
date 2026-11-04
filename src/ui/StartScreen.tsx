import { PegBoard } from '../board/PegBoard.tsx'
import { patternToBoard } from '../solver/moves.ts'
import type { SolveResult } from '../solver/solve.ts'
import { STARTS, type Start } from '../solver/starts.ts'
import { formatCount } from './format.ts'

type StartScreenProps = {
  cache: ReadonlyMap<string, SolveResult>
  onSolve: (start: Start) => void
}

export function StartScreen({ cache, onSolve }: StartScreenProps) {
  return (
    <section className="starts" aria-label="Starting boards">
      {STARTS.map((start) => {
        const solved = cache.get(start.pattern)
        return (
          <article className="start-card" key={start.id}>
            <h2>{start.name}</h2>
            <p className="detail">{start.detail}</p>
            <PegBoard board={patternToBoard(start.pattern)} />
            {solved ? (
              <p className="solved-note">{formatCount(solved.solutionCount)} solutions</p>
            ) : (
              <p className="solved-note solved-note--empty">Not solved yet</p>
            )}
            <button type="button" className="button" onClick={() => onSolve(start)}>
              {solved ? 'View' : 'Solve'}
            </button>
          </article>
        )
      })}
    </section>
  )
}

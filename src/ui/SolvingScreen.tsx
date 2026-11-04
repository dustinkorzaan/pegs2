import { PegBoard } from '../board/PegBoard.tsx'
import { patternToBoard } from '../solver/moves.ts'
import type { Progress } from '../solver/solve.ts'
import type { Start } from '../solver/starts.ts'
import { formatCount, formatSeconds } from './format.ts'

type SolvingScreenProps = {
  start: Start
  progress: Progress
  error: string | null
  onCancel: () => void
}

export function SolvingScreen({ start, progress, error, onCancel }: SolvingScreenProps) {
  const counting = progress.solutions > 0 || progress.deadEnds > 0 || progress.elapsedMs > 0

  return (
    <section className="solving" aria-live="polite">
      <h2>{start.name}</h2>
      <p className="detail">{error ?? 'Searching every jump from this board.'}</p>
      <PegBoard board={patternToBoard(start.pattern)} size="lg" />
      {counting ? (
        <dl className="stat-grid">
          <div>
            <dt>Solutions</dt>
            <dd>{formatCount(progress.solutions)}</dd>
          </div>
          <div>
            <dt>Dead ends</dt>
            <dd>{formatCount(progress.deadEnds)}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{formatSeconds(progress.elapsedMs)}</dd>
          </div>
        </dl>
      ) : (
        <p className="detail">Counting solutions and dead ends.</p>
      )}
      <button type="button" className="button secondary" onClick={onCancel}>
        Cancel
      </button>
    </section>
  )
}

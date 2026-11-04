import type { SolveResult } from '../solver/solve.ts'
import type { Start } from '../solver/starts.ts'
import { Playback } from './Playback.tsx'
import { Stats } from './Stats.tsx'

type ResultsScreenProps = {
  start: Start
  result: SolveResult
  onBack: () => void
}

export function ResultsScreen({ start, result, onBack }: ResultsScreenProps) {
  return (
    <section className="results-wrap">
      <div className="results-toolbar">
        <button type="button" className="button secondary" onClick={onBack}>
          All starts
        </button>
        <h2>{start.name}</h2>
      </div>
      {result.solutionCount === 0 ? (
        <p>This start has no way to finish with one peg.</p>
      ) : (
        <div className="results">
          <Playback
            pattern={start.pattern}
            moves={result.moves}
            solutionCount={result.solutionCount}
          />
          <Stats result={result} />
        </div>
      )}
    </section>
  )
}

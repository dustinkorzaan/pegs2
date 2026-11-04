import { PegBoard } from '../board/PegBoard.tsx'
import type { SolveResult } from '../solver/solve.ts'
import { formatCount, formatSeconds } from './format.ts'

type StatsProps = {
  result: SolveResult
}

export function Stats({ result }: StatsProps) {
  const rows = result.deadEndsByPly
    .map((count, ply) => ({ count, ply }))
    .filter((row) => row.count > 0)
  const max = rows.reduce((highest, row) => Math.max(highest, row.count), 0)
  const earliest = rows[0]?.ply

  return (
    <aside className="stats">
      <dl className="stat-grid">
        <div>
          <dt>Solutions</dt>
          <dd>{formatCount(result.solutionCount)}</dd>
        </div>
        <div>
          <dt>Dead ends</dt>
          <dd>{formatCount(result.deadEndCount)}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{formatSeconds(result.elapsedMs)}</dd>
        </div>
      </dl>

      <section>
        <h3>Where the last peg lands</h3>
        <PegBoard board={0} counts={result.endingPegs} />
      </section>

      <section>
        <h3>Dead ends</h3>
        <p className="detail">
          A board with no legal jump before the thirteenth.
          {earliest === undefined
            ? ''
            : ` The earliest is after ${earliest} ${earliest === 1 ? 'jump' : 'jumps'}.`}
        </p>
        <div className="bars">
          {rows.map((row) => (
            <div className="bar-row" key={row.ply}>
              <span>{row.ply} {row.ply === 1 ? 'jump' : 'jumps'}</span>
              <span className="bar-track">
                <span
                  className="bar-fill"
                  style={{ width: `${max === 0 ? 0 : (row.count / max) * 100}%` }}
                />
              </span>
              <span className="bar-count">{formatCount(row.count)}</span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
}

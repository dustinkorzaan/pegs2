import { useSolver } from './ui/useSolver.ts'
import { ResultsScreen } from './ui/ResultsScreen.tsx'
import { SolvingScreen } from './ui/SolvingScreen.tsx'
import { StartScreen } from './ui/StartScreen.tsx'

export default function App() {
  const solver = useSolver()
  const playing = solver.phase !== 'idle'

  return (
    <main className={playing ? 'page page--play' : 'page'}>
      <header className="masthead">
        <p className="eyebrow">Fifteen holes</p>
        <h1>Pegs</h1>
        {solver.phase === 'idle' ? (
          <p className="lede">
            Jump a peg over a neighbor into an empty hole, and take the peg you jumped.
            Finish with one. Pick a board and solve it here.
          </p>
        ) : null}
      </header>

      {solver.phase === 'idle' ? (
        <StartScreen cache={solver.cache} onSolve={solver.open} />
      ) : null}

      {solver.phase === 'solving' && solver.active ? (
        <SolvingScreen
          start={solver.active}
          progress={solver.progress}
          error={solver.error}
          onCancel={solver.cancel}
        />
      ) : null}

      {solver.phase === 'results' && solver.active && solver.result ? (
        <ResultsScreen
          key={solver.active.pattern}
          start={solver.active}
          result={solver.result}
          onBack={solver.back}
        />
      ) : null}
    </main>
  )
}

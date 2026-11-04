import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { PegBoard, type PegFlight } from '../board/PegBoard.tsx'
import { replay, type Replay } from '../solver/replay.ts'
import { formatCount, jumpCaption } from './format.ts'

const JUMP_STEPS = [-1000, -100, -10, 10, 100, 1000] as const

type PlaybackProps = {
  pattern: string
  moves: Uint8Array
  solutionCount: number
}

export function Playback({ pattern, moves, solutionCount }: PlaybackProps) {
  const reduceMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const [solutionIndex, setSolutionIndex] = useState(0)
  const [moveIndex, setMoveIndex] = useState(0)
  const [playing, setPlaying] = useState(!reduceMotion)
  const [draft, setDraft] = useState<string | null>(null)
  const [flight, setFlight] = useState<PegFlight | null>(null)
  const moveRef = useRef(0)
  const framesRef = useRef<Replay | null>(null)
  const stepToRef = useRef<(next: number) => void>(() => {})
  const keyboard = useRef<{
    stepMove: (delta: number) => void
    goToSolution: (index: number) => void
    solutionIndex: number
  }>({
    stepMove: () => {},
    goToSolution: () => {},
    solutionIndex: 0,
  })

  const frames = useMemo(
    () => replay(pattern, moves, solutionIndex),
    [pattern, moves, solutionIndex],
  )
  const highlight = moveIndex === 0 ? null : frames.jumps[moveIndex - 1]
  const solutionField = draft ?? String(solutionIndex + 1)

  useEffect(() => {
    moveRef.current = moveIndex
  }, [moveIndex])

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      const next = Math.min(13, moveRef.current + 1)
      stepToRef.current(next)
      if (next === 13) setPlaying(false)
    }, 750)
    return () => window.clearInterval(id)
  }, [playing])

  function stepTo(next: number) {
    const clamped = Math.min(13, Math.max(0, next))
    const current = moveRef.current
    const delta = clamped - current
    if (delta === 0) return
    const replayFrames = framesRef.current
    if (replayFrames && !reduceMotion && (delta === 1 || delta === -1)) {
      const jump = replayFrames.jumps[Math.max(current, clamped) - 1]
      setFlight({
        from: delta > 0 ? jump.from : jump.to,
        to: delta > 0 ? jump.to : jump.from,
        over: jump.over,
        direction: delta > 0 ? 'forward' : 'back',
      })
    } else {
      setFlight(null)
    }
    moveRef.current = clamped
    setMoveIndex(clamped)
  }

  useLayoutEffect(() => {
    framesRef.current = frames
    stepToRef.current = stepTo
  })

  function goToSolution(index: number) {
    const next = Math.min(solutionCount - 1, Math.max(0, index))
    setDraft(null)
    if (next === solutionIndex) return
    setSolutionIndex(next)
    setFlight(null)
    moveRef.current = 0
    setMoveIndex(0)
  }

  function commitDraft() {
    const parsed = Number(solutionField)
    if (!Number.isInteger(parsed)) {
      setDraft(null)
      return
    }
    goToSolution(parsed - 1)
  }

  function stepMove(delta: number) {
    setPlaying(false)
    stepTo(moveRef.current + delta)
  }

  function togglePlay() {
    if (playing) {
      setPlaying(false)
      return
    }
    if (moveRef.current >= 13) stepTo(0)
    setPlaying(true)
  }

  useEffect(() => {
    keyboard.current.stepMove = stepMove
    keyboard.current.goToSolution = goToSolution
    keyboard.current.solutionIndex = solutionIndex
  })

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }
      const actions = keyboard.current
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        actions.stepMove(1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        actions.stepMove(-1)
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        actions.goToSolution(actions.solutionIndex + 1)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        actions.goToSolution(actions.solutionIndex - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="playback">
      <PegBoard
        board={frames.boards[moveIndex]}
        size="lg"
        numbered
        highlight={highlight}
        flight={flight}
      />
      <p className="caption">
        {highlight
          ? jumpCaption(highlight.from, highlight.over, highlight.to)
          : 'Starting board'}
      </p>

      <div className="control-block">
        <div className="control-label">
          <span>{moveIndex === 0 ? 'Start' : `Move ${moveIndex} of 13`}</span>
          <button type="button" className="button" onClick={togglePlay}>
            {playing ? 'Pause' : 'Play'}
          </button>
        </div>
        <input
          type="range"
          min={0}
          max={13}
          value={moveIndex}
          aria-label="Move"
          onChange={(event) => {
            setPlaying(false)
            stepTo(Number(event.target.value))
          }}
        />
        <div className="transport">
          <button type="button" className="button secondary" onClick={() => stepMove(-1)} disabled={moveIndex === 0}>
            Previous move
          </button>
          <button type="button" className="button secondary" onClick={() => stepMove(1)} disabled={moveIndex === 13}>
            Next move
          </button>
        </div>
      </div>

      <div className="control-block">
        <form
          className="solution-line"
          onSubmit={(event) => {
            event.preventDefault()
            commitDraft()
          }}
        >
          <label htmlFor="solution-number">Solution</label>
          <input
            id="solution-number"
            className="solution-input"
            inputMode="numeric"
            value={solutionField}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitDraft}
          />
          <span>of {formatCount(solutionCount)}</span>
        </form>
        <div className="transport">
          <button type="button" className="button secondary" onClick={() => goToSolution(0)} disabled={solutionIndex === 0}>
            First
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={() => goToSolution(solutionIndex - 1)}
            disabled={solutionIndex === 0}
          >
            Previous
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={() => goToSolution(solutionIndex + 1)}
            disabled={solutionIndex === solutionCount - 1}
          >
            Next
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={() => goToSolution(solutionCount - 1)}
            disabled={solutionIndex === solutionCount - 1}
          >
            Last
          </button>
        </div>
        <div className="transport">
          {JUMP_STEPS.map((step) => {
            const target = Math.min(solutionCount - 1, Math.max(0, solutionIndex + step))
            const label = step > 0 ? `+${step}` : String(step)
            return (
              <button
                type="button"
                className="button secondary"
                key={step}
                disabled={target === solutionIndex}
                onClick={() => goToSolution(solutionIndex + step)}
              >
                {label}
              </button>
            )
          })}
        </div>
        <p className="hint">Arrow keys step the move. Up and down change the solution.</p>
      </div>
    </div>
  )
}

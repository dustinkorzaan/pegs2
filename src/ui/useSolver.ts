import { useEffect, useRef, useState } from 'react'
import type { WorkerOutbound } from '../solver/messages.ts'
import type { Progress, SolveResult } from '../solver/solve.ts'
import type { Start } from '../solver/starts.ts'

const emptyProgress: Progress = { solutions: 0, deadEnds: 0, elapsedMs: 0 }

export function useSolver() {
  const workerRef = useRef<Worker | null>(null)
  const requestRef = useRef(0)
  const [cache, setCache] = useState<ReadonlyMap<string, SolveResult>>(() => new Map())
  const [phase, setPhase] = useState<'idle' | 'solving' | 'results'>('idle')
  const [active, setActive] = useState<Start | null>(null)
  const [progress, setProgress] = useState<Progress>(emptyProgress)
  const [result, setResult] = useState<SolveResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  function open(start: Start) {
    setActive(start)
    setError(null)
    const cached = cache.get(start.pattern)
    if (cached) {
      setResult(cached)
      setPhase('results')
      return
    }

    setResult(null)
    setProgress(emptyProgress)
    setPhase('solving')
    workerRef.current?.terminate()

    const worker = new Worker(new URL('../solver/worker.ts', import.meta.url), {
      type: 'module',
    })
    workerRef.current = worker
    const requestId = ++requestRef.current

    worker.onmessage = (event: MessageEvent<WorkerOutbound>) => {
      if (event.data.requestId !== requestRef.current) return
      if (event.data.type === 'progress') {
        setProgress({
          solutions: event.data.solutions,
          deadEnds: event.data.deadEnds,
          elapsedMs: event.data.elapsedMs,
        })
        return
      }
      if (event.data.type === 'error') {
        setError(event.data.message)
        return
      }

      const next: SolveResult = {
        solutionCount: event.data.solutionCount,
        deadEndCount: event.data.deadEndCount,
        deadEndsByPly: event.data.deadEndsByPly,
        endingPegs: event.data.endingPegs,
        elapsedMs: event.data.elapsedMs,
        moves: event.data.moves,
      }
      setCache((current) => {
        const updated = new Map(current)
        updated.set(start.pattern, next)
        return updated
      })
      setResult(next)
      setPhase('results')
      worker.terminate()
      if (workerRef.current === worker) workerRef.current = null
    }

    worker.onerror = () => {
      if (requestId !== requestRef.current) return
      setError('The search stopped before it finished.')
    }

    worker.postMessage({ type: 'solve', requestId, pattern: start.pattern })
  }

  function cancel() {
    requestRef.current += 1
    workerRef.current?.terminate()
    workerRef.current = null
    setPhase('idle')
    setError(null)
  }

  function back() {
    setPhase('idle')
  }

  return { phase, active, progress, result, error, cache, open, cancel, back }
}

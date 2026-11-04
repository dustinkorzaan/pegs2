import { useLayoutEffect, useRef } from 'react'
import { arcMidpoint, JUMP_MS } from './flight.ts'
import { HOLE_ROWS } from './layout.ts'
import type { Jump } from '../solver/moves.ts'

export type PegFlight = {
  from: number
  to: number
  over: number
  direction: 'forward' | 'back'
}

type PegBoardProps = {
  board: number
  size?: 'md' | 'lg'
  numbered?: boolean
  highlight?: Jump | null
  counts?: readonly number[]
  flight?: PegFlight | null
}

export function PegBoard({
  board,
  size = 'md',
  numbered = false,
  highlight = null,
  counts,
  flight = null,
}: PegBoardProps) {
  const maxCount = counts ? Math.max(...counts) : 0
  const motion = counts ? null : flight
  const boardRef = useRef<HTMLDivElement>(null)
  const flyerRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const root = boardRef.current
    const flyer = flyerRef.current
    if (!motion || !root || !flyer) return

    const from = root.querySelector<HTMLElement>(`[data-hole="${motion.from}"]`)
    const to = root.querySelector<HTMLElement>(`[data-hole="${motion.to}"]`)
    if (!from || !to) return

    const origin = root.getBoundingClientRect()
    const start = from.getBoundingClientRect()
    const end = to.getBoundingClientRect()
    const sizePx = start.width * 0.82
    const x1 = start.left - origin.left + start.width / 2
    const y1 = start.top - origin.top + start.height / 2
    const x2 = end.left - origin.left + end.width / 2
    const y2 = end.top - origin.top + end.height / 2
    const crest = arcMidpoint(x1, y1, x2, y2, start.width * 0.42)
    const place = (x: number, y: number) => `translate(${x - sizePx / 2}px, ${y - sizePx / 2}px)`

    flyer.style.width = `${sizePx}px`
    flyer.style.height = `${sizePx}px`
    const animation = flyer.animate(
      [
        { transform: place(x1, y1), boxShadow: '0 2px 3px rgba(0, 0, 0, 0.45)' },
        {
          transform: `${place(crest.x, crest.y)} scale(1.06)`,
          boxShadow: '0 12px 16px rgba(0, 0, 0, 0.32)',
          offset: 0.5,
        },
        {
          transform: place(x2, y2),
          boxShadow: '0 0 0 2px #d7b56a, 0 2px 3px rgba(0, 0, 0, 0.45)',
        },
      ],
      { duration: JUMP_MS, easing: 'ease-in-out', fill: 'both' },
    )
    return () => animation.cancel()
  }, [motion])

  return (
    <div
      ref={boardRef}
      className={`board board--${size}${counts ? ' board--counts' : ''}`}
      aria-hidden="true"
    >
      {HOLE_ROWS.map((row) => (
        <div className="row" key={row[0]}>
          {row.map((hole) => {
            if (counts) {
              const count = counts[hole] ?? 0
              const shade = maxCount === 0 ? 0 : count / maxCount
              return (
                <span
                  className={`hole hole--count${count === 0 ? ' hole--zero' : ''}`}
                  key={hole}
                  style={{
                    background: `rgba(215, 181, 106, ${0.1 + shade * 0.9})`,
                    color: shade > 0.62 ? '#1a140c' : '#f4ecdc',
                  }}
                  title={`Hole ${hole}: ${count.toLocaleString('en-US')}`}
                >
                  {count.toLocaleString('en-US')}
                </span>
              )
            }

            const filled = (board & (1 << hole)) !== 0
            const from = highlight?.from === hole
            const over = highlight?.over === hole
            const to = highlight?.to === hole
            const landing = motion?.to === hole
            const captured = motion?.direction === 'forward' && motion.over === hole
            const restored = motion?.direction === 'back' && motion.over === hole
            const className = [
              'hole',
              filled ? 'hole--filled' : '',
              from ? 'hole--from' : '',
              over ? 'hole--over' : '',
              to ? 'hole--to' : '',
            ]
              .filter(Boolean)
              .join(' ')
            const pegClass = [
              'peg',
              to ? 'peg--landed' : '',
              landing ? 'peg--flight-hide' : '',
              restored ? 'peg--restored' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <span className={className} data-hole={hole} key={hole}>
                {filled ? (
                  <span className={pegClass} style={restored ? { animationDuration: `${JUMP_MS}ms` } : undefined} />
                ) : null}
                {captured ? (
                  <span className="peg peg--captured" style={{ animationDuration: `${JUMP_MS}ms` }} />
                ) : null}
                {numbered ? <span className="hole-index">{hole}</span> : null}
              </span>
            )
          })}
        </div>
      ))}
      {motion ? <span ref={flyerRef} className="peg-flight" /> : null}
    </div>
  )
}

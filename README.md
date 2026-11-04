# PEGS2

Solve the fifteen-hole triangle peg puzzle and play back every solution.

Built with React 19, TypeScript, and Vite. The solver runs in a Web Worker.

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Preview the production build |
| `npm test` | Run unit tests (Vitest) |
| `npm run lint` | Lint with oxlint |

## Layout

- `src/solver/` — puzzle solver, move generation, replay, and the Web Worker
- `src/board/` — peg board rendering, layout, and peg flight animation
- `src/ui/` — screens (start, solving, results), playback, and stats

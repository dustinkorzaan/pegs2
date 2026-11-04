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

## Deployment

Hosted on Azure Static Web Apps in the `pegs2` resource group.

- `infra/main.bicep` (+ `infra/main.bicepparam`) defines the Static Web App.
- `.github/workflows/deploy.yml` builds, lints, and tests on every push and PR.
  Pushes to `main` (or a manual run) also deploy the Bicep and upload `dist/`.
- Azure login uses OIDC with the user-assigned managed identity
  `pegs2-gh-actions`, through the `production` GitHub environment.

Required GitHub repository **secrets** (Settings → Secrets and variables → Actions → Secrets):

| Secret | Value |
| --- | --- |
| `AZURE_CLIENT_ID` | Client ID of managed identity `pegs2-gh-actions` |
| `AZURE_TENANT_ID` | Microsoft Entra tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Subscription that contains the `pegs2` resource group |

The managed identity needs the **Contributor** role on the `pegs2` resource group.

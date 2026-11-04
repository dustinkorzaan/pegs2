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

## Sign-in (Okta)

Sign-in is optional: the puzzle is public, and a **Sign in** button in the
top-right signs in with Okta (OIDC Authorization Code + PKCE, no client secret).

- Okta org: `integrator-8597893.okta.com`, default authorization server
- App: `pegs2` (Single-Page Application), client ID `0oa19hgcbxcQB4S52698`
- Callback: `/login/callback`. Sign-in redirect URIs, sign-out URIs, and
  Trusted Origins (CORS) are registered for `https://pegs2.korzaan.com`,
  `https://witty-stone-022e76f0f.6.azurestaticapps.net`, and
  `http://localhost:5173` (`npm run dev`).
- Override with `VITE_OKTA_ISSUER` / `VITE_OKTA_CLIENT_ID` at build time.

Code: `src/auth/okta.ts` (client + redirect handling), `src/auth/useAuth.ts`,
`src/ui/AuthBar.tsx`.

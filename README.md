## PG Frontend

A React + Redux + Tailwind CSS storefront with checkout (Stripe) and artwork upload flow.

### Tech Stack

- React 18, React Router
- Redux Toolkit
- Tailwind CSS
- Axios
- Stripe Checkout
- react-hook-form

### Getting Started

1. Prerequisites

- Node.js >= 18 and npm >= 9

2. Install dependencies

```bash
npm install
```

3. Environment variables
   Create a `.env` file in the project root (or `.env.local`) and set:

```bash
# Backend base URL
VITE_BACKEND_URL=https://api.example.com

# Stripe public key (publishable)
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx

# Merch chatbot service (SuperMerch Bot)
VITE_BOT_API_URL=http://localhost:8001
```

4. Run locally

```bash
npm run dev
```

5. Build

```bash
npm run build
```

6. Preview production build

```bash
npm run preview
```

### Project Structure (high level)

- `src/components/Chat/` - chatbot widget UI

- `src/components/checkout/` – checkout flow (Customer, Shipping, Billing, Payment)
- `src/components/cart/` – cart UI and interactions
- `src/components/product/` – product details, size guide
- `src/pages/` – route pages (Cart, UploadArtwork, etc.)
- `src/redux/` – Redux slices and store
- `src/context/` – `AppContext` and global context

### Chat Widget (SuperMerch Bot)

- The widget lives in `src/components/Chat/ChatWidget.jsx`.
- It calls the bot service at `VITE_BOT_API_URL` and renders product cards.
- A session id is stored in `localStorage` and sent via `X-Session-Id` so follow-up queries refine the previous intent.
- If the bot is down or misconfigured, the widget shows a “Could not reach the merch assistant” message.

### Code Style & Conventions

- Use meaningful variable and function names; avoid abbreviations
- Prefer early returns; handle edge cases explicitly
- Keep components focused; extract UI pieces when they grow
- Tailwind utility-first styling; keep classes readable and consistent
- Prefer Controlled components with `react-hook-form`
- Lint/format before committing if configured

### Git & GitHub Workflow

#### Branch Model

- `main` – production-ready code. Protected branch
- `feat/*` – new features or improvements branched from `main`
  - Example: `feat/checkout-accordion`, `feat/mobile-cart`
- `hotfix/*` – urgent fixes branched from `main`, merged back into both `main` and `develop`
  - Example: `hotfix/stripe-session-null`
- `release/*` – release preparation branched from `develop`, then merged to `main` and back to `develop`
  - Example: `release/1.4.0`

#### Normal Flow (Feature)

1. Branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feat/<short-descriptor>
```

2. Commit changes (see Commit Messages below)
3. Rebase on latest `develop` as needed
4. Open PR: `feature/*` → `develop`
5. Address reviews and merge via squash or rebase merge (see PR Rules)

#### Hotfix Flow

1. Branch from `main`: `hotfix/<issue>`
2. Open PR to `main`
3. After merge, open a PR to back-merge hotfix into `develop`

#### Release Flow

1. Branch `release/x.y.z` from `develop`
2. Stabilize (tests, docs, version bumps)
3. Merge into `main` (tag) and back-merge into `develop`

### PR Rules

- Keep PRs small and focused
- Title: concise summary (imperative mood)
- Description includes:
  - What & Why
  - Screenshots/GIFs for UI changes (desktop + mobile if relevant)
  - Any migrations/env changes
- Link related issues/trello tickets
- Required checks green (build/lint/tests if configured)
- At least 1 approval required before merge
- Resolve or answer all review comments
- Use squash merge for feature branches unless history must be preserved

### Commit Messages (Conventional Commits)

Format: `type(scope): short summary`

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation only changes
- `style`: formatting, missing semi colons, etc.; no code change
- `refactor`: code change that neither fixes a bug nor adds a feature
- `perf`: performance improvements
- `test`: adding or correcting tests
- `chore`: tooling/config/build, no production code changes

Examples:

- `feat(cart): add mobile card layout`
- `fix(checkout): stop collapsing on copy from shipping`
- `refactor(product): extract size guide parser`

### Versioning & Releases

- SemVer: `MAJOR.MINOR.PATCH`
- Tag releases on `main`: `v1.4.0`
- Maintain a CHANGELOG (PR titles + summaries)

### Environments

- Development: local `npm run dev`
- Staging: `develop` (optional preview)
- Production: `main`

### Testing (optional placeholder)

- Add unit tests for utilities and critical reducers
- Add component tests for complex UI states

### Security & Secrets

- Never commit secrets. Use `.env` with `VITE_*` vars for client-side public values
- Rotate test keys regularly; production keys live in deployment secrets

### Troubleshooting

- Blank page: check console for Vite/React errors; verify env vars
- Stripe errors: ensure `VITE_STRIPE_PUBLIC_KEY` is set and backend session endpoint responds
- API 4xx/5xx: verify `VITE_BACKEND_URL` and CORS settings

### Contact

- Owner: Supermerch
- Contributions welcome via PRs following rules above

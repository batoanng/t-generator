# t-generator

`t-generator` is a Yeoman generator for bootstrapping React repositories with a clean, scalable starting point and then layering feature generators onto that base.

The current implementation covers the base React + TypeScript + Vite scaffold plus the first add-on feature command: `bff`. The base stays intentionally feature-neutral so projects can opt into the BFF only when they need proxying and production serving support.

The long-term direction is described in [SPECS.md](./SPECS.md). The first implemented command is:

```bash
yo t-generator [appName]
```

The first implemented feature command is:

```bash
yo t-generator:add bff
```

## What the generator creates today

The base app command currently includes:

- React + TypeScript via Vite
- ESLint configuration
- Prettier configuration
- `@` path alias mapped to `src`
- `.env` example file plus a small env helper
- a provider composition entry point
- React Router setup
- a placeholder home page
- Vitest + Testing Library setup
- a Feature-Sliced Design directory structure

The base command does not install add-on features automatically. The first implemented add-on is `bff`, which creates a top-level `server/` package for API proxying and production frontend serving. The remaining planned features are still pending: theme, UI library, auth, React Query, Apollo, Redux, notifications, and PWA support.

## Base app architecture

The generated base app is designed as a stable foundation that future feature generators can extend without needing to rewrite the app shell.

### High-level structure

```text
src/
  app/
    entrypoint/
    providers/
    routes/
    styles/
  pages/
    home/
      ui/
      index.ts
  widgets/
  features/
  entities/
  shared/
    config/
    ui/
    api/
    lib/
```

### Why this structure exists

- `app` holds application-wide concerns such as the root entrypoint, provider composition, routing, and global styles.
- `pages` holds route-level screens. The base ships with a single `home` page slice.
- `widgets`, `features`, and `entities` are created up front so later additions fit into a consistent shape from the start.
- `shared` holds reusable code that is not tied to a specific business slice.

### FSD deep dive

The base follows Feature-Sliced Design as the default architectural model.

- `app` and `shared` are not sliced layers. They are organized directly by segments because they represent application-wide setup and common building blocks.
- `pages`, `widgets`, `features`, and `entities` are sliced layers. New code in those layers should be organized by business purpose, then by segments such as `ui`, `model`, `api`, `lib`, or `config` when needed.
- Route wiring, provider wiring, app bootstrap code, and global CSS stay inside `app`. This keeps application orchestration in one place.
- Reusable, non-domain-specific utilities and configuration stay inside `shared`.
- Public APIs matter. A slice should expose what other layers use through its top-level `index.ts` instead of forcing callers to reach into internal folders.
- Cross-slice imports should go through public APIs. Relative imports are fine within the same slice. Imports across layers should only point downward according to FSD dependency rules.

### How the base app uses that architecture

- `src/app/entrypoint/App.tsx` is the root shell that composes providers, router, and global styles.
- `src/app/providers/AppProviders.tsx` is deliberately minimal today, but it is the extension point for future app-wide providers.
- `src/app/routes/AppRouter.tsx` owns the initial route table and is where future routes can be wired in safely.
- `src/pages/home/index.ts` exposes the home page slice through a public API.
- `src/shared/config/env.ts` centralizes access to the app name environment variable.

This keeps the base focused on general setup only while still preparing the codebase for future composition.

## How to use

Install and link the generator locally:

```bash
npm install
npm link
```

If `yo` is not already available on your machine:

```bash
npm install -g yo
```

Generate a new base app:

```bash
yo t-generator my-app
```

You can also omit the name and let the generator prompt for it:

```bash
yo t-generator
```

Behavior of the current command:

- The generator creates a new directory named after the normalized app name.
- It fails if the target directory already exists and is not empty.
- It writes files only. It does not automatically install dependencies or initialize Git.

After generation, move into the new app and start it:

```bash
cd my-app
npm install
npm run dev
```

Add the BFF feature from the generated app root:

```bash
cd my-app
yo t-generator:add bff
```

After the BFF files are generated:

```bash
npm install
npm --prefix server install
npm run dev:full
```

The BFF command validates that the current directory already contains the generated base app before it writes anything. It will fail clearly if the base markers are missing or if a `server/` folder already exists.

## Local development

Work on the generator itself from this repository:

```bash
npm install
```

Run the test suite:

```bash
npm test
```

Create a changeset for release-worthy changes:

```bash
npm run changeset
```

Apply pending changesets to the package version and changelog:

```bash
npm run version-packages
```

Publish the package after versioning:

```bash
npm run release
```

## Release automation

This repository now uses Changesets on `main` through GitHub Actions.

Setup for the easiest token-based publish flow:

1. In npm, create a write-capable access token for this package.
2. In GitHub, add that token as the repository Actions secret `NPM_TOKEN`.
3. Merge changes that include a changeset into `main`.

What happens next:

- the release workflow opens or updates a Changesets release PR on `main`
- when that release PR is merged, the same workflow publishes the package to npm automatically
- `GITHUB_TOKEN` is provided by GitHub automatically, so you only need to manage `NPM_TOKEN`

Re-link the generator after local changes if needed:

```bash
npm link
```

The current test suite covers:

- generation with an explicit app name
- prompt fallback when the name is omitted
- adding the `bff` feature to an existing generated base app
- the generated base project structure and files
- absence of feature-specific dependencies in the base
- failure when `bff` is added outside the generated base app
- failure when `bff` generation would overwrite existing BFF wiring
- failure on non-empty target directories

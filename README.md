# t-generator

`t-generator` is a Yeoman generator for bootstrapping React repositories with a clean, scalable starting point.

The current implementation focuses on the first command in the product spec: generating a base React + TypeScript + Vite application. The base is intentionally feature-neutral. It gives a project the core structure, routing, testing, linting, formatting, and environment wiring needed to start development without pulling in optional concerns too early.

The long-term direction is described in [SPECS.md](./SPECS.md). The first implemented command is:

```bash
yo t-generator [appName]
```

## What the generator creates today

The base app currently includes:

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

The base does not install any of the planned add-on features yet. In particular, it does not include theme setup, a UI library, auth, React Query, Apollo, Redux, notifications, PWA support, or a BFF server.

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

## Local development

Work on the generator itself from this repository:

```bash
npm install
```

Run the test suite:

```bash
npm test
```

Re-link the generator after local changes if needed:

```bash
npm link
```

The current test suite covers:

- generation with an explicit app name
- prompt fallback when the name is omitted
- the generated base project structure and files
- absence of feature-specific dependencies in the base
- failure on non-empty target directories

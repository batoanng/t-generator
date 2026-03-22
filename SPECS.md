# t-generator – Product Specs

## 1. Overview

`t-generator` is a Yeoman-based code generator for bootstrapping and evolving React repositories.

Its purpose is to help developers create a production-ready React + TypeScript application quickly, then progressively add common features through dedicated commands.

The generator should support:

- creating a base React + TypeScript app
- adding optional features incrementally
- adding testing setup for the base app and for each added feature
- keeping generated code modular, predictable, and easy to maintain

The initial version should focus on a strong base application and a small set of high-value features that are commonly needed in real projects.

---

## 2. Goals

### Primary goals

- Provide a single command to generate a base React + TypeScript application
- Provide separate commands to add common React features on demand
- Provide commands to add tests for the base app and each installed feature
- Ensure generated code follows a clean, scalable project structure
- Minimize manual setup after generation

### Secondary goals

- Allow feature composition without breaking previous generated code
- Keep the generator extensible for future plugins/features
- Support idempotent generation where possible
- Make the developer experience simple and consistent

---

## 3. Non-goals

The first version does not need to:

- support every React framework
- support SSR frameworks like Next.js
- support multiple package managers in depth
- generate custom backend business logic or database layers
- generate deployment infrastructure
- fully migrate arbitrary existing projects with complex custom setups

Notes:

- A lightweight BFF/proxy server is in scope as an optional feature.
- A full backend application is not in scope.

---

## 4. Target users

- Frontend developers starting a new React project
- Teams wanting a consistent React project template
- Developers who want to progressively add features instead of installing everything upfront

---

## 5. Core tech stack

### Base application

- React
- TypeScript
- Vite

### Generator framework

- `yeoman-generator`

### Recommended base tooling

The generated base app should include the minimal setup required to start development comfortably.

Recommended defaults:

- Vite for project scaffolding and dev/build
- ESLint
- Prettier
- path aliases
- environment file support
- Feature-Sliced Design folder structure
- Vitest setup
- optional Git init
- optional Husky + lint-staged

### Preferred UI direction

The generator should support a UI setup that matches the author's existing stack.

Recommended default approach:

- Material UI (`@mui/material`)
- the author's shared UI package
- centralized theme provider
- global app styles

The exact package names can be configurable in implementation, but the first version should optimize for the current preferred stack.

---

## 6. Product scope

Version 1 should focus on two layers:

- a strong `base app`
- a small set of add-on `features`

The generator should not attempt to cover every possible project concern up front.

### Architecture requirement

The generated frontend codebase must follow Feature-Sliced Design (FSD) as the default architectural model.

This means:

- the project structure must use standard FSD layers
- code should be organized by business purpose, not only by technical type
- import boundaries between layers must follow FSD dependency rules
- slices should expose clear public APIs

The generator should align with the current FSD documentation from [feature-sliced.design](https://feature-sliced.design/).

---

## 7. Command model

The generator should expose one base command and multiple feature commands.

### 7.1 Base command

This command creates the initial React + TypeScript project.

Example:

```bash
yo t-generator
```

Responsibilities:

- scaffold a Vite React + TypeScript app
- configure linting and formatting
- configure path aliases
- add environment file support
- create the initial project structure
- add a root app shell and provider entry points
- add a basic routing setup
- add a basic test setup

### 7.2 Feature command

This command adds one feature into an existing generated project.

Example:

```bash
yo t-generator:add auth
yo t-generator:add theme
yo t-generator:add bff
```

Responsibilities:

- install required dependencies
- create or update required files
- wire the feature into existing providers, routes, config, and scripts
- avoid duplicating existing setup where possible

### 7.3 Test command

This command adds or updates tests for the base app or for a specific feature.

Examples:

```bash
yo t-generator:test base
yo t-generator:test auth
```

Responsibilities:

- create the relevant test files
- add any supporting test utilities
- avoid overwriting user-written tests unless explicitly intended

---

## 8. Base application specification

The base app is the foundation every generated project should start from.

### 8.1 Base app must include

- React + TypeScript via Vite
- ESLint configuration
- Prettier configuration
- TypeScript path aliases
- `.env` support
- `src` folder structure suitable for growth
- an application entry point
- a provider composition entry point
- React Router setup
- a placeholder home page
- Vitest setup

### 8.2 Base folder structure

The exact structure can evolve, but the base app must establish clear separation of concerns using Feature-Sliced Design.

Recommended structure:

```text
src/
  app/
  pages/
  widgets/
  features/
  entities/
  shared/
```

Notes:

- `processes/` should not be generated by default because the current FSD documentation treats it as deprecated.
- Not every project must use every layer immediately, but the generator should scaffold the structure and conventions so features can be added consistently over time.

### 8.3 Feature-Sliced Design rules

The generator must follow these FSD rules in generated frontend code:

- use standard FSD layer names: `app`, `pages`, `widgets`, `features`, `entities`, `shared`
- treat `app` and `shared` as layers without slices; they are organized directly by segments
- treat `pages`, `widgets`, `features`, and `entities` as sliced layers
- organize slices by business or product purpose
- organize code inside slices with segments such as `ui`, `model`, `api`, `lib`, and `config` where relevant
- keep routing, providers, entrypoints, and global styles in `app`
- keep reusable non-domain-specific code in `shared`
- keep reusable business entities in `entities`
- keep reusable user-facing business actions in `features`
- keep composed screen-level blocks in `widgets`
- keep route-level screens in `pages`

The generator must also follow the FSD import rule:

- modules may only import from layers strictly below them
- modules inside the same slice may use relative imports
- cross-slice imports must go through the target slice public API
- `app` and `shared` are exceptions because they do not contain slices

### 8.4 Public API rules

Generated slices should expose a clear public API, typically via a top-level `index.ts` file in the slice.

The generator should:

- create explicit re-exports instead of exposing slice internals by default
- prefer relative imports within the same slice
- prefer alias imports for cross-slice access
- avoid generating import paths that couple callers to internal segment structure

### 8.5 Base folder structure example

An example starting structure for the base app is:

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
    ui/
    api/
    lib/
    config/
```

The generator should keep the structure simple, avoid over-abstraction, and leave room for later feature generators to plug into it.

### 8.6 Base scripts

At minimum:

- `dev`
- `build`
- `preview`
- `lint`
- `test`

Optional scripts may be added when relevant to enabled features.

---

## 9. Feature catalog

Version 1 should support the following feature generators.

### 9.1 `theme`

Purpose:

- add centralized theme setup for the application

Responsibilities:

- install theme-related dependencies
- add a theme provider
- add base global styles
- expose a theme creation entry point
- integrate with the main provider tree

Notes:

- The first implementation should align with the preferred MUI-based stack.

### 9.2 `ui-library`

Purpose:

- integrate the author's UI package into the project

Responsibilities:

- install the package and peer dependencies
- wire it into the app theme and provider setup
- provide example usage in a page or shared component

Notes:

- This feature is intentionally separate from `theme` so projects can choose theme setup without necessarily adopting the custom package, or vice versa if needed.

### 9.3 `auth`

Purpose:

- add authentication and authorization scaffolding

Responsibilities:

- install auth dependencies
- create an auth provider
- add callback handling
- add route guard utilities
- add environment variables required for auth
- provide a basic authenticated/unauthenticated flow

Notes:

- The first implementation may target the current preferred provider, but the spec should keep room for future auth adapters.

### 9.4 `react-query`

Purpose:

- add async data fetching and caching infrastructure

Responsibilities:

- install `@tanstack/react-query`
- create query client setup
- wire the provider into the app
- add a small example query hook or sample usage

### 9.5 `apollo`

Purpose:

- add GraphQL client support

Responsibilities:

- install Apollo client dependencies
- create Apollo provider setup
- add a minimal GraphQL client configuration
- support auth token injection if `auth` is already installed

Notes:

- This feature should work independently, but offer integration points with `auth`.

### 9.6 `redux`

Purpose:

- add centralized client state management

Responsibilities:

- install Redux Toolkit and React Redux
- create store setup
- create an example slice
- wire the store provider into the app

### 9.7 `notifications`

Purpose:

- add app-wide user feedback components

Responsibilities:

- install snackbar or notification dependencies
- create a provider wrapper
- expose basic success/error notification helpers

### 9.8 `pwa`

Purpose:

- add progressive web app support

Responsibilities:

- configure service worker support
- add install/update hooks or components
- configure manifest and required assets scaffolding

### 9.9 `bff`

Purpose:

- add a lightweight backend-for-frontend server folder to support proxying and production serving

Responsibilities:

- create a top-level `server/` folder
- add a server package manifest
- add a server entry file
- add environment file examples for the server
- configure the server to proxy API requests to a target backend
- optionally serve the built frontend in production
- add root scripts to run frontend and server together in development

Non-responsibilities:

- no database setup
- no domain-specific backend business logic
- no full API generation

Notes:

- This feature exists to support frontend delivery concerns such as CORS avoidance, proxying, and static asset serving.
- The example project's `server/` folder is the reference shape for this feature.

---

## 10. Feature composition rules

Feature generators should compose cleanly.

### Composition requirements

- adding one feature must not break previously added features
- generators should update shared provider trees safely
- generators should update routing safely
- generators should avoid duplicate dependencies and duplicate wrappers
- generators should be re-runnable where practical
- generators should place new files into the correct FSD layer and slice
- generators should preserve FSD import boundaries when wiring new features
- generators should update slice public APIs when exposing new modules

### Example interactions

- `auth` may integrate with `apollo`
- `theme` may be required by `ui-library`
- `notifications` may extend the provider tree created by `theme`
- `bff` may add scripts without disrupting existing frontend scripts

---

## 11. Testing expectations

Testing is part of the generator contract, not an afterthought.

### Base testing

The base app should include:

- Vitest configuration
- a test setup file
- one example test for generated base UI

### Feature testing

Each feature should define its own minimal testing expectations.

Examples:

- `theme`: render with provider
- `auth`: route guard or provider smoke test
- `react-query`: query client wrapper test
- `redux`: store or slice smoke test
- `bff`: server boot or config smoke test where practical

---

## 12. Idempotency and update behavior

The generator should aim to be safe to run multiple times.

Expected behavior:

- avoid writing duplicate imports
- avoid adding duplicate providers
- avoid duplicating scripts or dependencies
- prefer updating known generated sections in a predictable way
- be conservative when editing user-owned files

Where perfect idempotency is difficult, the generator should fail clearly rather than silently corrupting the project structure.

---

## 13. Developer experience requirements

The generator should be easy to understand and easy to extend.

Requirements:

- commands should be named predictably
- prompts should be minimal and purposeful
- generated code should be readable, not overly abstract
- feature boundaries should map to clear folders and files
- future features should be easy to add without rewriting the generator core

---

## 14. Initial implementation priority

The first implementation pass should prioritize:

1. base app
2. theme
3. ui-library
4. auth
5. react-query
6. bff

The remaining features can follow after the core generation flow is stable.

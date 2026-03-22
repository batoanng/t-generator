# t-generator – Product Specs

## 1. Overview

`t-generator` is a Yeoman-based code generator for bootstrapping and evolving React repositories.

Its purpose is to help developers create a production-ready React + TypeScript application quickly, then progressively add common features through dedicated commands.

The generator should support:

- creating a base React + TypeScript app
- adding optional features incrementally
- adding testing setup for the base app and for each added feature
- keeping generated code modular, predictable, and easy to maintain

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
- generate backend code
- generate deployment infrastructure
- fully migrate arbitrary existing projects with complex custom setups

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
- simple folder structure for scaling
- optional Git init
- optional Husky + lint-staged

---

## 6. Command model

The generator should expose one base command and multiple feature commands.

### Base command

This command creates the initial React + TypeScript project.

Example:

```bash
yo t-generator

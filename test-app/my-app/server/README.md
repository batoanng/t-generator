# My App BFF

## What this BFF does

This Backend for Frontend (BFF) sits between the React app and the upstream API. It proxies browser API requests to the backend and, in production, can serve the built frontend from the same process.

## Why this BFF exists

The BFF gives the frontend one stable entry point for delivery concerns that do not belong in the browser:

- avoid browser-to-API CORS issues during local development
- hide backend origin details behind one frontend-facing URL
- centralize proxy and response policies in one place
- serve the built Vite app and the API proxy from the same server in production

## Environment files

The server reads environment-specific files from this folder:

- `.env.development`
- `.env.production`

Variables used by the server:

- `APP_BASE_URL`: the public URL of the BFF
- `CORS_ORIGIN`: the frontend origin allowed to call the BFF directly
- `APP_API_TARGET_SERVER`: the upstream backend URL that receives proxied API requests
- `PORT`: optional server port, defaults to `3000`
- `NR_APP_ID`: optional New Relic application id

## How to run it

Install dependencies after generating the feature:

```bash
npm install
npm --prefix server install
```

Run the frontend and BFF together from the project root:

```bash
npm run dev:full
```

If you prefer separate processes, keep Vite on its own and start the BFF independently:

```bash
npm run dev
npm run dev:server
```

## Production flow

Build the frontend at the project root, then start the BFF in production mode so it serves `../dist` and proxies API traffic:

```bash
npm run build
cd server
NODE_ENV=production npm run start
```

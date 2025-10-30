# Server (Express) for Nebula

This folder contains a minimal Express + TypeScript backend scaffold used for local development and as a starting point for multi-tenant server logic.

Quick commands (from repo root):

```bash
# install deps
npm install

# run the server in dev mode (auto restarts)
npm run dev:server

# build server
npm run build:server

# start built server
npm run start:server
```

Notes:
- Example routes are in `src/routes/api.ts` (health, /me, /databases).
- The backend in this early-stage scaffold is intended for internal use by the Electron app to perform database calls and misc server-side logic. There is no tenant middleware by default; multi-tenant logic can be added later if needed.
- The client (Electron app) can use `src/boot/axios.ts`'s exported `api` instance to call the server. You may want to set that baseURL to `http://localhost:3000` in development.

<!-- Generated guidance for AI coding agents working on Nebula -->
# Copilot instructions — Nebula

This project is a Tauri desktop app with a Svelte frontend and a Rust backend. Keep guidance concise and reference concrete files.

- Big picture
  - Frontend: `src/` (SvelteKit + Vite). Key UI components in `src/lib/components/` (e.g. `ConnectionManager.svelte`, `SqlEditor.svelte`, `SchemaExplorer.svelte`). Route entry points: `src/routes/+layout.svelte`, `src/routes/+page.svelte`.
  - Backend (native): `src-tauri/` (Rust + Tauri). The app runs `nebula_lib::run()` from `src-tauri/src/main.rs` which wires up Tauri commands in `src-tauri/src/lib.rs` and `src-tauri/src/commands.rs`.
  - Database layer: `src-tauri/src/db/manager.rs` holds the connection pool map (`DbManager`) and the database-specific logic (SQLx pools + Mongo client). `DbPool` enum indicates supported drivers (`postgres`, `mysql`, `sqlite`, `mongodb`).

- Developer workflows (verified from files)
  - Install: `npm install` (frontend deps in `package.json`). Rust deps are in `src-tauri/Cargo.toml`.
  - Dev (recommended): `npm run tauri dev` — this runs the frontend (Vite) and Tauri dev runtime.
  - Build: `npm run tauri build` to produce distributables.
  - Frontend-only: `npm run dev` (vite dev), `npm run build` (vite build), `npm run preview`.

- Project-specific conventions and patterns
  - SvelteKit is used in SPA mode (`src/routes/+layout.ts` sets `export const ssr = false;`). Expect client-side rendering and no server-side Node process.
  - Frontend ↔ backend communication uses Tauri commands exposed in `src-tauri/src/commands.rs` and called from `src/lib/api/db.ts` via `invoke(...)`. Keep parameter shapes consistent with the TypeScript interfaces in `src/lib/api/db.ts` (e.g. `ConnectRequest`, `QueryResult`).
  - Connection lifecycle: `DbManager` stores multiple named connections in an async `RwLock<HashMap<String, DbPool>>`. Functions take the connection name (string) to operate.
  - SQL execution: For SQLx-backed drivers the code uses raw queries (`sqlx::query(query)`) and converts values to strings when possible — this is intentional for a simple universal result shape (`QueryResult`). MongoDB query execution returns an error / is unimplemented in `manager.rs`.

- Integration points and external dependencies to be cautious about
  - Tauri: modifying `src-tauri/*` requires Cargo changes and rebuilding the native binary. Keep changes minimal and update `src-tauri/Cargo.toml` when adding new Rust deps.
  - SQLx: cargo features enable specific DB drivers (see `Cargo.toml`: `postgres`, `mysql`, `sqlite`). When adding a driver, update features accordingly.
  - Monaco Editor: frontend uses `@monaco-editor/loader` and `monaco-editor` — editor customization lives in `SqlEditor.svelte`.
  - Native plugins: `tauri-plugin-opener` is initialized in `src-tauri/src/lib.rs`.

- When editing or adding code
  - Prefer updating TypeScript interfaces in `src/lib/api/db.ts` alongside Rust command signatures to keep the invoke contract consistent.
  - If adding a new DB type:
    1. Add the crate in `src-tauri/Cargo.toml` and enable necessary `sqlx` features.
    2. Extend `DbPool` and implement connect / execute helpers in `src-tauri/src/db/manager.rs`.
    3. Add a Tauri command in `src-tauri/src/commands.rs` if needed and re-run `npm run tauri dev`.
    4. Update frontend UI (`ConnectionManager.svelte`) and TypeScript API shapes (`src/lib/api/db.ts`).

- Quick search examples (use these symbols when adding features)
  - Tauri command names: `connect_to_db`, `disconnect_from_db`, `list_connections`, `get_tables`, `get_columns`, `execute_query` (`src-tauri/src/commands.rs`).
  - DbManager: `src-tauri/src/db/manager.rs` implements `connect_*`, `get_tables`, `get_columns`, `execute_query`.

- Tests / verification
  - There are no automated tests in the repo. Local verification steps:
    - Run `npm run tauri dev` and use the UI to exercise connection flows.
    - For Rust-only changes, run `cd src-tauri && cargo build` to compile the native lib.

- Safety and known limitations (explicitly discoverable)
  - MongoDB query execution is not implemented (`execute_query` returns an error for `DbPool::MongoDB`).
  - Query result values are coerced to strings where `try_get(i)` succeeds, otherwise JSON null is used; this may lose type fidelity for complex types.

If anything here is unclear or you'd like more examples (e.g., how to run a specific debug session, reproduce a failing query flow, or add tests), tell me which area to expand and I'll iterate.

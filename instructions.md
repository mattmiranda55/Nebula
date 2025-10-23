

## ✅ 2. Add Backend Dependencies (Rust)

Modify `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri = { version = "2", features = ["api-all"] }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1.0"

# Database drivers
sqlx = { version = "0.7", features = ["runtime-tokio", "postgres", "mysql", "sqlite"] }
```

---

## ✅ 3. Implement Database Manager (Rust)

**`src-tauri/src/db/manager.rs`:**

```rust
use std::collections::HashMap;
use tokio::sync::RwLock;
use sqlx::{Pool, Postgres, MySql, Sqlite};

pub enum DbPool {
    Postgres(Pool<Postgres>),
    MySql(Pool<MySql>),
    Sqlite(Pool<Sqlite>),
}

pub struct DbManager {
    pools: RwLock<HashMap<String, DbPool>>,
}

impl DbManager {
    pub fn new() -> Self {
        Self { pools: RwLock::new(HashMap::new()) }
    }

    pub async fn connect_postgres(&self, name: &str, url: &str) -> Result<(), String> {
        let pool = Pool::<Postgres>::connect(url).await.map_err(|e| e.to_string())?;
        self.pools.write().await.insert(name.to_string(), DbPool::Postgres(pool));
        Ok(())
    }
}
```

---

## ✅ 4. Expose Tauri Command

**`src-tauri/src/commands.rs`:**

```rust
use tauri::State;
use crate::db::manager::DbManager;

#[tauri::command]
pub async fn connect_to_db(name: String, url: String, db: State<'_, DbManager>) -> Result<(), String> {
    db.connect_postgres(&name, &url).await
}
```

---

## ✅ 5. Register Commands in `main.rs`

**`src-tauri/src/main.rs`:**

```rust
mod commands;
mod db;
mod models;

use db::manager::DbManager;

fn main() {
    tauri::Builder::default()
        .manage(DbManager::new())
        .invoke_handler(tauri::generate_handler![
            commands::connect_to_db
        ])
        .run(tauri::generate_context!())
        .expect("failed to run Nebula");
}
```

---

## ✅ 6. Frontend: API Layer for Calling Rust

Create file: **`src/lib/api/db.ts`**

```ts
import { invoke } from '@tauri-apps/api/core';

export async function connectToDb(name: string, url: string) {
  return await invoke('connect_to_db', { name, url });
}
```

---

## ✅ 7. Frontend: Test It Works

Add this to a Svelte component (e.g., `App.svelte`):

```svelte
<script lang="ts">
  import { connectToDb } from '$lib/api/db';

  async function testConnect() {
    try {
      await connectToDb('local', 'postgres://user:pass@localhost/dbname');
      console.log('✅ Connected!');
    } catch (e) {
      console.error('❌ Failed:', e);
    }
  }
</script>

<button on:click={testConnect}>Test DB Connection</button>
```

---

## ✅ 8. Run Project

```bash
npm run tauri dev
```

---

## 📌 Next Steps (After Scaffold)

| Task                            | Description                                     |
| ------------------------------- | ----------------------------------------------- |
| Add MySQL, SQLite, & MongoDB support | Extend DbManager to handle other drivers   |
| Build Schema Explorer           | Query `information_schema` for tables & columns |
| Add Monaco SQL Editor           | Code editor in Svelte for writing queries       |
| Query execution + results table | Run SQL + display formatted results             |
| Secure credential storage       | Use Tauri secure store / OS keychain            |


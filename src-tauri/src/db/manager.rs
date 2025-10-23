use std::collections::HashMap;
use tokio::sync::RwLock;
use sqlx::{Pool, Postgres, MySql, Sqlite, Row, Column};
use mongodb::Client as MongoClient;
use serde::{Deserialize, Serialize};

#[derive(Clone)]
pub enum DbPool {
    Postgres(Pool<Postgres>),
    MySql(Pool<MySql>),
    Sqlite(Pool<Sqlite>),
    MongoDB(MongoClient, String), // client + database name
}

pub struct DbManager {
    pools: RwLock<HashMap<String, DbPool>>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TableInfo {
    pub name: String,
    pub schema: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ColumnInfo {
    pub name: String,
    pub data_type: String,
    pub is_nullable: String,
    pub column_default: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct QueryResult {
    pub columns: Vec<String>,
    pub rows: Vec<Vec<serde_json::Value>>,
    pub rows_affected: Option<u64>,
}

impl DbManager {
    pub fn new() -> Self {
        Self {
            pools: RwLock::new(HashMap::new()),
        }
    }

    pub async fn connect_postgres(&self, name: &str, url: &str) -> Result<(), String> {
        let pool = Pool::<Postgres>::connect(url)
            .await
            .map_err(|e| e.to_string())?;
        self.pools
            .write()
            .await
            .insert(name.to_string(), DbPool::Postgres(pool));
        Ok(())
    }

    pub async fn connect_mysql(&self, name: &str, url: &str) -> Result<(), String> {
        let pool = Pool::<MySql>::connect(url)
            .await
            .map_err(|e| e.to_string())?;
        self.pools
            .write()
            .await
            .insert(name.to_string(), DbPool::MySql(pool));
        Ok(())
    }

    pub async fn connect_sqlite(&self, name: &str, url: &str) -> Result<(), String> {
        let pool = Pool::<Sqlite>::connect(url)
            .await
            .map_err(|e| e.to_string())?;
        self.pools
            .write()
            .await
            .insert(name.to_string(), DbPool::Sqlite(pool));
        Ok(())
    }

    pub async fn connect_mongodb(&self, name: &str, url: &str, database: &str) -> Result<(), String> {
        let client = MongoClient::with_uri_str(url)
            .await
            .map_err(|e| e.to_string())?;
        self.pools
            .write()
            .await
            .insert(name.to_string(), DbPool::MongoDB(client, database.to_string()));
        Ok(())
    }

    pub async fn disconnect(&self, name: &str) -> Result<(), String> {
        self.pools.write().await.remove(name);
        Ok(())
    }

    pub async fn list_connections(&self) -> Vec<String> {
        self.pools.read().await.keys().cloned().collect()
    }

    pub async fn get_tables(&self, name: &str) -> Result<Vec<TableInfo>, String> {
        let pools = self.pools.read().await;
        let pool = pools.get(name).ok_or("Connection not found")?;

        match pool {
            DbPool::Postgres(pool) => {
                let rows = sqlx::query(
                    "SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema')"
                )
                .fetch_all(pool)
                .await
                .map_err(|e| e.to_string())?;

                Ok(rows
                    .iter()
                    .map(|row| TableInfo {
                        name: row.get("table_name"),
                        schema: Some(row.get("table_schema")),
                    })
                    .collect())
            }
            DbPool::MySql(pool) => {
                let rows = sqlx::query(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()"
                )
                .fetch_all(pool)
                .await
                .map_err(|e| e.to_string())?;

                Ok(rows
                    .iter()
                    .map(|row| TableInfo {
                        name: row.get("table_name"),
                        schema: None,
                    })
                    .collect())
            }
            DbPool::Sqlite(pool) => {
                let rows = sqlx::query(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
                )
                .fetch_all(pool)
                .await
                .map_err(|e| e.to_string())?;

                Ok(rows
                    .iter()
                    .map(|row| TableInfo {
                        name: row.get("name"),
                        schema: None,
                    })
                    .collect())
            }
            DbPool::MongoDB(client, db_name) => {
                let db = client.database(db_name);
                let collections = db
                    .list_collection_names(None)
                    .await
                    .map_err(|e| e.to_string())?;

                Ok(collections
                    .iter()
                    .map(|name| TableInfo {
                        name: name.clone(),
                        schema: None,
                    })
                    .collect())
            }
        }
    }

    pub async fn get_columns(&self, name: &str, table: &str) -> Result<Vec<ColumnInfo>, String> {
        let pools = self.pools.read().await;
        let pool = pools.get(name).ok_or("Connection not found")?;

        match pool {
            DbPool::Postgres(pool) => {
                let query = "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = $1";
                let rows = sqlx::query(query)
                    .bind(table)
                    .fetch_all(pool)
                    .await
                    .map_err(|e| e.to_string())?;

                Ok(rows
                    .iter()
                    .map(|row| ColumnInfo {
                        name: row.get("column_name"),
                        data_type: row.get("data_type"),
                        is_nullable: row.get("is_nullable"),
                        column_default: row.get("column_default"),
                    })
                    .collect())
            }
            DbPool::MySql(pool) => {
                let query = "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = ? AND table_schema = DATABASE()";
                let rows = sqlx::query(query)
                    .bind(table)
                    .fetch_all(pool)
                    .await
                    .map_err(|e| e.to_string())?;

                Ok(rows
                    .iter()
                    .map(|row| ColumnInfo {
                        name: row.get("column_name"),
                        data_type: row.get("data_type"),
                        is_nullable: row.get("is_nullable"),
                        column_default: row.get("column_default"),
                    })
                    .collect())
            }
            DbPool::Sqlite(pool) => {
                let query = format!("PRAGMA table_info('{}')", table);
                let rows = sqlx::query(&query)
                    .fetch_all(pool)
                    .await
                    .map_err(|e| e.to_string())?;

                Ok(rows
                    .iter()
                    .map(|row| {
                        let nullable: i32 = row.get("notnull");
                        ColumnInfo {
                            name: row.get("name"),
                            data_type: row.get("type"),
                            is_nullable: if nullable == 0 { "YES".to_string() } else { "NO".to_string() },
                            column_default: row.get("dflt_value"),
                        }
                    })
                    .collect())
            }
            DbPool::MongoDB(_, _) => {
                // MongoDB doesn't have a fixed schema, return empty
                Ok(vec![])
            }
        }
    }

    pub async fn execute_query(&self, name: &str, query: &str) -> Result<QueryResult, String> {
        let pools = self.pools.read().await;
        let pool = pools.get(name).ok_or("Connection not found")?;

        match pool {
            DbPool::Postgres(pool) => {
                let rows = sqlx::query(query)
                    .fetch_all(pool)
                    .await
                    .map_err(|e| e.to_string())?;

                if rows.is_empty() {
                    return Ok(QueryResult {
                        columns: vec![],
                        rows: vec![],
                        rows_affected: Some(0),
                    });
                }

                let columns: Vec<String> = rows[0]
                    .columns()
                    .iter()
                    .map(|col| col.name().to_string())
                    .collect();

                let mut result_rows = Vec::new();
                for row in rows {
                    let mut row_data = Vec::new();
                    for (i, _) in columns.iter().enumerate() {
                        let value: Option<String> = row.try_get(i).ok();
                        row_data.push(
                            value
                                .map(|v| serde_json::Value::String(v))
                                .unwrap_or(serde_json::Value::Null),
                        );
                    }
                    result_rows.push(row_data);
                }

                let rows_affected = result_rows.len() as u64;
                Ok(QueryResult {
                    columns,
                    rows: result_rows,
                    rows_affected: Some(rows_affected),
                })
            }
            DbPool::MySql(pool) => {
                let rows = sqlx::query(query)
                    .fetch_all(pool)
                    .await
                    .map_err(|e| e.to_string())?;

                if rows.is_empty() {
                    return Ok(QueryResult {
                        columns: vec![],
                        rows: vec![],
                        rows_affected: Some(0),
                    });
                }

                let columns: Vec<String> = rows[0]
                    .columns()
                    .iter()
                    .map(|col| col.name().to_string())
                    .collect();

                let mut result_rows = Vec::new();
                for row in rows {
                    let mut row_data = Vec::new();
                    for (i, _) in columns.iter().enumerate() {
                        let value: Option<String> = row.try_get(i).ok();
                        row_data.push(
                            value
                                .map(|v| serde_json::Value::String(v))
                                .unwrap_or(serde_json::Value::Null),
                        );
                    }
                    result_rows.push(row_data);
                }

                let rows_affected = result_rows.len() as u64;
                Ok(QueryResult {
                    columns,
                    rows: result_rows,
                    rows_affected: Some(rows_affected),
                })
            }
            DbPool::Sqlite(pool) => {
                let rows = sqlx::query(query)
                    .fetch_all(pool)
                    .await
                    .map_err(|e| e.to_string())?;

                if rows.is_empty() {
                    return Ok(QueryResult {
                        columns: vec![],
                        rows: vec![],
                        rows_affected: Some(0),
                    });
                }

                let columns: Vec<String> = rows[0]
                    .columns()
                    .iter()
                    .map(|col| col.name().to_string())
                    .collect();

                let mut result_rows = Vec::new();
                for row in rows {
                    let mut row_data = Vec::new();
                    for (i, _) in columns.iter().enumerate() {
                        let value: Option<String> = row.try_get(i).ok();
                        row_data.push(
                            value
                                .map(|v| serde_json::Value::String(v))
                                .unwrap_or(serde_json::Value::Null),
                        );
                    }
                    result_rows.push(row_data);
                }

                let rows_affected = result_rows.len() as u64;
                Ok(QueryResult {
                    columns,
                    rows: result_rows,
                    rows_affected: Some(rows_affected),
                })
            }
            DbPool::MongoDB(_client, _db_name) => {
                // For MongoDB, we'd need to parse the query differently
                // This is a simplified implementation
                Err("MongoDB query execution not yet implemented".to_string())
            }
        }
    }
}


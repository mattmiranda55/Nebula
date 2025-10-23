use tauri::State;
use crate::db::manager::{DbManager, TableInfo, ColumnInfo, QueryResult};

#[derive(serde::Deserialize)]
pub struct ConnectRequest {
    pub name: String,
    pub url: String,
    pub db_type: String,
    pub database: Option<String>, // For MongoDB
}

#[tauri::command]
pub async fn connect_to_db(
    request: ConnectRequest,
    db: State<'_, DbManager>,
) -> Result<(), String> {
    match request.db_type.as_str() {
        "postgres" => db.connect_postgres(&request.name, &request.url).await,
        "mysql" => db.connect_mysql(&request.name, &request.url).await,
        "sqlite" => db.connect_sqlite(&request.name, &request.url).await,
        "mongodb" => {
            let database = request.database.ok_or("Database name required for MongoDB")?;
            db.connect_mongodb(&request.name, &request.url, &database).await
        }
        _ => Err(format!("Unsupported database type: {}", request.db_type)),
    }
}

#[tauri::command]
pub async fn disconnect_from_db(name: String, db: State<'_, DbManager>) -> Result<(), String> {
    db.disconnect(&name).await
}

#[tauri::command]
pub async fn list_connections(db: State<'_, DbManager>) -> Result<Vec<String>, String> {
    Ok(db.list_connections().await)
}

#[tauri::command]
pub async fn get_tables(name: String, db: State<'_, DbManager>) -> Result<Vec<TableInfo>, String> {
    db.get_tables(&name).await
}

#[tauri::command]
pub async fn get_columns(
    name: String,
    table: String,
    db: State<'_, DbManager>,
) -> Result<Vec<ColumnInfo>, String> {
    db.get_columns(&name, &table).await
}

#[tauri::command]
pub async fn execute_query(
    name: String,
    query: String,
    db: State<'_, DbManager>,
) -> Result<QueryResult, String> {
    db.execute_query(&name, &query).await
}


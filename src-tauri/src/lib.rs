mod commands;
mod db;

use db::manager::DbManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(DbManager::new())
        .invoke_handler(tauri::generate_handler![
            commands::connect_to_db,
            commands::disconnect_from_db,
            commands::list_connections,
            commands::get_tables,
            commands::get_columns,
            commands::execute_query,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

import { invoke } from '@tauri-apps/api/core';

export interface ConnectRequest {
  name: string;
  url: string;
  db_type: string;
  database?: string; // For MongoDB
}

export interface TableInfo {
  name: string;
  schema?: string;
}

export interface ColumnInfo {
  name: string;
  data_type: string;
  is_nullable: string;
  column_default?: string;
}

export interface QueryResult {
  columns: string[];
  rows: any[][];
  rows_affected?: number;
}

export async function connectToDb(request: ConnectRequest): Promise<void> {
  return await invoke('connect_to_db', { request });
}

export async function disconnectFromDb(name: string): Promise<void> {
  return await invoke('disconnect_from_db', { name });
}

export async function listConnections(): Promise<string[]> {
  return await invoke('list_connections');
}

export async function getTables(name: string): Promise<TableInfo[]> {
  return await invoke('get_tables', { name });
}

export async function getColumns(name: string, table: string): Promise<ColumnInfo[]> {
  return await invoke('get_columns', { name, table });
}

export async function executeQuery(name: string, query: string): Promise<QueryResult> {
  return await invoke('execute_query', { name, query });
}


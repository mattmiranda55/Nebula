 
interface NebulaConnection {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
}

interface NebulaAPI {
  loadConnections(): Promise<NebulaConnection[]>;
  saveConnection(conn: Partial<NebulaConnection> & { name: string; type: string; config?: Record<string, unknown> }): Promise<NebulaConnection>;
  deleteConnection(id: string): Promise<{ ok: boolean }>;
  openFileDialog(): Promise<string | null>;
  runQuery(connectionId: string, sql: string): Promise<QueryResult>;
  loadSettings(): Promise<Record<string, unknown>>;
  saveSettings(obj: Record<string, unknown>): Promise<{ ok: boolean }>;
}

type Col = { name: string; label: string; field: string };
type Row = Record<string, unknown>;
type QueryResult = { columns: Col[]; rows: Row[] } | { info: Record<string, unknown> };

declare global {
  interface Window {
    nebulaAPI: NebulaAPI;
  }
}

export {};

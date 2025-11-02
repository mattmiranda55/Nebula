<template>
  <q-page class="desktop-client q-pa-md">
    <div class="row no-wrap">
      <!-- Sidebar (drawer component handles its own drawer) -->
      <SidebarConnections />

      <!-- Main area -->
      <div class="col">
        <q-toolbar class="bg-white q-mb-sm">
          <div class="row items-center">
            <div class="text-h6">Nebula DB</div>
            <q-separator vertical spaced />
            <div class="text-subtitle2 text-grey">Desktop Client</div>
          </div>

          <q-space />
          <div class="row items-center">
            <q-btn flat round dense icon="settings" />
            <q-avatar size="32px" class="q-ml-sm">NM</q-avatar>
          </div>
        </q-toolbar>

        <div class="split-grid" :style="{ gridTemplateColumns: leftWidth + 'px 8px 1fr' }">
          <div class="left-panel">
            <EditorTabs ref="tabs">
              <template #default="{ updateSql }">
                <QueryEditor :modelValue="sql" @update:modelValue="(v) => { sql = v; updateSql(v); }" @run="runQuery" />
              </template>
            </EditorTabs>
          </div>

          <div class="splitter" @mousedown="startDrag" :class="{ dragging: isDragging }" />

          <div class="right-panel">
            <ResultsTable :columns="columns" :rows="rows" />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import SidebarConnections from 'src/components/ui/SidebarConnections.vue';
import EditorTabs from 'src/components/ui/EditorTabs.vue';
import QueryEditor from 'src/components/ui/QueryEditor.vue';
import ResultsTable from 'src/components/ui/ResultsTable.vue';

const sql = ref<string>('SELECT * FROM users LIMIT 10;');
type Col = { name: string; label: string; field: string };
type Row = Record<string, unknown>;
const columns = ref<Col[]>([{ name: 'id', label: 'id', field: 'id' }, { name: 'name', label: 'name', field: 'name' }]);
const rows = ref<Row[]>([]);

const selectedConnection = ref<{ id: string; name: string; type: string; config: Record<string, unknown> } | null>(null);

// splitter state
const leftWidth = ref<number>(700);
const isDragging = ref(false);
let startX = 0;
let startWidth = 0;

function startDrag(e: MouseEvent) {
  isDragging.value = true;
  startX = e.clientX;
  startWidth = leftWidth.value;
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value) return;
  const dx = e.clientX - startX;
  const next = startWidth + dx;
  const min = 320;
  const max = window.innerWidth - 400;
  leftWidth.value = Math.min(Math.max(next, min), max);
}

function stopDrag() {
  isDragging.value = false;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
}

onUnmounted(() => {
  // cleanup if necessary
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
});

onMounted(() => {
  window.addEventListener('nebula:select-connection', (e: Event) => {
  selectedConnection.value = (e as CustomEvent).detail as { id: string; name: string; type: string; config: Record<string, unknown> };
  });
});

const runQuery = async () => {
  if (!selectedConnection.value) {
    console.warn('No connection selected');
    return;
  }

  try {
    const res = await window.nebulaAPI.runQuery(selectedConnection.value.id, sql.value);
    // Narrow the QueryResult union using in-operator guards
    if ('columns' in res && 'rows' in res) {
      columns.value = res.columns as Col[];
      rows.value = res.rows as Row[];
    } else if ('info' in res) {
      columns.value = [{ name: 'info', label: 'info', field: 'info' }];
      rows.value = [{ info: JSON.stringify(res.info) } as unknown as Row];
    }
  } catch (err) {
    console.error('Query failed', err);
    columns.value = [{ name: 'error', label: 'error', field: 'error' }];
    rows.value = [{ error: String(err) } as unknown as Row];
  }
};
</script>

<style scoped>
.desktop-client { background: var(--q-color-grey-2); min-height: 100vh; }
.bg-white { background: white; }
.split-grid { display: grid; grid-template-columns: 700px 8px 1fr; gap: 0; height: calc(100vh - 120px); }
.left-panel { padding-right: 8px; overflow: auto }
.right-panel { padding-left: 8px; overflow: auto }
.splitter { cursor: col-resize; background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.04)); width: 8px }
.splitter.dragging { background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.1)); }

</style>

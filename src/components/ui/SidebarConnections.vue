<template>
  <q-drawer show-if-above v-model:model-value="drawer" bordered :width="260">
    <div class="q-pa-md q-gutter-y-sm">
      <div class="row items-center justify-between">
        <div class="text-h6">Connections</div>
        <q-btn dense flat round icon="add" @click="createConnection" />
      </div>

      <q-list separator>
        <q-item v-for="conn in connections" :key="conn.id" clickable @click="select(conn)">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">{{ conn.name.charAt(0).toUpperCase() }}</q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ conn.name }}</q-item-label>
            <q-item-label caption>{{ conn.type === 'sqlite' ? conn.config.path : conn.type }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense round icon="delete" @click.stop="remove(conn.id)" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
interface Conn { id: string; name: string; type: string; config: Record<string, unknown> }

const $q = useQuasar();
const drawer = ref(true);

const connections = ref<Conn[]>([]);

onMounted(async () => {
  try {
    const loaded = await window.nebulaAPI.loadConnections();
    connections.value = loaded || [];
  } catch (err) {
    console.error('Failed to load connections', err);
  }
});

const select = (c: Conn) => {
  window.dispatchEvent(new CustomEvent('nebula:select-connection', { detail: c }));
  $q.notify({ message: `Selected ${c.name}`, color: 'info' });
};

const createConnection = async () => {
  const name = window.prompt('Connection name', `sqlite-${Date.now().toString().slice(-4)}`);
  if (!name) return;
  // open file dialog for sqlite file
  const path = await window.nebulaAPI.openFileDialog();
  if (!path) return;
  const conn = { id: '', name, type: 'sqlite', config: { path } };
  try {
    const saved = await window.nebulaAPI.saveConnection(conn);
    connections.value.push(saved);
    // notify other UI (header chooser) that connections changed
    window.dispatchEvent(new CustomEvent('nebula:connections-updated'));
    $q.notify({ message: `Connection ${saved.name} added`, color: 'positive' });
  } catch (err) {
    console.error('Failed to save connection', err);
    $q.notify({ message: 'Failed to save connection', color: 'negative' });
  }
};

const remove = async (id: string) => {
  const ok = confirm('Delete this connection?');
  if (!ok) return;
  try {
    await window.nebulaAPI.deleteConnection(id);
    connections.value = connections.value.filter((c) => c.id !== id);
    window.dispatchEvent(new CustomEvent('nebula:connections-updated'));
    $q.notify({ message: 'Deleted', color: 'negative' });
  } catch (err) {
    console.error('Failed to delete connection', err);
    $q.notify({ message: 'Failed to delete', color: 'negative' });
  }
};
</script>

<style scoped>
.q-drawer {
  background: var(--q-color-grey-2);
}
</style>

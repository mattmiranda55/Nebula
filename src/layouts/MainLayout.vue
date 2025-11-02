<template>
  <q-layout view="lHh Lpr lFf">
      <q-header elevated class="main-header">
        <q-toolbar class="no-border">
          <div class="row items-center" style="gap: 12px;">
            <q-btn flat dense icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
            <div class="app-brand row items-center">
              <div class="app-logo">NB</div>
              <div class="app-title">Nebula</div>
              <div class="app-subtitle">Desktop Database Client</div>
            </div>
          </div>

          <div class="q-gutter-sm row items-center header-center" style="gap:12px">
            <q-select dense outlined hide-dropdown-icon use-input input-debounce="300" v-model="selectedConnectionId" :options="connectionOptions" option-label="label" option-value="value" class="connection-select" placeholder="No connection" />
            <div class="connection-status">{{ connectionLabel }}</div>
          </div>

          <q-space />

          <div class="row items-center q-gutter-sm header-actions">
            <q-input dense rounded hide-bottom-space v-model="search" placeholder="Search objects or tables" class="search-input"/>
            <q-toggle dense v-model="isDark" :true-label="''" :false-label="''" @update:model-value="onToggleTheme">
              <template #label>
                <q-icon :name="isDark ? 'dark_mode' : 'light_mode'" />
              </template>
            </q-toggle>
            <q-btn flat dense icon="settings" aria-label="Settings" @click="openSettings" />
            <q-btn flat dense icon="help_outline" aria-label="Help" @click="openHelp" />
            <q-avatar size="32px" class="q-ml-sm">NM</q-avatar>
          </div>
        </q-toolbar>
      </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Dark } from 'quasar';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';

const linksList: EssentialLinkProps[] = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev'
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev'
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev'
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev'
  }
];

const leftDrawerOpen = ref(false);
const search = ref('');
const connectionLabel = ref('No connection');
const connections = ref<{ id: string; name: string }[]>([]);
const connectionOptions = ref<{ label: string; value: string }[]>([]);
const selectedConnectionId = ref<string | null>(null);
const isDark = ref(Dark.isActive);

onMounted(() => {
  window.addEventListener('nebula:select-connection', (e: Event) => {
    const c = (e as CustomEvent).detail as { id: string; name: string };
    connectionLabel.value = c?.name || 'No connection';
  });
  // reload connections when changed elsewhere (sidebar add/delete)
  window.addEventListener('nebula:connections-updated', () => {
    void (async () => {
      try {
        const list = await window.nebulaAPI.loadConnections();
        connections.value = list.map((x) => ({ id: x.id, name: x.name }));
        connectionOptions.value = connections.value.map((c) => ({ label: c.name, value: c.id }));
      } catch (err) {
        console.error('Failed to refresh connections after update', err);
      }
    })();
  });
  // load connections for header chooser
  void (async () => {
    try {
      const list = await window.nebulaAPI.loadConnections();
      connections.value = list.map((x) => ({ id: x.id, name: x.name }));
      connectionOptions.value = connections.value.map((c) => ({ label: c.name, value: c.id }));
    } catch (err) {
      console.error('Failed to load connections for header', err);
    }
  })();
});

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function onToggleTheme (val: boolean) {
  Dark.set(!!val);
  isDark.value = !!val;
  try {
    const s = await window.nebulaAPI.loadSettings();
    const next = Object.assign({}, s || {}, { theme: val ? 'dark' : 'light' });
    await window.nebulaAPI.saveSettings(next);
  } catch (err) {
    console.error('Failed to save theme setting', err);
  }
}

// watch selectedConnectionId change to notify other components
watch(selectedConnectionId, (id) => {
  const conn = connections.value.find((c) => c.id === id);
  if (conn) {
    window.dispatchEvent(new CustomEvent('nebula:select-connection', { detail: conn }));
    connectionLabel.value = conn.name;
  }
});

function openSettings () {
  // open settings later — placeholder
  window.alert('Settings (not implemented)');
}

function openHelp () {
  window.alert('Help (not implemented)');
}
</script>

<style scoped>
.main-header { background: var(--q-color-dark); color: #eaeaea; }
.app-brand { gap: 8px; }
.app-logo { background: var(--q-color-primary); color: white; width: 34px; height: 34px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-weight:700 }
.app-title { margin-left: 6px; font-size: 18px; font-weight:600 }
.app-subtitle { margin-left: 8px; color: var(--q-color-grey-4); font-size: 12px }
.search-input { width: 320px; max-width: 40vw }
.connection-status { color: var(--q-color-grey-3); font-size: 13px }
.header-actions q-btn { min-width: 40px }
</style>

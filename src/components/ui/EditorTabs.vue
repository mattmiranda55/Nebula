<template>
  <div class="editor-tabs q-pa-sm">
    <q-tabs v-model="tab" dense class="text-subtitle2">
      <q-tab v-for="t in tabs" :key="t.id" :name="t.id" :label="t.title" />
      <q-space />
      <q-btn dense flat icon="add" @click="newTab" />
    </q-tabs>

    <q-separator />

    <div class="tab-content q-pa-sm">
      <slot :activeTab="activeTab" :updateSql="updateSql"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';

interface Tab { id: string; title: string; sql: string }

const tab = ref('t-1');
const tabs = reactive<Tab[]>([{ id: 't-1', title: 'Query 1', sql: '' }]);

const newTab = () => {
  const id = `t-${Date.now()}`;
  tabs.push({ id, title: `Query ${tabs.length + 1}`, sql: '' });
  tab.value = id;
};

const activeTab = computed(() => tabs.find((t) => t.id === tab.value)!);
const updateSql = (sql: string) => {
  const t = tabs.find((x) => x.id === tab.value);
  if (t) t.sql = sql;
};

// expose for parent usage via template slot props
</script>

<style scoped>
.editor-tabs { background: white; }
.tab-content { min-height: 220px; }
</style>

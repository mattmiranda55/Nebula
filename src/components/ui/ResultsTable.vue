<template>
  <div class="results q-pa-sm">
    <div class="row items-center">
      <div class="text-subtitle2">Results</div>
      <q-space />
      <div class="text-caption">{{ rows.length }} rows</div>
    </div>

    <q-separator class="q-mt-sm q-mb-sm" />

    <q-table :columns="columns" :rows="rows" flat grid />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

type Row = Record<string, unknown>;
const { columns, rows } = defineProps<{ columns: { name: string; field: string | ((row: Row) => unknown); required?: boolean; label: string; align?: 'left' | 'right' | 'center' }[]; rows: Row[] }>();
</script>

<style scoped>
.results { background: white; border-radius: 6px; }
</style>

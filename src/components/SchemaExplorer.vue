<template>
  <div class="h-full bg-white dark:bg-gray-800">
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-5 h-5 text-green-600"></div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Schema Explorer</h3>
      </div>
      <div v-if="connectionName" class="flex items-center gap-2">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">{{ connectionName }}</p>
      </div>
    </div>

    <div class="overflow-y-auto h-[calc(100%-80px)]">
      <div v-if="loading" class="p-6 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
        <p class="text-sm text-gray-600 dark:text-gray-400">Loading schema...</p>
      </div>
      <div v-else-if="tables.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
        <div class="w-12 h-12 mx-auto mb-3 opacity-50 bg-gray-700 rounded-full"></div>
        <p class="text-sm">No tables found</p>
      </div>
      <div v-else class="p-2">
        <div v-for="table in tables" :key="table.name" class="mb-1">
          <button class="w-full flex items-center gap-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg text-left transition-colors group" @click="toggleTable(table.name)">
            <div class="flex-shrink-0">
              <span v-if="expandedTables.has(table.name)">▼</span>
              <span v-else>▶</span>
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-sm font-medium text-gray-900 dark:text-white block truncate">{{ table.name }}</span>
              <span v-if="table.schema" class="text-xs text-gray-500 dark:text-gray-400">{{ table.schema }}</span>
            </div>
          </button>

          <div v-if="expandedTables.has(table.name)" class="ml-10 mt-1 space-y-1">
            <div v-if="tableColumns.has(table.name)">
              <div v-for="column in tableColumns.get(table.name) || []" :key="column.name" class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded text-sm border-l-2 border-gray-200 dark:border-gray-600">
                <div class="flex items-center gap-3">
                  <span class="font-mono text-gray-900 dark:text-gray-100 text-xs flex-shrink-0 min-w-[120px]">{{ column.name }}</span>
                  <span class="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ column.data_type }}</span>
                  <span v-if="column.is_nullable === 'NO'" class="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">NOT NULL</span>
                  <span v-else class="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">NULL</span>
                </div>
              </div>
            </div>
            <div v-else class="p-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded">
              <div class="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
              Loading columns...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, watch, onMounted } from 'vue'
import { getTables, getColumns } from '../lib/api/db'

export default {
  name: 'SchemaExplorer',
  props: { connectionName: { type: String, default: '' } },
  setup(props, { emit }){
    const tables = ref([])
    const expandedTables = ref(new Set())
    const tableColumns = ref(new Map())
    const loading = ref(false)

    async function loadTables(){
      if (!props.connectionName) return
      loading.value = true
      try{ tables.value = await getTables(props.connectionName) }catch(e){ console.error(e) }finally{ loading.value = false }
    }

    async function toggleTable(tableName:string){
      if (expandedTables.value.has(tableName)){
        expandedTables.value.delete(tableName)
        expandedTables.value = new Set(expandedTables.value)
      } else {
        expandedTables.value.add(tableName)
        expandedTables.value = new Set(expandedTables.value)
        if (!tableColumns.value.has(tableName)){
          try{
            const cols = await getColumns(props.connectionName, tableName)
            tableColumns.value.set(tableName, cols)
            tableColumns.value = new Map(tableColumns.value)
          }catch(e){ console.error(e) }
        }
      }
    }

    watch(() => props.connectionName, (v) => { if (v) loadTables() })

    onMounted(() => { if (props.connectionName) loadTables() })

    return { tables, expandedTables, tableColumns, loading, toggleTable }
  }
}
</script>

<style scoped>
</style>

<script lang="ts">
  import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
  import { ChevronDownOutline, ChevronRightOutline, TableColumnOutline } from 'flowbite-svelte-icons';
  import { getTables, getColumns, type TableInfo, type ColumnInfo } from '$lib/api/db';
  import { createEventDispatcher } from 'svelte';

  export let connectionName: string = '';
  
  let tables: TableInfo[] = [];
  let expandedTables: Set<string> = new Set();
  let tableColumns: Map<string, ColumnInfo[]> = new Map();
  let loading = false;
  
  const dispatch = createEventDispatcher();

  async function loadTables() {
    if (!connectionName) return;
    loading = true;
    try {
      tables = await getTables(connectionName);
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      loading = false;
    }
  }

  async function toggleTable(tableName: string) {
    if (expandedTables.has(tableName)) {
      expandedTables.delete(tableName);
      expandedTables = expandedTables;
    } else {
      expandedTables.add(tableName);
      expandedTables = expandedTables;
      
      if (!tableColumns.has(tableName)) {
        try {
          const columns = await getColumns(connectionName, tableName);
          tableColumns.set(tableName, columns);
          tableColumns = tableColumns;
        } catch (error) {
          console.error('Failed to load columns:', error);
        }
      }
    }
  }

  function selectTable(tableName: string) {
    dispatch('selectTable', { table: tableName });
  }

  $: if (connectionName) {
    loadTables();
  }
</script>

<div class="h-full bg-white dark:bg-gray-800">
  <div class="p-4 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center gap-2 mb-2">
      <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Schema Explorer</h3>
    </div>
    {#if connectionName}
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">{connectionName}</p>
      </div>
    {/if}
  </div>

  <div class="overflow-y-auto h-[calc(100%-80px)]">
    {#if loading}
      <div class="p-6 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
        <p class="text-sm text-gray-600 dark:text-gray-400">Loading schema...</p>
      </div>
    {:else if tables.length === 0}
      <div class="p-6 text-center text-gray-500 dark:text-gray-400">
        {#if connectionName}
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-sm">No tables found</p>
        {:else}
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p class="text-sm">Select a connection to explore schema</p>
        {/if}
      </div>
    {:else}
      <div class="p-2">
        {#each tables as table}
          <div class="mb-1">
            <button
              class="w-full flex items-center gap-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg text-left transition-colors group"
              onclick={() => toggleTable(table.name)}
            >
              <div class="flex-shrink-0">
                {#if expandedTables.has(table.name)}
                  <ChevronDownOutline class="w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300 transition-colors" />
                {:else}
                  <ChevronRightOutline class="w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300 transition-colors" />
                {/if}
              </div>
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div class="flex-1 min-w-0">
                <span class="text-sm font-medium text-gray-900 dark:text-white block truncate">{table.name}</span>
                {#if table.schema}
                  <span class="text-xs text-gray-500 dark:text-gray-400">{table.schema}</span>
                {/if}
              </div>
            </button>

            {#if expandedTables.has(table.name)}
              <div class="ml-10 mt-1 space-y-1">
                {#if tableColumns.has(table.name)}
                  {#each tableColumns.get(table.name) || [] as column}
                    <div class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded text-sm border-l-2 border-gray-200 dark:border-gray-600">
                      <div class="flex items-center gap-3">
                        <span class="font-mono text-gray-900 dark:text-gray-100 text-xs flex-shrink-0 min-w-[120px]">{column.name}</span>
                        <span class="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{column.data_type}</span>
                        {#if column.is_nullable === 'NO'}
                          <span class="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">NOT NULL</span>
                        {:else}
                          <span class="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">NULL</span>
                        {/if}
                      </div>
                    </div>
                  {/each}
                {:else}
                  <div class="p-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded">
                    <div class="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                    Loading columns...
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>


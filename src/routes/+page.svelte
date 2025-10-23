<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Tabs, TabItem } from 'flowbite-svelte';
  import { PlayOutline, DatabaseOutline, CogOutline, EyeOutline } from 'flowbite-svelte-icons';
  import ConnectionManager from '$lib/components/ConnectionManager.svelte';
  import SchemaExplorer from '$lib/components/SchemaExplorer.svelte';
  import SqlEditor from '$lib/components/SqlEditor.svelte';
  import QueryResults from '$lib/components/QueryResults.svelte';
  import { executeQuery, type QueryResult } from '$lib/api/db';

  let currentConnection = '';
  let sqlQuery = 'SELECT * FROM users LIMIT 10;';
  let queryResult: QueryResult | null = null;
  let queryError = '';
  let executing = false;
  let editor: SqlEditor;
  let sidebarCollapsed = false;
  let showSettings = false;

  function handleConnectionChange(event: CustomEvent) {
    currentConnection = event.detail.connection;
    queryResult = null;
    queryError = '';
  }

  function handleSqlChange(value: string) {
    sqlQuery = value;
  }

  async function handleExecuteQuery() {
    if (!currentConnection) {
      queryError = 'Please select a connection first';
      return;
    }

    if (!sqlQuery.trim()) {
      queryError = 'Please enter a query';
      return;
    }

    executing = true;
    queryError = '';
    queryResult = null;

    try {
      const result = await executeQuery(currentConnection, sqlQuery);
      queryResult = result;
    } catch (error) {
      queryError = String(error);
    } finally {
      executing = false;
    }
  }

  function handleSelectTable(event: CustomEvent) {
    const tableName = event.detail.table;
    sqlQuery = `SELECT * FROM ${tableName} LIMIT 10;`;
    if (editor) {
      editor.setValue(sqlQuery);
    }
  }

  function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
  }

  function toggleSettings() {
    showSettings = !showSettings;
  }

  // Initialize dark mode on component mount
  onMount(() => {
    // initializeDarkMode(); // Removed dark mode initialization
  });
</script>

<div class="h-screen bg-gray-900 text-white font-sans antialiased">
  <!-- Top Toolbar -->
  <header class="bg-gray-800 border-b border-gray-700 px-4 py-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          onclick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          {#if sidebarCollapsed}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          {/if}
        </button>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold">Nebula</h1>
            <p class="text-xs text-gray-400">Universal Database Management</p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        {#if currentConnection}
          <div class="flex items-center gap-2 px-3 py-1 bg-green-900/30 rounded-full">
            <DatabaseOutline class="w-4 h-4 text-green-400" />
            <span class="text-sm font-medium text-green-300">{currentConnection}</span>
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        {:else}
          <div class="px-3 py-1 bg-gray-700 rounded-full">
            <span class="text-sm text-gray-400">No Connection</span>
          </div>
        {/if}

        <Button
          size="sm"
          color="primary"
          onclick={handleExecuteQuery}
          disabled={!currentConnection || executing}
          class="shadow-sm"
        >
          <PlayOutline class="w-4 h-4 mr-2" />
          {executing ? 'Executing...' : 'Execute'}
        </Button>

        <button
          class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          onclick={toggleSettings}
          aria-label="Settings"
        >
          <CogOutline class="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>

  <!-- Main Layout -->
  <div class="flex h-[calc(100vh-64px)]">
    <!-- Left Sidebar -->
    <aside class="bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out {sidebarCollapsed ? 'w-0' : 'w-80'}">
      <div class="w-80 h-full overflow-hidden">
        <ConnectionManager on:connectionChanged={handleConnectionChange} />

        {#if currentConnection}
          <div class="h-[calc(100%-200px)] overflow-hidden">
            <SchemaExplorer connectionName={currentConnection} on:selectTable={handleSelectTable} />
          </div>
        {/if}
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col bg-gray-900">
      <!-- SQL Editor Area -->
      <div class="flex-1 p-4">
        <div class="bg-gray-800 rounded-lg shadow-sm border border-gray-700 h-full flex flex-col">
          <div class="px-4 py-3 border-b border-gray-700">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Query Editor</h2>
              <div class="flex items-center gap-2">
                <button class="p-2 hover:bg-gray-700 rounded text-sm transition-colors" class:font-semibold={sqlQuery.trim()}>
                  Untitled
                </button>
              </div>
            </div>
          </div>

          <div class="flex-1 min-h-0">
            <SqlEditor bind:this={editor} value={sqlQuery} onChange={handleSqlChange} />
          </div>
        </div>
      </div>

      <!-- Bottom Panel -->
      <div class="h-80 bg-gray-800 border-t border-gray-700">
        <Tabs class="h-full">
          <TabItem title="Results" class="h-full">
            <div class="h-[calc(100%-48px)] p-4">
              <QueryResults result={queryResult} error={queryError} {executing} />
            </div>
          </TabItem>
          <TabItem title="Messages" class="h-full">
            <div class="h-[calc(100%-48px)] p-4">
              {#if queryError}
                <div class="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 class="font-semibold text-red-300">Error</h3>
                      <p class="text-sm text-red-400 mt-1">{queryError}</p>
                    </div>
                  </div>
                </div>
              {:else if executing}
                <div class="flex items-center justify-center h-full">
                  <div class="text-center">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p class="text-gray-400">Executing query...</p>
                  </div>
                </div>
              {:else if queryResult}
                <div class="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                  <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 class="font-semibold text-green-300">Success</h3>
                      <p class="text-sm text-green-400 mt-1">
                        Query executed successfully. {queryResult.rows_affected || 0} row(s) affected.
                      </p>
                    </div>
                  </div>
                </div>
              {:else}
                <div class="flex items-center justify-center h-full text-gray-400">
                  <div class="text-center">
                    <EyeOutline class="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Execute a query to see results here</p>
                  </div>
                </div>
              {/if}
            </div>
          </TabItem>
        </Tabs>
      </div>
    </main>
  </div>

  <!-- Settings Modal -->
  {#if showSettings}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onclick={toggleSettings}
      onkeydown={(e) => e.key === 'Escape' && toggleSettings()}
      role="button"
      tabindex="0"
    >
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4" onclick={(e) => e.stopPropagation()}>
        <div class="px-6 py-4 border-b border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white">Settings</h2>
            <button
              class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              onclick={toggleSettings}
              aria-label="Close Settings"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="px-6 py-4 space-y-4">
          <div>
            <h3 class="text-sm font-medium text-white mb-3">Editor</h3>
            <div class="space-y-2">
              <div class="text-sm text-gray-400">
                <p>Monaco Editor with SQL syntax highlighting</p>
                <p class="text-xs mt-1">Theme is permanently set to dark mode</p>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-700 bg-gray-700 rounded-b-lg">
          <div class="flex justify-end">
            <Button color="light" size="sm" onclick={toggleSettings}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
  @reference "tailwindcss";

  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(.tab-content) {
    height: 100%;
  }
</style>

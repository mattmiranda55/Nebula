<script lang="ts">
  import { Button, Modal, Label, Input, Select, Alert } from 'flowbite-svelte';
  import { PlusOutline, DatabaseOutline, TrashBinOutline, ChevronRightOutline, ServerOutline } from 'flowbite-svelte-icons';
  import { connectToDb, disconnectFromDb, listConnections, type ConnectRequest } from '$lib/api/db';
  import { createEventDispatcher } from 'svelte';

  let showModal = false;
  let connections: string[] = [];
  let selectedConnection = '';
  let error = '';
  let success = '';
  let loading = false;

  // Form fields
  let name = '';
  let dbType = 'postgres';
  let url = '';
  let database = '';

  const dispatch = createEventDispatcher();

  const dbTypes = [
    { value: 'postgres', name: 'PostgreSQL', icon: DatabaseOutline },
    { value: 'mysql', name: 'MySQL', icon: DatabaseOutline },
    { value: 'sqlite', name: 'SQLite', icon: DatabaseOutline },
    { value: 'mongodb', name: 'MongoDB', icon: DatabaseOutline }
  ];

  const dbIcons = {
    postgres: DatabaseOutline,
    mysql: DatabaseOutline,
    sqlite: DatabaseOutline,
    mongodb: DatabaseOutline
  };

  async function loadConnections() {
    loading = true;
    try {
      connections = await listConnections();
    } catch (err) {
      console.error('Failed to load connections:', err);
    } finally {
      loading = false;
    }
  }

  async function handleConnect() {
    error = '';
    success = '';

    const request: ConnectRequest = {
      name,
      url,
      db_type: dbType,
      ...(dbType === 'mongodb' && { database })
    };

    try {
      await connectToDb(request);
      success = `Connected to ${name} successfully!`;
      showModal = false;
      await loadConnections();
      selectedConnection = name;
      dispatch('connectionChanged', { connection: name });

      // Reset form
      name = '';
      url = '';
      database = '';

      setTimeout(() => {
        success = '';
      }, 3000);
    } catch (err) {
      error = String(err);
    }
  }

  async function handleDisconnect(connectionName: string) {
    try {
      await disconnectFromDb(connectionName);
      await loadConnections();
      if (selectedConnection === connectionName) {
        selectedConnection = '';
        dispatch('connectionChanged', { connection: '' });
      }
    } catch (err) {
      error = String(err);
    }
  }

  function selectConnection(connectionName: string) {
    selectedConnection = connectionName;
    dispatch('connectionChanged', { connection: connectionName });
  }

  function getPlaceholder() {
    switch (dbType) {
      case 'postgres':
        return 'postgres://user:password@localhost:5432/dbname';
      case 'mysql':
        return 'mysql://user:password@localhost:3306/dbname';
      case 'sqlite':
        return 'sqlite://path/to/database.db';
      case 'mongodb':
        return 'mongodb://localhost:27017';
      default:
        return '';
    }
  }

  // Load connections on mount
  loadConnections();
</script>

<div class="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <ServerOutline class="w-5 h-5 text-blue-600 dark:text-blue-400" />
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Database Connections</h2>
    </div>
    <Button size="sm" color="primary" onclick={() => showModal = true} class="shadow-sm">
      <PlusOutline class="w-4 h-4 mr-2" />
      New Connection
    </Button>
  </div>

  {#if success}
    <Alert color="green" class="mb-4">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {success}
      </div>
    </Alert>
  {/if}

  {#if loading}
    <div class="flex items-center justify-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  {:else}
    <div class="space-y-2 max-h-64 overflow-y-auto">
      {#each connections as connection}
        <button
          type="button"
          class="flex items-center justify-between w-full p-3 rounded-lg border transition-all
                 {selectedConnection === connection
                   ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                   : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'}"
          onclick={() => selectConnection(connection)}
        >
          <div class="flex items-center gap-3">
            <DatabaseOutline class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div class="text-left">
              <span class="font-medium text-gray-900 dark:text-white block">{connection}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">Connected</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Button
              size="xs"
              color="red"
              onclick={(e: MouseEvent) => {
                e.stopPropagation();
                handleDisconnect(connection);
              }}
              class="opacity-60 hover:opacity-100"
            >
              <TrashBinOutline class="w-3 h-3" />
            </Button>
          </div>
        </button>
      {/each}

      {#if connections.length === 0}
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
          <DatabaseOutline class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p class="text-sm">No connections configured</p>
          <p class="text-xs mt-1">Add your first database connection to get started</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<Modal bind:open={showModal} size="lg" title="New Database Connection">
  <div class="space-y-6">
    {#if error}
      <Alert color="red" dismissable>
        <div class="flex items-start gap-2">
          <svg class="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      </Alert>
    {/if}

    <div class="space-y-4">
      <div>
        <Label for="name" class="mb-2 block text-sm font-medium">Connection Name</Label>
        <Input id="name" bind:value={name} placeholder="My Database" required class="w-full" />
      </div>

      <div>
        <Label for="dbType" class="mb-2 block text-sm font-medium">Database Type</Label>
        <Select id="dbType" bind:value={dbType} items={dbTypes} class="w-full" />
      </div>

      {#if dbType === 'mongodb'}
        <div>
          <Label for="database" class="mb-2 block text-sm font-medium">Database Name</Label>
          <Input id="database" bind:value={database} placeholder="mydb" required class="w-full" />
        </div>
      {/if}

      <div>
        <Label for="url" class="mb-2 block text-sm font-medium">Connection URL</Label>
        <Input id="url" bind:value={url} placeholder={getPlaceholder()} required class="w-full font-mono text-sm" />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Example: {getPlaceholder()}
        </p>
      </div>
    </div>
  </div>

  {#snippet footer()}
    <div class="flex gap-3 justify-end">
      <Button color="alternative" onclick={() => showModal = false}>Cancel</Button>
      <Button color="primary" onclick={handleConnect} disabled={!name || !url}>Connect</Button>
    </div>
  {/snippet}
</Modal>


<template>
  <div class="card p-3">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v6m0 8v6m10-10h-6M8 12H2"/></svg>
        <h2 class="text-sm font-semibold text-white">Connections</h2>
      </div>
      <button class="btn-primary" @click="showModal = true">New</button>
    </div>

    <div v-if="success" class="mb-3 text-green-400">{{ success }}</div>

    <div v-if="loading" class="flex items-center justify-center py-6">
      <div class="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="space-y-2 max-h-64 overflow-y-auto">
      <div v-for="connection in connections" :key="connection">
        <button
          type="button"
          class="flex items-center justify-between w-full p-3 rounded-lg transition-all"
          :class="selectedConnection === connection ? 'bg-gradient-to-r from-blue-700/20 to-purple-700/10 shadow-sm' : 'hover:bg-gray-800/40'"
          @click="selectConnection(connection)"
        >
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v6m0 8v6m10-10h-6M8 12H2"/></svg>
            <div class="text-left min-w-0">
              <span class="font-medium text-white block truncate">{{ connection }}</span>
              <span class="text-xs text-gray-400">Connected</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <button class="opacity-60 hover:opacity-100" @click.stop="handleDisconnect(connection)">✕</button>
          </div>
        </button>
      </div>

      <div v-if="connections.length === 0" class="text-center py-6 text-gray-400">
        <div class="w-10 h-10 mx-auto mb-2 opacity-50 bg-gray-700 rounded-full"></div>
        <p class="text-sm">No connections</p>
        <p class="text-xs mt-1 text-gray-500">Add your first database connection</p>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-4" @click.stop>
        <h3 class="text-lg font-semibold mb-3">New Database Connection</h3>

        <div v-if="error" class="p-2 bg-red-900/8 border border-red-800 rounded text-sm text-red-300 mb-3">{{ error }}</div>

        <form @submit.prevent="handleConnect" class="space-y-3">
          <div>
            <label class="block text-sm mb-1">Connection Name</label>
            <input v-model="name" required class="w-full rounded px-3 py-2 bg-gray-900 border border-gray-800 text-sm" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm mb-1">Host</label>
              <input v-model="host" placeholder="localhost" class="w-full rounded px-3 py-2 bg-gray-900 border border-gray-800 text-sm" />
            </div>
            <div>
              <label class="block text-sm mb-1">Port</label>
              <input v-model="port" :placeholder="getDefaultPort(dbType)" class="w-full rounded px-3 py-2 bg-gray-900 border border-gray-800 text-sm" />
            </div>

            <div>
              <label class="block text-sm mb-1">Username</label>
              <input v-model="username" placeholder="user" class="w-full rounded px-3 py-2 bg-gray-900 border border-gray-800 text-sm" />
            </div>

            <div>
              <label class="block text-sm mb-1">Password</label>
              <input v-model="password" type="password" placeholder="password" class="w-full rounded px-3 py-2 bg-gray-900 border border-gray-800 text-sm" />
            </div>

            <div class="col-span-2">
              <label class="block text-sm mb-1">Default Database</label>
              <input v-model="database" placeholder="database name (optional)" class="w-full rounded px-3 py-2 bg-gray-900 border border-gray-800 text-sm" />
            </div>

            <div class="col-span-2">
              <label class="block text-sm mb-1">Or full connection URL (optional)</label>
              <input v-model="url" :placeholder="getPlaceholder()" class="w-full rounded px-3 py-2 bg-gray-900 border border-gray-800 font-mono text-sm" />
              <p class="mt-1 text-xs text-gray-400">If provided, the URL will be used verbatim; otherwise host/port/credentials will be combined.</p>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button type="button" class="px-3 py-1 rounded bg-gray-700 text-sm" @click="showModal = false">Cancel</button>
            <button type="submit" class="px-3 py-1 rounded bg-blue-600 text-sm" :disabled="!name.trim() || (!(url && url.trim()) && !(host && host.trim()))">Connect</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { connectToDb, disconnectFromDb, listConnections, type ConnectRequest } from '../lib/api/db'

const showModal = ref(false)

export default {
  name: 'ConnectionManager',
  setup(props, { emit }) {
    const connections = ref<string[]>([])
    const selectedConnection = ref('')
    const error = ref('')
    const success = ref('')
    const loading = ref(false)

    // form fields
    const name = ref('')
    const dbType = ref('postgres')
    const url = ref('')
    const host = ref('')
    const port = ref('')
    const username = ref('')
    const password = ref('')
    const database = ref('')

    function normalizeUrl(input: string, type: string) {
      if (!input) return input
      if (input.includes('://')) return input
      switch (type) {
        case 'postgres': return `postgres://${input}`
        case 'mysql': return `mysql://${input}`
        case 'sqlite': return `sqlite://${input}`
        case 'mongodb': return `mongodb://${input}`
        default: return input
      }
    }

    function getDefaultPort(type: string) {
      switch (type) {
        case 'postgres': return '5432'
        case 'mysql': return '3306'
        case 'mongodb': return '27017'
        default: return ''
      }
    }

    async function loadConnections() {
      loading.value = true
      try {
        connections.value = await listConnections()
      } catch (err) {
        console.error('Failed to load connections:', err)
      } finally {
        loading.value = false
      }
    }

    async function handleConnect() {
      error.value = ''
      success.value = ''

      let finalUrl = ''
      if (url.value && url.value.trim()) {
        finalUrl = normalizeUrl(url.value.trim(), dbType.value)
      } else {
        const p = port.value && port.value.trim() ? `:${port.value.trim()}` : (getDefaultPort(dbType.value) ? `:${getDefaultPort(dbType.value)}` : '')
        const userinfo = username.value ? `${encodeURIComponent(username.value)}${password.value ? `:${encodeURIComponent(password.value)}` : ''}@` : ''

        if (dbType.value === 'sqlite') {
          const path = host.value && host.value.trim() ? host.value.trim() : 'path/to/database.db'
          finalUrl = `sqlite://${path}`
        } else {
          const hostPart = host.value && host.value.trim() ? host.value.trim() : 'localhost'
          const dbPart = database.value && database.value.trim() ? `/${database.value.trim()}` : ''
          finalUrl = `${dbType.value}://${userinfo}${hostPart}${p}${dbPart}`
        }
      }

      const request: ConnectRequest = {
        name: name.value.trim(),
        url: finalUrl,
        db_type: dbType.value,
        ...(dbType.value === 'mongodb' && { database: database.value.trim() })
      }

      try {
        await connectToDb(request)
        success.value = `Connected to ${name.value} successfully!`
        showModal.value = false
        await loadConnections()
        selectedConnection.value = name.value
        emit('connectionChanged', { connection: name.value })

        // reset form
        name.value = ''
        url.value = ''
        host.value = ''
        port.value = ''
        username.value = ''
        password.value = ''
        database.value = ''

        setTimeout(() => { success.value = '' }, 3000)
      } catch (err) {
        error.value = String(err)
      }
    }

    async function handleDisconnect(connectionName: string) {
      try {
        await disconnectFromDb(connectionName)
        await loadConnections()
        if (selectedConnection.value === connectionName) {
          selectedConnection.value = ''
          emit('connectionChanged', { connection: '' })
        }
      } catch (err) {
        error.value = String(err)
      }
    }

    function selectConnection(connectionName: string) {
      selectedConnection.value = connectionName
      emit('connectionChanged', { connection: connectionName })
    }

    function getPlaceholder() {
      switch (dbType.value) {
        case 'postgres': return 'postgres://user:password@localhost:5432/dbname'
        case 'mysql': return 'mysql://user:password@localhost:3306/dbname'
        case 'sqlite': return 'sqlite://path/to/database.db'
        case 'mongodb': return 'mongodb://localhost:27017'
        default: return ''
      }
    }

    onMounted(() => { loadConnections() })

    return {
      connections,
      selectedConnection,
      error,
      success,
      loading,
      name,
      dbType,
      url,
      host,
      port,
      username,
      password,
      database,
      showModal,
      getDefaultPort,
      getPlaceholder,
      handleConnect,
      handleDisconnect,
      selectConnection
    }
  }
}
</script>

<style scoped>
.btn-primary { background: linear-gradient(90deg,#60a5fa,#7c3aed); color:white; padding:6px 10px; border-radius:6px }
</style>

<template>
  <div class="h-screen text-white font-sans antialiased full-bleed">
    <header class="topbar px-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button class="p-2 hover:bg-gray-800 rounded-lg transition-colors" @click="toggleSidebar" aria-label="Toggle Sidebar">
          <svg v-if="sidebarCollapsed" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
          </div>
          <div>
            <h1 class="text-lg font-bold">Nebula</h1>
            <p class="text-xs text-gray-400">Universal Database Management</p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div v-if="currentConnection" class="flex items-center gap-2 px-3 py-1 bg-green-900/30 rounded-full">
          <svg class="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v6m0 8v6m10-10h-6M8 12H2"/></svg>
          <span class="text-sm font-medium text-green-300">{{ currentConnection }}</span>
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <div v-else class="px-3 py-1 bg-gray-700 rounded-full">
          <span class="text-sm text-gray-400">No Connection</span>
        </div>

        <button class="btn-primary" :disabled="!currentConnection || executing" @click="handleExecuteQuery">
          <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7-7 7M5 3v18"/></svg>
          {{ executing ? 'Executing...' : 'Execute' }}
        </button>

        <button class="p-2 hover:bg-gray-800 rounded-lg transition-colors" @click="toggleSettings" aria-label="Settings">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0a1.724 1.724 0 002.6 1.01c.85-.59 2.04.123 1.612 1.079-.3.648-.052 1.41.604 1.732.915.45.915 1.85 0 2.3-.656.322-.904 1.084-.604 1.732.428.956-.762 1.67-1.612 1.079a1.724 1.724 0 00-2.6 1.01c-.299.921-1.602.921-1.901 0a1.724 1.724 0 00-2.6-1.01c-.85.59-2.04-.123-1.612-1.079.3-.648.052-1.41-.604-1.732-.915-.45-.915-1.85 0-2.3.656-.322.904-1.084.604-1.732C5.01 3.05 6.2 2.337 7.05 2.927c.997.69 2.32.69 3.999 0z"/></svg>
        </button>
      </div>
    </header>

    <div class="flex h-[calc(100vh-56px)]">
      <aside :class="['sidebar', sidebarCollapsed ? 'collapsed' : '']">
        <div class="h-full overflow-auto p-3 space-y-3">
          <ConnectionManager @connectionChanged="handleConnectionChange" />
          <SchemaExplorer v-if="currentConnection" :connectionName="currentConnection" @selectTable="handleSelectTable" />
        </div>
      </aside>

      <main class="flex-1 flex flex-col p-4">
        <div class="panel flex flex-col h-full">
          <div class="editor-tabs border-b border-gray-700">
            <div class="flex items-center gap-2">
              <div v-for="t in editorTabs" :key="t.id">
                <button :class="['editor-tab', t.id === activeEditorId ? 'active' : '']" @click="activateEditor(t.id)">{{ t.title }}
                  <span role="button" tabindex="0" class="text-xs text-gray-400 ml-1 cursor-pointer" @click.stop="closeEditor(t.id)" @keydown.enter.stop="closeEditor(t.id)">✕</span>
                </button>
              </div>
              <button class="editor-tab" @click="addEditor">+</button>
            </div>
            <div class="ml-auto flex items-center gap-2">
              <button class="p-2 hover:bg-gray-800 rounded">Save</button>
              <button class="p-2 hover:bg-gray-800 rounded">Split</button>
            </div>
          </div>

          <div class="flex-1 min-h-0 editor-container">
            <SqlEditor v-model="activeEditorValue" />
          </div>

          <div class="mt-3">
            <div class="panel p-0">
              <div class="flex items-center border-b border-gray-700 px-3">
                <div class="flex items-center gap-2 py-2">
                  <div v-for="rt in resultTabs" :key="rt.id">
                    <button :class="['editor-tab', rt.id === activeResultId ? 'active' : '']" @click="activeResultId = rt.id">
                      <span class="truncate max-w-[120px]">{{ rt.title }}</span>
                      <span role="button" tabindex="0" class="text-xs text-gray-400 ml-1 cursor-pointer" @click.stop="closeResult(rt.id)">✕</span>
                    </button>
                  </div>
                </div>
                <div class="ml-auto p-2">
                  <button class="px-2 py-1 text-sm bg-gray-700 rounded" @click="clearResults">Clear</button>
                </div>
              </div>

              <div class="p-3">
                <div v-if="activeResultId">
                  <QueryResults v-for="rt in resultTabs" v-if="rt.id === activeResultId" :key="rt.id" :result="rt.result" :error="rt.error" :executing="executing" />
                </div>
                <div v-else class="p-6 text-sm text-gray-400">No results. Run a query to see results here.</div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>

    <div v-if="showSettings" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="toggleSettings">
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4" @click.stop>
        <div class="px-6 py-4 border-b border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white">Settings</h2>
            <button class="p-2 hover:bg-gray-700 rounded-lg transition-colors" @click="toggleSettings" aria-label="Close Settings">✕</button>
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
            <button class="px-3 py-1 bg-gray-600 rounded" @click="toggleSettings">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed } from 'vue'
import ConnectionManager from './components/ConnectionManager.vue'
import SchemaExplorer from './components/SchemaExplorer.vue'
import SqlEditor from './components/SqlEditor.vue'
import QueryResults from './components/QueryResults.vue'
import { executeQuery } from './lib/api/db'

export default {
  name: 'App',
  components: { ConnectionManager, SchemaExplorer, SqlEditor, QueryResults },
  setup(){
    const currentConnection = ref('')
    const executing = ref(false)
    const sidebarCollapsed = ref(false)
    const showSettings = ref(false)

    // editors
    type EditorTab = { id: string; title: string; value: string }
    const editorTabs = ref<EditorTab[]>([{ id: 't1', title: 'Query 1', value: '' }])
    const activeEditorId = ref('t1')

    // results
    type ResultTab = { id: string; title: string; result: any | null; error: string }
    const resultTabs = ref<ResultTab[]>([])
    const activeResultId = ref<string | null>(null)

    const activeEditor = computed(() => editorTabs.value.find(t => t.id === activeEditorId.value) || { value: '' })
    const activeEditorValue = computed({
      get: () => activeEditor.value.value,
      set: (v: string) => { const tab = editorTabs.value.find(t => t.id === activeEditorId.value); if (tab) tab.value = v }
    })

    function handleConnectionChange(payload: any){
      currentConnection.value = payload.connection
      // clear results
      resultTabs.value = []
      activeResultId.value = null
    }

    function handleSelectTable(event: any){
      const q = `SELECT * FROM ${event.table} LIMIT 10;`
      const tab = editorTabs.value.find(t => t.id === activeEditorId.value)
      if (tab) tab.value = q
    }

    async function handleExecuteQuery(){
      if (!currentConnection.value) return
      const active = editorTabs.value.find(t => t.id === activeEditorId.value)
      if (!active || !active.value.trim()) return
      executing.value = true
      try{
        const res = await executeQuery(currentConnection.value, active.value)
        const rid = `r${Date.now()}`
        resultTabs.value.push({ id: rid, title: `Result ${resultTabs.value.length + 1}`, result: res, error: '' })
        activeResultId.value = rid
      }catch(e){
        const err = String(e)
        const rid = `r${Date.now()}`
        resultTabs.value.push({ id: rid, title: `Result ${resultTabs.value.length + 1}`, result: null, error: err })
        activeResultId.value = rid
      }finally{ executing.value = false }
    }

    function toggleSidebar(){ sidebarCollapsed.value = !sidebarCollapsed.value }
    function toggleSettings(){ showSettings.value = !showSettings.value }

    function addEditor(){ const id = `t${Date.now()}`; editorTabs.value.push({ id, title: `Query ${editorTabs.value.length + 1}`, value: '' }); activeEditorId.value = id }
    function activateEditor(id: string){ activeEditorId.value = id }
    function closeEditor(id: string){ editorTabs.value = editorTabs.value.filter(x => x.id !== id); if (activeEditorId.value === id && editorTabs.value.length) { activeEditorId.value = editorTabs.value[0].id } }

    function closeResult(id: string){ resultTabs.value = resultTabs.value.filter(x => x.id !== id); if (activeResultId.value === id) activeResultId.value = resultTabs.value.length ? resultTabs.value[0].id : null }
    function clearResults(){ resultTabs.value = []; activeResultId.value = null }

    return {
      currentConnection,
      executing,
      sidebarCollapsed,
      showSettings,
      editorTabs,
      activeEditorId,
      resultTabs,
      activeResultId,
      activeEditorValue,
      toggleSidebar,
      toggleSettings,
      addEditor,
      activateEditor,
      closeEditor,
      closeResult,
      clearResults,
      handleConnectionChange,
      handleSelectTable,
      handleExecuteQuery
    }
  }
}
</script>

<style src="./app.css"></style>

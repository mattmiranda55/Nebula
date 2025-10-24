<template>
  <div class="panel flex flex-col h-full">
    <div class="px-4 py-3 results-header">
      <div class="flex items-center justify-between w-full">
        <h3 class="text-lg font-semibold text-white">Query Results</h3>
        <div v-if="result && result.columns && result.columns.length > 0" class="flex items-center gap-2 text-sm text-gray-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{{ result.rows.length }} row{{ result.rows.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <div v-if="executing" class="flex items-center justify-center h-full p-8">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-lg font-medium text-gray-200 mb-2">Executing Query</p>
          <p class="text-sm text-gray-400">Please wait while we fetch your results...</p>
        </div>
      </div>

      <div v-else-if="error" class="p-6">
        <div class="p-4 bg-red-900/8 border border-red-800 rounded-lg">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <h3 class="font-semibold text-red-300 mb-1">Query Error</h3>
              <p class="text-sm text-red-400 leading-relaxed">{{ error }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="result">
        <div v-if="result.columns.length === 0" class="p-6">
          <div class="p-4 bg-green-900/8 border border-green-800 rounded-lg">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-semibold text-green-300">Success</h3>
                <p class="text-sm text-green-400 mt-1">Query executed successfully. {{ result.rows_affected || 0 }} row(s) affected.</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="p-2">
          <div class="overflow-x-auto">
            <table class="w-full text-sm table-styled">
              <thead class="bg-transparent">
                <tr class="border-b border-gray-700">
                  <th v-for="(column, i) in result.columns" :key="i" class="px-4 py-3 text-left font-semibold text-gray-200 border-r border-gray-700 last:border-r-0">{{ column }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in result.rows" :key="rowIndex" class="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="px-4 py-3 text-gray-200 border-r border-gray-800 last:border-r-0 align-top">
                    <span v-if="cell === null || cell === undefined" class="text-gray-400 italic text-xs">NULL</span>
                    <span v-else class="font-mono text-xs break-all">{{ String(cell) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else class="flex items-center justify-center h-full p-8">
        <div class="text-center text-gray-400">
          <div class="w-16 h-16 mx-auto mb-4 opacity-50 bg-gray-700 rounded-full"></div>
          <p class="text-lg font-medium mb-2">No Results</p>
          <p class="text-sm">Execute a query to see results here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'QueryResults',
  props: {
    result: { type: Object, default: null },
    error: { type: String, default: '' },
    executing: { type: Boolean, default: false }
  }
})
</script>

<style scoped>
/* reuse project styles */
</style>

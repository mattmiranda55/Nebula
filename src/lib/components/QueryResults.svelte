<script lang="ts">
  import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, Alert } from 'flowbite-svelte';
  import { CheckCircleOutline, CloseCircleOutline } from 'flowbite-svelte-icons';
  import type { QueryResult } from '$lib/api/db';

  export let result: QueryResult | null = null;
  export let error: string = '';
  export let executing = false;
</script>

<div class="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
  <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Query Results</h3>
      {#if result && result.columns.length > 0}
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{result.rows.length} row{result.rows.length !== 1 ? 's' : ''}</span>
        </div>
      {/if}
    </div>
  </div>

  <div class="flex-1 overflow-auto">
    {#if executing}
      <div class="flex items-center justify-center h-full p-8">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Executing Query</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Please wait while we fetch your results...</p>
        </div>
      </div>
    {:else if error}
      <div class="p-6">
        <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <h3 class="font-semibold text-red-800 dark:text-red-300 mb-1">Query Error</h3>
              <p class="text-sm text-red-700 dark:text-red-400 leading-relaxed">{error}</p>
            </div>
          </div>
        </div>
      </div>
    {:else if result}
      {#if result.columns.length === 0}
        <div class="p-6">
          <div class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-semibold text-green-800 dark:text-green-300">Success</h3>
                <p class="text-sm text-green-700 dark:text-green-400 mt-1">
                  Query executed successfully. {result.rows_affected || 0} row(s) affected.
                </p>
              </div>
            </div>
          </div>
        </div>
      {:else}
        <div class="p-4">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-700/50">
                <tr class="border-b border-gray-200 dark:border-gray-600">
                  {#each result.columns as column, i}
                    <th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600 last:border-r-0">
                      {column}
                    </th>
                  {/each}
                </tr>
              </thead>
              <tbody>
                {#each result.rows as row, rowIndex}
                  <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    {#each row as cell, cellIndex}
                      <td class="px-4 py-3 text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700 last:border-r-0 align-top">
                        {#if cell === null || cell === undefined}
                          <span class="text-gray-400 dark:text-gray-500 italic text-xs">NULL</span>
                        {:else}
                          <span class="font-mono text-xs break-all">{String(cell)}</span>
                        {/if}
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}
    {:else}
      <div class="flex items-center justify-center h-full p-8">
        <div class="text-center text-gray-500 dark:text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-lg font-medium mb-2">No Results</p>
          <p class="text-sm">Execute a query to see results here</p>
        </div>
      </div>
    {/if}
  </div>
</div>


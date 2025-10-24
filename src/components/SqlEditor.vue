<template>
  <div ref="editorContainer" class="w-full h-full min-h-[300px]"></div>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import loader from '@monaco-editor/loader'
import type * as Monaco from 'monaco-editor'

export default {
  name: 'SqlEditor',
  props: {
    modelValue: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }){
    const editorContainer = ref<HTMLElement | null>(null)
    let editor: Monaco.editor.IStandaloneCodeEditor | null = null

    onMounted(async () => {
      const monaco = await loader.init()
      editor = monaco.editor.create(editorContainer.value as HTMLElement, {
        value: props.modelValue,
        language: 'sql',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        wrappingStrategy: 'advanced'
      })

      editor.onDidChangeModelContent(() => {
        const newValue = editor?.getValue() || ''
        emit('update:modelValue', newValue)
      })
    })

    watch(() => props.modelValue, (v) => {
      if (editor && editor.getValue() !== v) editor.setValue(v)
    })

    onBeforeUnmount(() => { editor?.dispose() })

    return { editorContainer }
  }
}
</script>

<style scoped>
:global(.monaco-editor) { font-family: 'JetBrains Mono', monospace !important }
</style>

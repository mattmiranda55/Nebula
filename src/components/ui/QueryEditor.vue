<template>
  <div class="query-editor">
    <div class="row items-center q-pa-sm">
      <div class="text-subtitle2">SQL Editor</div>
      <q-space />
      <q-btn dense color="primary" label="Run" @click="onRun" icon="play_arrow" />
    </div>

    <div class="q-pa-sm">
      <div ref="editorEl" class="editor-container" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, onMounted, onUnmounted, ref, watch } from 'vue';
import type * as Monaco from 'monaco-editor';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'run'): void;
}>();

const editorEl = ref<HTMLElement | null>(null);
type MonacoEditor = Monaco.editor.IStandaloneCodeEditor | null;
let editor: MonacoEditor = null;

onMounted(async () => {
  const monaco = await import('monaco-editor');
  editor = monaco.editor.create(editorEl.value!, {
    value: props.modelValue || '',
    language: 'sql',
    automaticLayout: true,
    minimap: { enabled: false },
  });

  editor.onDidChangeModelContent(() => {
    const v = editor!.getValue();
    emit('update:modelValue', v);
  });
});

onUnmounted(() => {
  if (editor) editor.dispose();
});

watch(() => props.modelValue, (v) => {
  if (editor && editor.getValue() !== v) editor.setValue(v || '');
});

const onRun = () => emit('run');
</script>

<style scoped>
.editor-container { height: 300px; border-radius: 6px; overflow: hidden; }
</style>

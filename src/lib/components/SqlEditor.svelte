<script lang="ts">
  import { onMount } from 'svelte';
  import loader from '@monaco-editor/loader';
  import type * as Monaco from 'monaco-editor';

  export let value = '';
  export let onChange: (value: string) => void = () => {};

  let editorContainer: HTMLElement;
  let editor: Monaco.editor.IStandaloneCodeEditor | null = null;

  onMount(() => {
    (async () => {
      const monaco = await loader.init();

      editor = monaco.editor.create(editorContainer, {
        value: value,
        language: 'sql',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        wrappingStrategy: 'advanced',
      });

      editor.onDidChangeModelContent(() => {
        if (editor) {
          const newValue = editor.getValue();
          onChange(newValue);
        }
      });
    })();

    return () => {
      editor?.dispose();
    };
  });

  export function getValue(): string {
    return editor?.getValue() || '';
  }

  export function setValue(newValue: string): void {
    if (editor) {
      editor.setValue(newValue);
    }
  }
</script>

<div bind:this={editorContainer} class="w-full h-full min-h-[300px]"></div>


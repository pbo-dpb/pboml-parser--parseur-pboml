<template>
<Suspense>
<div>
  <FilePicker v-if="!shouldDisplayEditor && !pbomlDocument" @pick=""></FilePicker>
  <Editor v-if="shouldDisplayEditor && pbomlDocument"></Editor>
  <Renderer v-if="!shouldDisplayEditor && pbomlDocument" :pboml-document="pbomlDocument"></Renderer>
</div>
<template #fallback>
  <LoadingIndicator class="w-8 h-8" />
</template>
</Suspense>
</template>
<script setup>
import yaml from 'js-yaml'

import { ref, defineAsyncComponent, computed } from 'vue'
import LoadingIndicator from './components/LoadingIndicator.vue'
import Renderer from './components/Renderer/Renderer.vue'

const Editor = defineAsyncComponent(() =>
  import('./components/Editor/Editor.vue')
)

const FilePicker = defineAsyncComponent(() =>
  import('./components/FilePicker/FilePicker.vue')
)

const props = defineProps({
    payload: {
      type: String, required: false
    }, 
    edit: {
      type: Boolean,
      required: false
  }});

let pbomlDocument;
if (props.payload) {
  pbomlDocument = ref(yaml.loadAll(props.payload));
} else {
  pbomlDocument = ref(null);
}

const language = (document.documentElement.lang)

const shouldDisplayEditor = computed(() => {
  return props.edit ? true : false;
})


</script>
<style>
@import "./index.css";
</style>

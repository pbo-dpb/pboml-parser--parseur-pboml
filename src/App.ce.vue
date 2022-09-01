<template>
  <Suspense>
    <div>
      <template v-if="!pbomlDocument">
        <FilePicker @pick="handlePick"></FilePicker>
      </template>
      <template v-else>
        <Editor v-if="edit" :pboml-document="pbomlDocument"></Editor>
        <Renderer v-else :pboml-document="pbomlDocument"></Renderer>
      </template>
    </div>
    <template #fallback>
      <LoadingIndicator class="w-8 h-8" />
    </template>
  </Suspense>
</template>

<script>
import yaml from 'js-yaml'

import { ref, defineAsyncComponent, computed } from 'vue'
import LoadingIndicator from './components/LoadingIndicator.vue'
import Renderer from './components/Renderer/Renderer.js'
import PBOMLDocument from './models/PBOMLDocument';
export default {
  data() {
    return {
      pbomlDocument: null
    }
  },
  props: {
    payload: {
      type: String,
      required: false
    },
    edit: {
      required: false
    }
  },
  components: {
    Editor: defineAsyncComponent(() => import('./components/Editor/Editor.vue')),
    FilePicker: defineAsyncComponent(() => import('./components/FilePicker/FilePicker.vue')),
    LoadingIndicator,
    Renderer,
  },
  created() {
    if (this.payload) {
      let payload = yaml.loadAll(this.payload);
      this.pbomlDocument = new PBOMLDocument(payload)
    } else {
      this.pbomlDocument = null
    }
  },
  methods: {
    handlePick(pickedDocument) {
      this.pbomlDocument = pickedDocument
    }
  }
}
</script>
<style>
@import "./index.css";

th {
  @apply font-semibold;
}
</style>

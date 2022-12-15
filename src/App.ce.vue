<template>
  <div :class="{ 'sd': shouldApplyDefaultStyle }">
    <Suspense>
      <div>
        <template v-if="loaded && !pbomlDocument">
          <FilePicker @pick="handlePick"></FilePicker>
        </template>
        <template v-else>
          <Editor v-if="edit" :pboml-document="pbomlDocument" :standalone="standalone"></Editor>
          <Renderer v-if="!edit && pbomlDocument" :pboml-document="pbomlDocument" :standalone="standalone"></Renderer>
        </template>
      </div>
      <template #fallback>
        <LoadingIndicator class="w-8 h-8" />
      </template>
    </Suspense>
  </div>
</template>

<script>
import yaml from 'js-yaml'
import { Buffer } from 'buffer';

import { ref, defineAsyncComponent, computed } from 'vue'
import LoadingIndicator from './components/LoadingIndicator.vue'
import Renderer from './components/Renderer/Renderer.js'
import PBOMLDocument from './models/PBOMLDocument';
export default {
  data() {
    return {
      _payload: null,
      pbomlDocument: null,
      loaded: false
    }
  },
  props: {
    payload: {
      type: String,
      required: false
    },
    edit: {
      required: false
    },
    standalone: {
      required: false
    }
  },
  components: {
    Editor: defineAsyncComponent(() => import('./components/Editor/Editor.vue')),
    FilePicker: defineAsyncComponent(() => import('./components/FilePicker/FilePicker.vue')),
    LoadingIndicator,
    Renderer,
  },
  computed: {
    shouldApplyDefaultStyle() {
      /**
       * We can't wrap `@tailwind` directives in a `@media screen` directive but we need to
       * disable the styles to print correctly (otherwise Puppeteer driven Chromium and
       * Firefox  won't print text without rare and unpredictable weird artifacts and 
       * overlapping lines). This is a workaround: pass &media=print as a URL
       * parameter to disable Tailwind when printing PDFs.
       */
      const params = new URLSearchParams(window.location.search);
      return params.get('media') !== 'print';
    }
  },
  async created() {

    if (this.payload) {

      // Accept a base64 encoded payload as long as it's presented as a data-url
      if (typeof this.payload === "string" && this.payload.startsWith('data:text/yaml;base64,')) {
        this._payload = Buffer.from(this.payload.split(',')[1], 'base64').toString('utf8');
      } else {
        this._payload = this.payload;
      }

    } else if (!this.payload && !this.standalone) {
      await this.attemptToLoadPayloadFromUrlParameter();
    }

    if (this._payload) {
      let payload = yaml.loadAll(this._payload);
      this.pbomlDocument = new PBOMLDocument(payload)
    } else {
      this.pbomlDocument = null
    }
    this.loaded = true;
  },
  methods: {
    handlePick(pickedDocument) {
      this.pbomlDocument = pickedDocument
    },
    async attemptToLoadPayloadFromUrlParameter() {
      const queryString = window.location.search;
      if (!queryString) return;
      const params = new URLSearchParams(queryString);
      if (params.get('payload')) {
        this._payload = params.get('payload');
        return;
      }


      if (params.get('payload-url')) {
        const response = await fetch(params.get('payload-url'));
        if (!response || !response.ok) return;
        this._payload = await response.text();
      }

    }
  }
}
</script>
<style>
@import "./index.css";
@import "./print.css" print;

th {
  @apply font-semibold;
}
</style>

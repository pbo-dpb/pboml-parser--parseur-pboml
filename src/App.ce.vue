<template>
  <Suspense>
    <div class="dark:text-white">
      <template v-if="loaded && !pbomlDocument">
        <FilePicker v-if="edit" @pick="handlePick" :prefix="prefix"></FilePicker>
      </template>
      <template v-else>
        <Editor v-if="edit" :pboml-document="pbomlDocument" :standalone="standalone" :prefix="prefix"></Editor>
        <Renderer v-if="!edit && pbomlDocument" :pboml-document="pbomlDocument" :standalone="standalone"
          :language="language"></Renderer>
      </template>
    </div>
    <template #fallback>
      <LoadingIndicator class="w-8 h-8" />
    </template>
  </Suspense>
</template>

<script>
import yaml from 'js-yaml'
import { Buffer } from 'buffer';
import debounce from 'lodash.debounce';

import { ref, defineAsyncComponent, computed } from 'vue'
import LoadingIndicator from './components/LoadingIndicator.vue'
import Renderer from './components/Renderer/Renderer.js'
import PBOMLDocument from './models/PBOMLDocument';
export default {
  data() {
    return {
      _payload: null,
      pbomlDocument: null,
      loaded: false,
      firstInitializationCompleted: false
    }
  },
  props: {
    payload: {
      type: String,
      required: false
    },
    /**
     * When true, will render the document in editing mode.
     */
    edit: {
      required: false
    },
    /**
     * When marked as standalone, the component will not display
     * headers and footers (title, copyright, etc.) and
     * remove exportation features from the editor.
     */
    standalone: {
      required: false
    },
    /**
     * A string used to prefix rendered element ids and anchors. Used when
     * multiple pboml documents are displayed on the same page.
     */
    prefix: {
      type: String,
      default: null
    },

    /**
     * A language to use. Defaults to the main page's language.
     */
    language: {
      type: String,
      default: document.documentElement.lang
    }
  },
  components: {
    Editor: defineAsyncComponent(() => import('./components/Editor/Editor.vue')),
    FilePicker: defineAsyncComponent(() => import('./components/FilePicker/FilePicker.vue')),
    LoadingIndicator,
    Renderer,
  },



  async created() {

    this.loadDocumentFromPayload();
    this.loaded = true;
  },

  mounted() {
    const handleHashChangeFunc = this.handleHashChange
    addEventListener('hashchange', handleHashChangeFunc);
    addEventListener('pbomlnavigate', handleHashChangeFunc);
    if (!this.firstInitializationCompleted && location.hash) {
      this.handleHashChange(false);
    }
    // Avoid running scrolling on tab change; Chrome agressively re-runs
    this.firstInitializationCompleted = true;

    if (!this.edi) {
      this.subscribeToPayloadUpdates();
    }

  },

  beforeUnmount() {
    const handleHashChangeFunc = this.handleHashChange
    removeEventListener('hashchange', handleHashChangeFunc);
    removeEventListener('pbomlnavigate', handleHashChangeFunc);
  },

  methods: {
    /*
     *  Manually observe hash (/hello.html#myanchor) changes so we can scroll to the appropriate
     *  content on hash change, as this will not work natively with the shadow dom.
     */
    handleHashChange(e) {

      let selector;
      if (e == false || e?.type == 'hashchange') {
        // Ignore shebang and common Vue Router navigations.
        if (!location.hash || !/^\#[a-zA-Z0-9]{1}.*/.test(location.hash)) return;
        selector = location.hash.replace(/[^a-zA-Z0-9\-_]+/g, "");
      } else if (e?.type === 'pbomlnavigate') {
        selector = e.detail;
      }

      const timeout = this.edit || !this.firstInitializationCompleted ? 850 : 10
      this.$nextTick(() => {
        setTimeout(() => {

          let childel = selector ? this.$el.querySelector(`#${selector}`) : this.$el;

          if (childel) {
            childel.scrollIntoView({
              behavior: 'smooth',
            });
          }
        }, timeout);

      })
    },

    loadDocumentFromPayload() {
      if (this.payload) {

        // Accept a base64 encoded payload as long as it's presented as a data-url
        if (typeof this.payload === "string" && this.payload.startsWith('data:text/yaml;base64,')) {
          this._payload = Buffer.from(this.payload.split(',')[1], 'base64').toString('utf8');
        } else {
          this._payload = this.payload;
        }

      }

      if (this._payload) {
        let payload = yaml.loadAll(this._payload);
        this.pbomlDocument = new PBOMLDocument(payload, this.prefix)
      } else {
        this.pbomlDocument = null
      }
    },


    handlePick(pickedDocument) {
      this.pbomlDocument = pickedDocument
    },


    subscribeToPayloadUpdates() {
      const targetNode = this.$el.getRootNode().host;

      // Options for the observer (which mutations to observe)
      const config = { attributes: true, childList: false, subtree: false };

      // Callback function to execute when mutations are observed
      const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
          if (mutation.type === "attributes" && mutation.attributeName === "payload") {
            this.loadDocumentFromPayload();
            console.log("Debounce");
            break;
          }
        }
      };

      // Create an observer instance linked to the callback function
      const observer = new MutationObserver(debounce(callback, 500));

      // Start observing the target node for configured mutations
      observer.observe(targetNode, config);
    }

  },
}
</script>
<style>
@import "./index.css" screen;
@import "./print.css" print;

th {
  @apply font-semibold;
}
</style>

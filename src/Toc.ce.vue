<template>
    <Suspense>
        <div class="dark:text-white">
            <Toc v-if="pbomlDocument" :pboml-document="pbomlDocument" :language="language"></Toc>
        </div>
        <template #fallback>
            <LoadingIndicator class="w-8 h-8" />
        </template>
    </Suspense>
</template>

<script>
import yaml from 'js-yaml'
import { Buffer } from 'buffer';

import { defineAsyncComponent } from 'vue'
import LoadingIndicator from './components/LoadingIndicator.vue'
import PBOMLDocument from './models/PBOMLDocument';
export default {
    data() {
        return {
            _payload: null,
            pbomlDocument: null,
        }
    },
    props: {
        payload: {
            type: String,
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
        Toc: defineAsyncComponent(() => import('./components/Toc/Toc.js')),
        LoadingIndicator,
    },

    async created() {

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

}
</script>
<style>
@import "./index.css";
@import "./print.css" print;
</style>
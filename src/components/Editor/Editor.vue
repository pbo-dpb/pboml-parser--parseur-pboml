<template>

    <main class="flex flex-col gap-4">

        <editor-actions v-if="!standalone" class="border-b border-gray-300 pb-4" :pboml-document="pbomlDocument"
            :disabled="shouldEditRaw">
            <Button @click="handleRawEditorToggle" :toggled="shouldEditRaw"><svg aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg><span class="sr-only">Code</span>
            </Button>
        </editor-actions>

        <editor-blocks v-if="!shouldEditRaw" :pboml-document="pbomlDocument"></editor-blocks>
        <yaml-editor v-if="shouldEditRaw" :pboml-document="pbomlDocument" @update="handlePbomlUpdate"></yaml-editor>

    </main>

</template>
<script>

import { defineAsyncComponent } from 'vue'
import PBOMLDocument from '../../models/PBOMLDocument';
import EditorActions from './EditorActions.vue';
import EditorBlocks from './EditorBlocks/EditorBlocks.js';
import Button from './Button.vue';

export default {
    props: {
        pbomlDocument: PBOMLDocument,
        standalone: Boolean
    },

    data() {
        return {
            shouldEditRaw: false,
            workingPboml: ''
        }
    },

    components: {
        EditorActions,
        EditorBlocks,
        Button,
        YamlEditor: defineAsyncComponent(() => import('./YamlEditor.vue')),
    },

    watch: {
        pbomlDocument: {
            handler(newVal, oldValue) {

                const event = new CustomEvent("pboml-editor-document-updated", {
                    bubbles: true,
                    cancelable: false,
                    composed: true,
                    detail: {
                        pbomlDocument: newVal.serialize()
                    }
                });
                document.dispatchEvent(event);
            },
            deep: true
        }
    },
    methods: {
        handlePbomlUpdate(newContent) {
            console.log('handle updated ml')
            this.workingPboml = newContent;
        },
        handleRawEditorToggle() {
            if (this.shouldEditRaw) {
                try {
                    this.$root.pbomlDocument = PBOMLDocument.initFromYaml(this.workingPboml);
                    this.shouldEditRaw = false;
                } catch (e) {
                }

            } else {
                this.shouldEditRaw = true;
            }
        }
    }
}
</script>
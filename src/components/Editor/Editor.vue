<template>
    <main class="flex flex-col gap-4">

        <editor-actions class="border-b border-gray-300 pb-4" :pboml-document="pbomlDocument" :disabled="shouldEditRaw"
            :standalone="standalone">
            <Button @click="handleRawEditorToggle" :toggled="shouldEditRaw"><svg aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg><span class="sr-only">Code</span>
            </Button>
        </editor-actions>

        <template v-if="!shouldEditRaw">


            <div class="tabs">
                <div role="tablist" class="flex flex-row gap-4 mb-4 border-b border-gray-300">
                    <Tab :controls="'slices'" :selected="currentTab === 'slices'" @click="currentTab = 'slices'">
                        {{ strings.slices_section_title }}
                    </Tab>
                    <Tab v-if="!standalone" :controls="'meta'" :selected="currentTab === 'meta'"
                        @click="currentTab = 'meta'">
                        {{ strings.meta_section_title }}
                    </Tab>

                </div>

                <div v-if="!standalone" id="slices" role="tabpanel" tabindex="0" aria-labelledby="tab-slices"
                    v-show="currentTab === 'slices'">
                    <editor-blocks :pboml-document="pbomlDocument"></editor-blocks>
                </div>

                <div v-if="!standalone" id="meta" role="tabpanel" tabindex="0" aria-labelledby="tab-meta"
                    v-show="currentTab === 'meta'">
                    <document-meta-editor :pboml-document="pbomlDocument"></document-meta-editor>
                </div>


            </div>






        </template>

        <yaml-editor v-if="shouldEditRaw" :pboml-document="pbomlDocument" @update="handlePbomlUpdate"></yaml-editor>

    </main>
</template>
<script>

import { defineAsyncComponent } from 'vue'
import PBOMLDocument from '../../models/PBOMLDocument';
import EditorActions from './EditorActions.vue';
import EditorBlocks from './EditorBlocks/EditorBlocks.js';
import Button from './Button.vue';
import SliceStager from "./SliceStager/SliceStager.vue";
import DocumentMetaEditor from "./DocumentMetaEditor/DocumentMetaEditor"
import strings from "../../editor-strings"
import Tab from "./Tabs/Tab.vue"

export default {
    props: {
        pbomlDocument: PBOMLDocument,
        standalone: Boolean
    },

    data() {
        return {
            shouldEditRaw: false,
            workingPboml: '',
            strings: strings[document.documentElement.lang],
            currentTab: "slices"
        }
    },

    components: {
        EditorActions,
        EditorBlocks,
        Button,
        YamlEditor: defineAsyncComponent(() => import('./YamlEditor.vue')),
        SliceStager,
        DocumentMetaEditor,
        Tab
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
        },
        handleNewSlice(slice) {
            this.pbomlDocument.addSlice(slice);
        }
    },

}
</script>
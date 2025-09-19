<template>
    <main class="flex flex-col gap-4">

        <editor-actions class="border-b border-gray-300 pb-4" :pboml-document="pbomlDocument" :disabled="shouldEditRaw">
            <Button @click="handleRawEditorToggle" :toggled="shouldEditRaw" :title="strings.editor_actions_source">
                <FileCode class="size-6"></FileCode>
                <span class="sr-only">{{ strings.editor_actions_source }}</span>
            </Button>
        </editor-actions>

        <template v-if="!shouldEditRaw">


            <div class="tabs">
                <div class="flex flex-row justify-between items-center">
                    <div role="tablist" class="flex flex-row gap-4 mb-4 border-b border-gray-300">
                        <Tab :controls="'slices'" :selected="currentTab === 'slices'" @click="currentTab = 'slices'">
                            {{ strings.main_content_section_title }}
                        </Tab>


                        <Tab :controls="'structure'" :selected="currentTab === 'structure'"
                            @click="currentTab = 'structure'">
                            {{ strings?.structure_section_title ?? "Structure" }}
                        </Tab>
                        <Tab :controls="'meta'" :selected="currentTab === 'meta'" @click="currentTab = 'meta'">
                            {{ strings.meta_section_title }}
                        </Tab>

                    </div>


                </div>



                <div>

                    <div>
                        <div id="slices" role="tabpanel" tabindex="0" aria-labelledby="tab-slices"
                            v-if="currentTab === 'slices'">
                            <editor-slices :pboml-document="pbomlDocument"></editor-slices>
                        </div>



                        <div id="structure" role="tabpanel" tabindex="0" aria-labelledby="tab-structure"
                            v-if="currentTab === 'structure'">
                            <structure-editor :pboml-document="pbomlDocument"></structure-editor>
                        </div>


                        <div v-if="currentTab === 'meta'" id="meta" role="tabpanel" tabindex="0"
                            aria-labelledby="tab-meta">
                            <document-meta-editor :pboml-document="pbomlDocument"></document-meta-editor>
                        </div>



                    </div>


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
import EditorSlices from './EditorSlices/EditorSlices.js';
import Button from './Button.vue';
import TinyButton from './TinyButton.vue';
import DocumentMetaEditor from "./DocumentMetaEditor/DocumentMetaEditor"
import strings from "../../editor-strings"
import Tab from "./Tabs/Tab.vue"
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/vue/24/solid';
import { ChevronRightIcon } from '@heroicons/vue/20/solid';
import { FileCode } from 'lucide-vue-next'

export default {
    props: {
        pbomlDocument: PBOMLDocument,
        prefix: String
    },

    data() {
        return {
            shouldEditRaw: false,
            workingPboml: '',
            strings: strings[document.documentElement.lang],
            currentTab: "slices",

        }
    },

    components: {
        EditorActions,
        EditorSlices,
        Button,
        TinyButton,
        FileCode,
        YamlEditor: defineAsyncComponent(() => import('./YamlEditor.vue')),
        DocumentMetaEditor,
        Tab,
        StructureEditor: defineAsyncComponent(() => import('./StructureEditor/StructureEditor.js')),

        ArrowsPointingInIcon,
        ArrowsPointingOutIcon,
        ChevronRightIcon
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
                    this.$root.pbomlDocument = PBOMLDocument.initFromYaml(this.workingPboml, this.prefix);
                    this.shouldEditRaw = false;
                } catch (e) {
                }

            } else {
                this.shouldEditRaw = true;
            }
        },




    }

}
</script>
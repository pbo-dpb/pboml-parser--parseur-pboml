<template>
    <main class="flex flex-col gap-4">

        <editor-actions class="border-b border-gray-300 pb-4" :pboml-document="pbomlDocument" :disabled="shouldEditRaw">
            <Button @click="handleRawEditorToggle" :toggled="shouldEditRaw" :title="strings.editor_actions_source">
                <CodeBracketIcon class="size-6"></CodeBracketIcon>
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
                    <div v-if="currentTab === 'slices'" class="flex flex-row items-center gap-2">

                        <div class="flex flex-row gap-0.5" aria-hidden="true">
                        </div>
                        <TinyButton
                            :title="enhancedPreviewWindow ? strings.close_enhanced_preview : strings.open_enhanced_preview"
                            :aria-pressed="(enhancedPreviewWindow ? true : false)" @click="toggleEnhancedPreview">
                            <RectangleGroupIcon class="w-4 h-4"></RectangleGroupIcon>
                            <span class="sr-only">{{ enhancedPreviewWindow ? strings.close_enhanced_preview :
                                strings.open_enhanced_preview }}</span>
                        </TinyButton>
                        <TinyButton title="Structure" :aria-pressed="shouldPresentDocumentStructure"
                            @click="shouldPresentDocumentStructure = !shouldPresentDocumentStructure">
                            <Bars3Icon class="w-4 h-4"></Bars3Icon>
                            <span class="sr-only">Structure</span>
                        </TinyButton>
                    </div>

                </div>



                <div>

                    <div>
                        <div id="slices" role="tabpanel" tabindex="0" aria-labelledby="tab-slices"
                            v-if="currentTab === 'slices'" class="grid gap-4"
                            :class="{ 'grid-cols-5': shouldPresentDocumentStructure }">

                            <div class="col-span-4">
                                <editor-slices :pboml-document="pbomlDocument"></editor-slices>
                            </div>
                            <nav class="" v-if="shouldPresentDocumentStructure">
                                <div class="flex flex-row justify-end sticky top-0 -mt-4 pt-4">
                                    <Toc :pboml-document="pbomlDocument"></Toc>
                                </div>
                            </nav>
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
import { Bars3Icon, ArrowsPointingInIcon, ArrowsPointingOutIcon, RectangleGroupIcon, CodeBracketIcon } from '@heroicons/vue/24/solid';
import { ChevronRightIcon } from '@heroicons/vue/20/solid';

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
            shouldPresentDocumentStructure: false,
            enhancedPreviewWindow: null
        }
    },

    components: {
        EditorActions,
        EditorSlices,
        Button,
        TinyButton,
        CodeBracketIcon,
        YamlEditor: defineAsyncComponent(() => import('./YamlEditor.vue')),
        DocumentMetaEditor,
        Tab,
        StructureEditor: defineAsyncComponent(() => import('./StructureEditor/StructureEditor.js')),
        Bars3Icon,
        Toc: defineAsyncComponent(() => import('../Toc/Toc.js')),
        ArrowsPointingInIcon,
        ArrowsPointingOutIcon,
        RectangleGroupIcon,
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
                this.injectEnhancedPreviewContent();
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


        injectEnhancedPreviewContent() {
            if (!this.enhancedPreviewWindow) {
                return;
            }
            const encodedPayload = btoa(unescape(encodeURIComponent(this.pbomlDocument.serialize())));
            const container = this.enhancedPreviewWindow.document.body.querySelector("div");

            let enPbomlPreview = this.enhancedPreviewWindow.document.getElementById("en-pboml-preview");

            if (!enPbomlPreview) {
                enPbomlPreview = document.createElement("pboml-parser");
                enPbomlPreview.setAttribute("language", "en");
                enPbomlPreview.style.backgroundColor = "white";
                enPbomlPreview.style.padding = "16px";
                enPbomlPreview.id = "en-pboml-preview";
                container.appendChild(enPbomlPreview);
            }

            enPbomlPreview.setAttribute("payload", `data:text/yaml;base64,${encodedPayload}`);

            let frPbomlPreview = this.enhancedPreviewWindow.document.getElementById("fr-pboml-preview");

            if (!frPbomlPreview) {
                frPbomlPreview = document.createElement("pboml-parser");
                frPbomlPreview.setAttribute("language", "fr");
                frPbomlPreview.style.backgroundColor = "white";
                frPbomlPreview.style.padding = "16px";
                frPbomlPreview.id = "fr-pboml-preview";
                container.appendChild(frPbomlPreview);
            }

            frPbomlPreview.setAttribute("payload", `data:text/yaml;base64,${encodedPayload}`);
        },

        toggleEnhancedPreview() {

            if (!this.enhancedPreviewWindow) {

                const enhancedPreviewTitle = this.strings.enhanced_preview_title;
                const desiredViewport = `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`;


                const newHmtl = document.createElement("html");
                const newHead = document.createElement("head");
                const newBody = document.createElement("body");
                newHmtl.appendChild(newHead);
                newHmtl.appendChild(newBody);

                // Container
                const container = document.createElement("div");
                container.style.display = "grid";
                container.style.gridTemplateColumns = 'auto auto';
                container.style.gap = "8px";
                container.style.backgroundColor = "#f1f5f9";
                newBody.appendChild(container);

                const enhancedPreviewWindow = window.open("", enhancedPreviewTitle, `${desiredViewport},toolbar=no,menubar=no,location=no`);

                if (!enhancedPreviewWindow) {
                    window.alert("The enhanced preview window was blocked by the popup blocker. Please allow popups for this site.");
                    return;
                }

                enhancedPreviewWindow.document.body.innerHTML = newHmtl.innerHTML;

                // Script tag
                const pbomlScriptTag = document.createElement("script");
                pbomlScriptTag.src = window.pbomlParserScriptUrl;
                pbomlScriptTag.type = "module";
                enhancedPreviewWindow.document.head.appendChild(pbomlScriptTag);

                this.enhancedPreviewWindow = enhancedPreviewWindow;

                this.enhancedPreviewWindow.onbeforeunload = () => {
                    this.enhancedPreviewWindow = null;
                };

                // Also listen on close on this window to avoid orphaned windows
                window.addEventListener("beforeunload", () => {
                    if (this.enhancedPreviewWindow) {
                        this.enhancedPreviewWindow.close();
                        this.enhancedPreviewWindow = null;
                    }
                });

                this.injectEnhancedPreviewContent();



            } else {
                this.enhancedPreviewWindow.close();
                this.enhancedPreviewWindow = null;

            }

        },

    }

}
</script>
<template>
    <div class="flex flex-col gap-2">
        <nav class="flex flex-row justify-end gap-2">

            <Button :title="enhancedPreviewWindow ? strings.close_enhanced_preview : strings.open_enhanced_preview"
                :aria-pressed="(enhancedPreviewWindow ? true : false)" @click="toggleEnhancedPreview">
                <Columns2 class="size-6"></Columns2>
                <span class="sr-only">{{ enhancedPreviewWindow ? strings.close_enhanced_preview :
                    strings.open_enhanced_preview }}</span>
            </Button>
            <Button :disabled="disabled" @click="shouldDisplayPreview = (shouldDisplayPreview ? false : 'en')"
                :toggled="shouldDisplayPreview ? true : false" :title="strings.editor_actions_preview">
                <Eye class="size-6"></Eye>
                <span class="sr-only">{{ strings.editor_actions_preview }}</span>
            </Button>

        </nav>

        <!-- <div class="flex flex-col gap-2 bg-blue-100 shadow-sm p-4" v-if="shouldDisplayExportActions">
            <nav class="flex flex-row gap-2 justify-end ">
                <Button @click="downloadPboml">
                    PBOML
                </Button>
            </nav>
        </div> -->

        <dialog ref="previewDialog"
            class="w-3/4 mx-auto h-3/4 mt-16 fborder-4 border-slate-100 border-dashed shadow-inner rounded-sm flex flex-col"
            v-if="shouldDisplayPreview"
            @click="$event.target === $event.currentTarget ? shouldDisplayPreview = false : null">
            <div class="flex flex-col gap-2 h-full w-full p-4">
                <nav class="flex flex-row gap-2 justify-end align-center">
                    <Tab @click="shouldDisplayPreview = 'en'" :selected="shouldDisplayPreview === 'en'">
                        EN
                    </Tab>
                    <Tab @click="shouldDisplayPreview = 'fr'" :selected="shouldDisplayPreview === 'fr'">
                        FR
                    </Tab>

                    <button @click="shouldDisplayPreview = false" class="ml-8 text-blue-500 hover:text-blue-800"
                        :title="strings.close_preview">
                        <X class="size-6" aria-hidden="true"></X>
                        <span class="sr-only">{{ strings.close }}</span>
                    </button>

                </nav>

                <Renderer :pboml-document="pbomlDocument" :language="shouldDisplayPreview"></Renderer>


            </div>
        </dialog>



    </div>
</template>
<script>
import PBOMLDocument from '../../models/PBOMLDocument';
import Button from './Button.vue';
import Renderer from '../Renderer/Renderer';
import strings from "../../editor-strings"
import Tab from '../Editor/Tabs/Tab.vue';
import { X, Eye, Columns2 } from 'lucide-vue-next'

export default {
    props: {
        pbomlDocument: PBOMLDocument,
        disabled: Boolean,
    },
    data() {
        return {
            shouldDisplayExportActions: false,
            shouldDisplayPreview: false,
            strings: strings[document.documentElement.lang],
            enhancedPreviewWindow: null
        }
    },
    components: {
        Button,
        Renderer,
        Eye,
        Tab,
        X,
        Columns2
    },

    methods: {
        downloadPboml() {
            const rawtext = this.pbomlDocument.serialize();
            const element = document.createElement('a');
            element.setAttribute('aria-hidden', true);
            element.setAttribute('href', 'data:text/pboml;charset=utf-8,' + encodeURIComponent(rawtext));
            element.setAttribute('download', `${this.pbomlDocument.id}.pboml.yaml`);

            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
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
    },

    watch: {
        shouldDisplayPreview(newVal, oldVal) {
            if (newVal && !oldVal) {
                this.$nextTick(() => this.$refs.previewDialog.showModal());
            } else if (!newVal) {
                this.$refs.previewDialog?.close();
            }
        },

        pbomlDocument: {
            handler(newVal, oldValue) {

                this.injectEnhancedPreviewContent();
            },
            deep: true
        }

    }
}
</script>
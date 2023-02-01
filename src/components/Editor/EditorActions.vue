<template>
    <div class="flex flex-col gap-2">
        <nav class="flex flex-row justify-end gap-2">

            <slot></slot>
            <Button :disabled="disabled" @click="shouldDisplayPreview = (shouldDisplayPreview ? false : 'en')">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="sr-only">Export // Exporter</span>
            </Button>

            <Button v-if="!standalone" :disabled="disabled"
                @click="shouldDisplayExportActions = !shouldDisplayExportActions" :toggled="shouldDisplayExportActions">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
                </svg>
                <span class="sr-only">Export // Exporter</span>
            </Button>
        </nav>

        <div class="flex flex-col gap-2 bg-blue-100 shadow p-4" v-if="shouldDisplayExportActions">
            <nav class="flex flex-row gap-2 justify-end ">
                <Button @click="shouldDisplayPreprintExporter = !shouldDisplayPreprintExporter"
                    v-if="shouldDisplayPreprintButton" :toggled="shouldDisplayPreprintExporter">
                    PDF
                </Button>
                <Button @click="downloadPboml">
                    PBOML
                </Button>
            </nav>

            <preprint-exporter v-if="shouldDisplayPreprintExporter" :pboml-document="pbomlDocument"></preprint-exporter>
        </div>

        <div class="flex flex-col gap-2 bg-blue-100 shadow p-4" v-if="shouldDisplayPreview">
            <nav class="flex flex-row gap-2 justify-end ">
                <Button @click="shouldDisplayPreview = 'en'" :toggled="shouldDisplayPreview === 'en'">
                    EN
                </Button>
                <Button @click="shouldDisplayPreview = 'fr'" :toggled="shouldDisplayPreview === 'fr'">
                    FR
                </Button>
            </nav>

            <Renderer :pboml-document="pbomlDocument" :language="shouldDisplayPreview"></Renderer>

        </div>








    </div>
</template>
<script>
import PreprintExporter from './PreprintExporter/PreprintExporter.vue';
import PBOMLDocument from '../../models/PBOMLDocument';
import PdfRenderer from "./PreprintExporter/PdfRenderer.js"
import Button from './Button.vue';
import Renderer from '../Renderer/Renderer';
export default {
    props: {
        pbomlDocument: PBOMLDocument,
        disabled: Boolean,
        standalone: Boolean
    },
    data() {
        return {
            shouldDisplayExportActions: false,
            shouldDisplayPreprintExporter: false,
            shouldDisplayPreview: false
        }
    },
    components: {
        PreprintExporter,
        Button,
        Renderer
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
        }
    },

    computed: {
        shouldDisplayPreprintButton() {

            return PdfRenderer.canRenderPdf;
        }
    }

}
</script>
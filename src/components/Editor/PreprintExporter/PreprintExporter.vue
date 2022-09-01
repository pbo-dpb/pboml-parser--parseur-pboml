<template>

    <loading-indicator class="w-8 h-8"></loading-indicator>

    <div hidden ref="renderedEn">
        <Renderer :pboml-document="pbomlDocument" language="en" :print="true"></Renderer>
    </div>

    <div hidden ref="renderedFr">
        <Renderer :pboml-document="pbomlDocument" language="fr" :print="true"></Renderer>
    </div>


</template>
<script>
import PBOMLDocument from '../../../models/PBOMLDocument';
import EditorDownloadPdfButtonVue from './EditorDownloadPdfButton.vue';
import PdfRenderer from "./PdfRenderer"
import Renderer from '../../Renderer/Renderer';
import LoadingIndicator from "../../LoadingIndicator.vue"

export default {
    emits: ['complete'],
    props: {
        pbomlDocument: PBOMLDocument
    },
    components: {
        editorDownloadPdfButton: EditorDownloadPdfButtonVue,
        Renderer,
        LoadingIndicator
    },
    mounted() {
        this.$nextTick(() => {
            this.downloadPdf();
        })
    },
    methods: {
        downloadPdf(root) {

            const renderer = new PdfRenderer(this.pbomlDocument, { en: this.$refs.renderedEn, fr: this.$refs.renderedFr });
            renderer.download(() => {
                setInterval(() => {
                    // Give user a marginally longer visual cue.
                    this.$emit("complete", true);
                }, 2000);

            });
        }
    }
}
</script>
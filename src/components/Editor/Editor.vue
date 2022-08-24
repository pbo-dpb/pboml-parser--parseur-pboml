<template>

<editor-download-pdf-button @click="downloadPdf"></editor-download-pdf-button>

<div ref="renderedEn">
    <Renderer :pboml-document="pbomlDocument" language="en" :print="true"></Renderer>
</div>

<div ref="renderedFr">
    <Renderer :pboml-document="pbomlDocument" language="fr" :print="true"></Renderer>
</div>

</template>
<script>
import PBOMLDocument from '../../models/PBOMLDocument';
import EditorDownloadPdfButtonVue from './EditorDownloadPdfButton.vue';
import PdfRenderer from "./PdfRenderer"
import Renderer from '../Renderer/Renderer';

export default {
    props: {
        pbomlDocument: PBOMLDocument
    },
    components: {
        editorDownloadPdfButton: EditorDownloadPdfButtonVue,
        Renderer
    },
    methods: {
        downloadPdf(root){
            const renderer = new PdfRenderer(this.pbomlDocument, {en: this.$refs.renderedEn, fr: this.$refs.renderedFr});
            renderer.download();
        }
    }
}
</script>
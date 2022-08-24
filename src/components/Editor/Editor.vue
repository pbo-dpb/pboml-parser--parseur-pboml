<template>

<editor-download-pdf-button @click="downloadPdf"></editor-download-pdf-button>

<div ref="hello">
    <Renderer :pboml-document="pbomlDocument"></Renderer>
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
            const renderer = new PdfRenderer(this.pbomlDocument, this.$refs.hello);
            renderer.download();
        }
    }
}
</script>
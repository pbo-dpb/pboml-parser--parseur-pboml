<template>

    <div class="border border-gray-300 rounded p-4 flex flex-col gap-4">

        <h3 class="text-xl font-semibold">PDF</h3>

        <section class="grid grid-cols-2 gap-4 justify-center items-center" v-if="requestedType === null">
            <Button @click="setRequestedType('preprint')">Preprint // Préimpression</Button>
            <Button @click="setRequestedType('final')">Final // Finale</Button>
        </section>

        <section v-if="requestedType !== null" class=" grid grid-cols-3 gap-4 justify-center items-center">
            <loading-indicator v-if="!renderer || !renderer.ready" class="w-8 h-8"></loading-indicator>

            <template v-else>
                <EditorDownloadPdfButton @click="download('en')">English ({{ renderer.requestedType }})
                </EditorDownloadPdfButton>
                <EditorDownloadPdfButton @click="download('fr')">Français ({{ renderer.requestedType }})
                </EditorDownloadPdfButton>
                <EditorDownloadPdfButton :primary="true" @click="download()">Bilingual ({{ renderer.requestedType }})
                </EditorDownloadPdfButton>
            </template>
        </section>
    </div>

</template>
<script>
import PBOMLDocument from '../../../models/PBOMLDocument';
import EditorDownloadPdfButton from './EditorDownloadPdfButton.vue';
import LoadingIndicator from "../../LoadingIndicator.vue"
import Button from '../Button.vue';
import PdfRenderer from "./PdfRenderer.js"

export default {
    emits: ['complete'],
    data() {
        return {
            requestedType: null,
            renderer: null
        }
    },
    props: {
        pbomlDocument: PBOMLDocument
    },
    components: {
        EditorDownloadPdfButton,
        LoadingIndicator,
        Button
    },

    methods: {
        setRequestedType(requestedType) {
            this.requestedType = requestedType;
            this.renderer = new PdfRenderer(this.pbomlDocument, requestedType);
            this.renderer.fetchVersions();
        },
        download(language) {
            this.renderer.download(language);
        }
    }
}
</script>
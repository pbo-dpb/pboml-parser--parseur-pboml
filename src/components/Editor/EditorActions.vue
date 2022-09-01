<template>
    <div class="flex flex-col gap-2">
        <nav class="flex flex-row justify-end">

            <button @click="shouldDisplayExportActions = !shouldDisplayExportActions"
                class="bg-blue-800 hover:bg-blue-700 p-2 rounded text-white"
                :class="{ 'bg-blue-600': shouldDisplayExportActions }">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
                </svg>
                <span class="sr-only">Export // Exporter</span>
            </button>
        </nav>

        <div class="flex flex-row gap-2 justify-end bg-blue-100 shadow p-2" v-if="shouldDisplayExportActions">
            <button @click="shouldDisplayPreprintExporter = true"
                class="bg-blue-800 hover:bg-blue-700 p-2 rounded text-white">
                Preprint // Préimpression
            </button>
            <button @click="downloadPboml" class="bg-blue-800 hover:bg-blue-700 p-2 rounded text-white">
                PBOML
            </button>
        </div>





        <preprint-exporter v-if="shouldDisplayPreprintExporter" :pboml-document="pbomlDocument"
            @complete="shouldDisplayPreprintExporter = false"></preprint-exporter>


    </div>
</template>
<script>
import PreprintExporter from './PreprintExporter/PreprintExporter.vue';
import PBOMLDocument from '../../models/PBOMLDocument';
export default {
    props: {
        pbomlDocument: PBOMLDocument
    },
    data() {
        return {
            shouldDisplayExportActions: false,
            shouldDisplayPreprintExporter: false,

        }
    },
    components: {
        PreprintExporter,
    },

    methods: {
        downloadPboml() {
            const rawtext = this.pbomlDocument.serialize();
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/pboml;charset=utf-8,' + encodeURIComponent(rawtext));
            element.setAttribute('download', `${this.pbomlDocument.id}.yaml`);

            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
    }

}
</script>
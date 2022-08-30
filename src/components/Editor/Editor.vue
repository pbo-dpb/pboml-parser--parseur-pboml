<template>

<main class="flex flex-col gap-4">

<div class="flex flex-row justify-end">
    <button @click="shouldDisplayPreprintExporter=!shouldDisplayPreprintExporter" class="bg-blue-800 hover:bg-blue-700 p-2 rounded text-white">
    PRE 📄
    </button>
</div>


<section>


<preprint-exporter v-if="shouldDisplayPreprintExporter" :pboml-document="pbomlDocument"></preprint-exporter>


</section>
</main>

</template>
<script>
import PBOMLDocument from '../../models/PBOMLDocument';
import PreprintExporter from './PreprintExporter/PreprintExporter.vue';


export default {
    props: {
        pbomlDocument: PBOMLDocument
    },
    data() {
        return {
            shouldDisplayPreprintExporter: false,
        }
    },
    components: {
        PreprintExporter,
    },
    
}
</script>
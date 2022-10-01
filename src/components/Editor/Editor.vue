<template>

    <main class="flex flex-col gap-4">

        <editor-actions :pboml-document="pbomlDocument"></editor-actions>

        <hr>

        <editor-blocks :pboml-document="pbomlDocument"></editor-blocks>

    </main>

</template>
<script>
import PBOMLDocument from '../../models/PBOMLDocument';
import EditorActions from './EditorActions.vue';
import EditorBlocks from './EditorBlocks/EditorBlocks.js';

export default {
    props: {
        pbomlDocument: PBOMLDocument,
    },

    components: {
        EditorActions,
        EditorBlocks
    },

}
</script>
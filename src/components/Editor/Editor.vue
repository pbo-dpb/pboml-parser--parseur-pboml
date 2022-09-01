<template>

    <main class="flex flex-col gap-4">

        <editor-actions :pboml-document="pbomlDocument"></editor-actions>

    </main>

</template>
<script>
import PBOMLDocument from '../../models/PBOMLDocument';
import EditorActions from './EditorActions.vue';

export default {
    props: {
        pbomlDocument: PBOMLDocument
    },

    components: {
        EditorActions,
    },

}
</script>
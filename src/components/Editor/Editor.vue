<template>

    <main class="flex flex-col gap-4">

        <editor-actions v-if="!standalone" class="border-b border-gray-300 pb-4" :pboml-document="pbomlDocument">
        </editor-actions>

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
        standalone: Boolean
    },

    components: {
        EditorActions,
        EditorBlocks
    },

    watch: {
        pbomlDocument: {
            handler(newVal, oldValue) {

                const event = new CustomEvent("pboml-editor-document-updated", {
                    bubbles: true,
                    cancelable: false,
                    composed: true,
                    detail: {
                        pbomlDocument: newVal.serialize()
                    }
                });
                document.dispatchEvent(event);
            },
            deep: true
        }
    }
}
</script>
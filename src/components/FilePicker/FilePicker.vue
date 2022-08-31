<template>

    <div>
        <file-picker-input v-if="shouldDisplayInput" @pick="handlePickedDocument"></file-picker-input>
    </div>
</template>
<script>
import PBOMLDocument from '../../models/PBOMLDocument';
import FilePickerInput from './FilePickerInput.vue';

export default {
    components: { FilePickerInput },
    emits: ['pick'],
    data() {
        return {
            shouldDisplayInput: true
        };
    },
    methods: {

        handlePickedDocument(pbomlDocument) {
            this.$emit('pick', pbomlDocument);
        }
    }

}
</script>
<template>
    <div>
        <file-picker-input v-if="shouldDisplayInput" @pick="handlePickedDocument" :prefix="prefix"></file-picker-input>
    </div>
</template>
<script>
import PBOMLDocument from '../../models/PBOMLDocument';
import FilePickerInput from './FilePickerInput.vue';

export default {
    props: ['prefix'],
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
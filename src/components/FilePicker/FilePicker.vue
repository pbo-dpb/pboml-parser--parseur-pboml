<template>
    <div class="flex flex-col gap-4 justify-between">
        <div class="border border-gray-300 p-2 flex flex-row items-center w-fit">
            <div class="text-2xl w-12 text-center">📁</div>
            <file-picker-input v-if="shouldDisplayInput" @pick="handlePickedDocument"
                :prefix="prefix"></file-picker-input>
        </div>
        <div class="border border-gray-300 p-2 flex flex-row items-center w-fit">
            <div class="text-2xl w-12 text-center">📄</div>
            <button class="rounded-sm bg-blue-100 p-2 text-sm font-semibold text-blue-800"
                @click="handleNewFromScratch">New</button>
        </div>
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
        },

        handleNewFromScratch() {
            this.$emit('pick', new PBOMLDocument([{
                pboml: { version: "1.0.0" }
            }]));
        }
    }

}
</script>
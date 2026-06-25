<template>
    <div class="flex flex-col justify-between gap-4">
        <div
            class="flex w-fit flex-row items-center border border-gray-300 p-2">
            <div class="w-12 text-center text-2xl">📁</div>
            <file-picker-input
                v-if="shouldDisplayInput"
                @pick="handlePickedDocument"
                :prefix="prefix"></file-picker-input>
        </div>
        <div
            class="flex w-fit flex-row items-center border border-gray-300 p-2">
            <div class="w-12 text-center text-2xl">📄</div>
            <button
                class="rounded-sm bg-blue-100 p-2 text-sm font-semibold text-blue-800"
                @click="handleNewFromScratch">
                New
            </button>
        </div>
    </div>
</template>
<script>
    import PBOMLDocument from "../../models/PBOMLDocument";
    import FilePickerInput from "./FilePickerInput.vue";

    export default {
        props: ["prefix"],
        components: { FilePickerInput },
        emits: ["pick"],
        data() {
            return {
                shouldDisplayInput: true,
            };
        },
        methods: {
            handlePickedDocument(pbomlDocument) {
                this.$emit("pick", pbomlDocument);
            },

            handleNewFromScratch() {
                this.$emit(
                    "pick",
                    new PBOMLDocument([
                        {
                            pboml: { version: "1.0.0" },
                        },
                    ]),
                );
            },
        },
    };
</script>

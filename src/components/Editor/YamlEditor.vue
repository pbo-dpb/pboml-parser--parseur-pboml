<template>
    <section>
        <pre
            v-if="error"
            class="h-32 w-full overflow-y-scroll border border-red-300 text-red-800">
        {{ error.message }}
    </pre
        >
        <div
            class="flex h-32 w-full flex-col items-center justify-center gap-2 border border-gray-300 font-mono font-semibold text-green-600"
            v-else>
            <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-6 w-6">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            OK
        </div>
        <textarea
            v-model="workingPboml"
            class="h-screen w-full border border-gray-300 p-4 font-mono"></textarea>
    </section>
</template>
<script>
    import PBOMLDocument from "../../models/PBOMLDocument";
    import yaml from "js-yaml";

    export default {
        props: {
            pbomlDocument: PBOMLDocument,
        },
        data() {
            return {
                workingPboml: "",
                error: null,
            };
        },
        mounted() {
            this.workingPboml = this.pbomlDocument.serialize();
            this.updateWorkingPboml();
        },
        watch: {
            workingPboml(newPboml) {
                this.updateWorkingPboml();
            },
        },
        methods: {
            updateWorkingPboml() {
                this.error = null;
                try {
                    yaml.loadAll(this.workingPboml);
                } catch (e) {
                    this.error = e;
                }

                this.$emit("update", this.workingPboml);
            },
        },
    };
</script>

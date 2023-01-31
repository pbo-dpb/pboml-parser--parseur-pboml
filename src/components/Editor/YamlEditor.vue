<template>
    <section>
        <pre v-if="error" class="h-32 overflow-y-scroll border border-red-300 text-red-800 w-full">
        {{ error.message }}
    </pre>
        <div class="h-32 border border-gray-300 flex items-center flex-col gap-2 justify-center text-green-600 font-mono font-semibold w-full"
            v-else>
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            OK

        </div>
        <textarea v-model="workingPboml" class="h-screen font-mono border border-gray-300 p-4 w-full"></textarea>
    </section>
</template>
<script>
import PBOMLDocument from '../../models/PBOMLDocument';
import yaml from 'js-yaml'


export default {
    props: {
        pbomlDocument: PBOMLDocument
    },
    data() {
        return {
            workingPboml: '',
            error: null
        }
    },
    mounted() {
        this.workingPboml = this.pbomlDocument.serialize();
        this.updateWorkingPboml();
    },
    watch: {
        workingPboml(newPboml) {
            this.updateWorkingPboml();
        }
    },
    methods: {
        updateWorkingPboml() {
            this.error = null;
            try {
                yaml.loadAll(this.workingPboml);
            } catch (e) {
                this.error = e
            }


            this.$emit('update', this.workingPboml);
        }
    }
}
</script>

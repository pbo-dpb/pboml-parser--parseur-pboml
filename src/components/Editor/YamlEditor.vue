<template>

    <textarea v-model="workingPboml" class="h-screen font-mono border border-gray-300 p-4"></textarea>

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
            workingPboml: ''
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
            this.$emit('update', this.workingPboml);
        }
    }
}
</script>

<template>
  {{ pbomlVersion }}
</template>


<script>
export default {
    props: {
        pbomlDocument:{
            type: Array,
            required: true
        }
    },
    computed: {
        pbomlVersion() {
            return this.pbomlDocument.find(element => element.pboml?.version)?.pboml.version
        }
    }
};
</script>

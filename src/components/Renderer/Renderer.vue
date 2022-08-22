<template>
  <component :is="rendererName"></component>
</template>


<script>
//var semver = require('semver');
import Renderer1 from "./1.0/Renderer1.vue";

export default {
    props: {
        pbomlDocument:{
            type: Array,
            required: true
        }
    },
    computed: {
        pbomlVersion() {
            const v = this.pbomlDocument.find(element => element.pboml?.version)?.pboml.version;
            return v;
        },
        rendererName() {
            if (!this.pbomlVersion)
                return null;

            if (`${this.pbomlVersion}` === "1.0" || `${this.pbomlVersion}`.startsWith('1.0.'))
                return "Renderer1";
           return null;
        }
    },
    components: {
        Renderer1
    }
};
</script>

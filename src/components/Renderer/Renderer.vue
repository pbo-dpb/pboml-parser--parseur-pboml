<template>
  <component :is="rendererName" :pboml-document="pbomlDocument"></component>
</template>


<script>
import PBOMLDocument from "../../models/PBOMLDocument";
import Renderer1 from "./1.0/Renderer1.vue";

export default {
    props: {
        pbomlDocument:{
            type: PBOMLDocument,
            required: true
        }
    },
    computed: {
        
        rendererName() {
            if (!this.pbomlDocument.version)
                return null;

            if (`${this.pbomlDocument.version}` === "1.0" || `${this.pbomlDocument.version}`.startsWith('1.0.'))
                return "Renderer1";
           return null;
        }
    },
    components: {
        Renderer1
    }
};
</script>

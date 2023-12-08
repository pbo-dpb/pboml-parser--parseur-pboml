import editorStrings from "../../../editor-strings"
import TinyButton from "../TinyButton.vue"
import { h, defineAsyncComponent } from 'vue'
const StructureImporter = defineAsyncComponent(() => import('./StructureImporter/StructureImporter.vue'))

export default {
    props: ["pbomlDocument"],
    components: {
        StructureImporter
    },

    data() {
        return {
            displayImporter: false
        }
    },

    mounted() {


    },

    methods: {

    },

    render() {
        let strings = editorStrings[document.documentElement.lang]
        return h("div", {},
            [

                this.displayImporter ?
                    h(StructureImporter, { pbomlDocument: this.pbomlDocument, onClose: () => this.displayImporter = false }) : h(TinyButton, { onClick: () => this.displayImporter = true }, () => strings["append_structure_from_markdown"])
            ]
        );

    }

}
import editorStrings from "../../../editor-strings"
import TinyButton from "../TinyButton.vue"
import StructureTree from "./StructureTree/StructureTree.js"
import { h, defineAsyncComponent } from 'vue'
import { ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
const StructureImporter = defineAsyncComponent(() => import('./StructureImporter/StructureImporter.vue'))

export default {
    props: ["pbomlDocument"],
    components: {
        StructureImporter,
        ClipboardDocumentListIcon,
        StructureTree
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
                h(StructureTree, { pbomlDocument: this.pbomlDocument }),
                this.displayImporter ?
                    h(StructureImporter, { pbomlDocument: this.pbomlDocument, onClose: () => this.displayImporter = false }) : h(TinyButton, { onClick: () => this.displayImporter = true }, () => [h(ClipboardDocumentListIcon, { 'class': "h-4 w-4" }), strings["append_structure_from_markdown"]])
            ]
        );

    }

}
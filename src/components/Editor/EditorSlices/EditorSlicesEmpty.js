import { defineAsyncComponent } from 'vue'
import PBOMLDocument from "../../../models/PBOMLDocument";
import { h } from 'vue'
import strings from "../../../editor-strings"
const StructureImporter = defineAsyncComponent(() => import('../StructureEditor/StructureImporter/StructureImporter.vue'))


export default {
    props: {
        pbomlDocument: PBOMLDocument,
    },
    data() {
        return {
            strings: strings[document.documentElement.lang],
            displayImporter: false
        }
    },
    render() {

        return h('div', { class: "bg-teal-50 rounded-lg p-4" }, [
            !this.displayImporter ? h('div', { class: "text-lg font-thin mb-2" }, this.strings.empty_slice_title) : null,
            !this.displayImporter ? h('div', { class: "text-sm text-gray-500" }, this.strings.empty_slice_prompt) : null,
            !this.displayImporter ? h('button', {
                class: "mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700",
                onClick: () => {
                    this.displayImporter = true
                }
            }, this.strings.append_structure_by_import) : null,
            this.displayImporter ?
                h(StructureImporter, { class: "bg-white", pbomlDocument: this.pbomlDocument, onClose: () => this.displayImporter = false }) : null
        ])
    }
}
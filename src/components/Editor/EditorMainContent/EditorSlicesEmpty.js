import { defineAsyncComponent } from 'vue'
import PBOMLDocument from "../../../models/PBOMLDocument";
import { h } from 'vue'
import strings from "../../../editor-strings"
import Button from "../Button.vue"
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

        return h('div', { class: "bg-cyan-50 rounded-lg p-4 flex flex-col gap-2" }, [
            !this.displayImporter ? h('div', { class: "text-lg font-medium text-cyan-800" }, this.strings.empty_slice_title) : null,
            !this.displayImporter ? h('div', { class: "text-sm text-gray-500" }, this.strings.empty_slice_prompt) : null,
            !this.displayImporter ? h(Button, {
                class: "w-fit",
                onClick: () => {
                    this.displayImporter = true
                }
            }, () => this.strings.append_structure_by_import) : null,
            this.displayImporter ?
                h(StructureImporter, { class: "bg-white", pbomlDocument: this.pbomlDocument, onClose: () => this.displayImporter = false }) : null
        ])
    }
}
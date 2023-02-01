import { h } from 'vue'
import BilingualInput from "../Inputs/BilingualInput.vue"
import SingleInput from "../Inputs/SingleInput.vue"
import strings from "../../../editor-strings"

export default {
    props: ['pbomlDocument'],
    render() {
        return h('fieldset', { class: 'flex flex-col gap-4' }, [
            h(BilingualInput, {
                modelValue: this.pbomlDocument.title,
                label: strings[document.documentElement.lang].document_title_label,
                'onUpdate:modelValue': (value) => this.pbomlDocument.title = value
            }),
            h(SingleInput, {
                modelValue: this.pbomlDocument.id,
                label: strings[document.documentElement.lang].document_id_label,
                'onUpdate:modelValue': (value) => this.pbomlDocument.id = value
            }),
            h(BilingualInput, {
                modelValue: this.pbomlDocument.copyright,
                label: strings[document.documentElement.lang].document_copyright_label,
                'onUpdate:modelValue': (value) => this.pbomlDocument.copyright = value
            }),
        ]);
    }
}
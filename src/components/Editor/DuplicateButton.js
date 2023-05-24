import { h } from 'vue'
import TinyButton from "./TinyButton.vue"
import strings from '../../editor-strings'
import { DocumentDuplicateIcon } from '@heroicons/vue/24/solid'
export default {
    emits: ['duplicate'],

    render() {
        let actionNode = h(TinyButton, {
            'aria-label': strings[document.documentElement.lang].duplicate_slice_button_label,
            'title': strings[document.documentElement.lang].duplicate_slice_button_label,
            onClick: (e) => {
                if (window.confirm(`${strings[document.documentElement.lang].duplicate_slice_button_label}?`)) {
                    this.$emit("duplicate")
                }
            },
        }, () => [
            h(DocumentDuplicateIcon, { 'class': 'w-4 h-4' }, () => [])
        ])
        return actionNode;

    }

}
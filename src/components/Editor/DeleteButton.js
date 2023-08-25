import { h } from 'vue'
import TinyButton from "./TinyButton.vue"
import strings from '../../editor-strings'
import { TrashIcon } from '@heroicons/vue/24/solid'
export default {
    emits: ['delete'],

    render() {
        let actionNode = h(TinyButton, {
            'aria-label': strings[document.documentElement.lang].delete_button_label,
            'title': strings[document.documentElement.lang].delete_button_label,
            danger: true,
            onClick: (e) => {
                if (window.confirm(`${strings[document.documentElement.lang].delete_button_label}?`)) {
                    this.$emit("delete")
                }
            },
        }, () => [
            h(TrashIcon, { 'class': 'w-4 h-4' }, () => [])
        ])
        return actionNode;

    }

}
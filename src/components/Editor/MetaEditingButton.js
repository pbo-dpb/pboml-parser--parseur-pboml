import { h } from 'vue'
import TinyButton from "./TinyButton.vue"
import strings from '../../editor-strings'
import { Cog6ToothIcon } from '@heroicons/vue/24/solid'
export default {
    props: ["isEditing"],
    emits: ['editing'],

    render() {

        let actionNode = h(TinyButton, {
            'aria-label': strings[document.documentElement.lang].meta_editing_slice_button_label,
            'aria-pressed': this.isEditing,
            'class': this.isEditing ? 'bg-amber-300 hover:bg-amber-500 shadow-inner' : 'bg-amber-100 hover:bg-amber-300',
            onClick: (e) => {
                this.$emit("editing", !this.isEditing)
            },
        }, () => [
            h(Cog6ToothIcon, { 'class': 'w-4 h-4' }, () => [])
        ])
        return actionNode;

    }

}
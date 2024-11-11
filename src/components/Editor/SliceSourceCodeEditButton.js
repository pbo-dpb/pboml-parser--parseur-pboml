import { h } from 'vue'
import { CodeBracketIcon } from '@heroicons/vue/16/solid'
import TinyButton from "./TinyButton.vue"
import strings from '../../editor-strings'
export default {
    props: ["isEditingSource"],
    emits: ['editing'],

    render() {

        return h('div', { 'class': 'flex flex-row gap-1 items-center' }, [

            h(TinyButton, {
                'aria-label': strings[document.documentElement.lang].previewing_slice_button_label,
                'aria-pressed': this.isEditingSource,
                'class': this.isEditingSource ? 'bg-amber-300 hover:bg-amber-500 shadow-inner' : 'bg-amber-100 hover:bg-amber-300',
                'title': this.isEditingSource ? strings[document.documentElement.lang].stop_editing_source_code : strings[document.documentElement.lang].edit_source_code,
                onClick: (e) => {
                    this.$emit("editing", !this.isEditingSource)
                },
            }, () => [
                h(CodeBracketIcon, { 'class': 'h-4 w-4' }, () => []),
                h('span', { class: 'sr-only' }, this.isEditingSource ? strings[document.documentElement.lang].stop_editing_source_code : strings[document.documentElement.lang].edit_source_code)
            ]),

        ])


    }

}
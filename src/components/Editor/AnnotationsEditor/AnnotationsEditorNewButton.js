import { h } from 'vue'
import Button from "../Button.vue"
import editorStrings from "../../../editor-strings"
import { PlusCircleIcon } from '@heroicons/vue/24/solid'

export default {
    props: {
        soft: Boolean
    },
    render() {
        let strings = editorStrings[document.documentElement.lang]
        return h("button", { 'class': `w-fit mx-auto ${this.soft ? 'text-blue-300 hover:text-blue-800' : 'text-blue-800'}`, title: strings.create_annotation }, [h(PlusCircleIcon, { class: 'w-6 h-6' }), h('span', { 'class': 'sr-only' }, strings.create_annotation)]);
    }
}
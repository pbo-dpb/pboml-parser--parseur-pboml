import { h } from 'vue'
import Slice from '../../../../models/contents/Slice';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import editorStrings from "../../../../editor-strings"

export default {
    props: {
        slice: Slice,
    },
    render() {
        let sliceEditingVnode = this.slice.renderEditingVnode();


        return h('dialog', {
            class: "container w-full shadow",
            onClose: () => { this.$emit('close') }
        }, [
            h('div', { class: "flex justify-end px-8 py-4 border-b border-gray-300 text-blue-700 hover:text-blue-800 bg-gray-50 sticky top-0 z-10" }, [
                h('button', { onClick: () => { this.$emit('close') } }, [
                    h(XMarkIcon, { class: "size-8", 'aria-hidden': "true" }),
                    h('span', { class: "sr-only" }, editorStrings[document.documentElement.lang].close)
                ]),
            ]),
            h('div', { class: "w-full p-8" }, [
                sliceEditingVnode,
            ])
        ]);
    },
    mounted() {
        this.$el.showModal();
    }
}
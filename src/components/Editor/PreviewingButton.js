import { h } from 'vue'
import { EyeIcon } from '@heroicons/vue/24/solid'
import TinyButton from "./TinyButton.vue"
import strings from '../../editor-strings'
export default {
    props: ["isPreviewing"],
    emits: ['previewing'],

    render() {

        let actionNode = h('div', { 'class': 'flex flex-row gap-1 items-center' }, [

            h(TinyButton, {
                'aria-label': strings[document.documentElement.lang].previewing_slice_button_label,
                'aria-pressed': this.isPreviewing === 'en',
                'class': this.isPreviewing ? 'bg-amber-300 hover:bg-amber-500 shadow-inner' : 'bg-amber-100 hover:bg-amber-300', onClick: (e) => {
                    this.$emit("previewing", (this.isPreviewing === 'en') ? false : 'en')
                },
            }, [h(EyeIcon, { 'class': 'h-4 w-4' }),
            h('span', {}, 'EN')
            ]),

            h(TinyButton, {
                'aria-label': strings[document.documentElement.lang].previewing_slice_button_label,
                'aria-pressed': this.isPreviewing === 'fr',
                'class': this.isPreviewing ? 'bg-amber-300 hover:bg-amber-500 shadow-inner' : 'bg-amber-100 hover:bg-amber-300', onClick: (e) => {
                    this.$emit("previewing", (this.isPreviewing === 'fr') ? false : 'fr')
                },
            }, [h(EyeIcon, { 'class': 'h-4 w-4' }),
            h('span', {}, 'FR')
            ])

        ])

        return [
            actionNode,
        ];

    }

}
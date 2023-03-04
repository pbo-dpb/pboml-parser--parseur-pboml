import editorStrings from "../editor-strings";
import { h, defineAsyncComponent } from 'vue'
import TinyButton from "../components/Editor/TinyButton.vue"
import BilingualInput from "../components/Editor/Inputs/BilingualInput.vue"

export default {
    props: ["slice", "meta_type"],
    data() {
        return {
            collapsed: true
        }
    },
    render() {


        return h("aside", {
            'class': 'flex flex-col gap-2'
        },

            [
                h('div', { class: 'flex flex-row gap-1 items-center cursor-pointer hover:text-blue-800 select-none', 'role': 'button', onClick: () => { this.collapsed = !this.collapsed } }, [
                    h('span', [
                        h('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", "stroke-width": "1.5", stroke: "currentColor", class: "w-4 h-4" },
                            [
                                h('path', { 'stroke-linecap': "round", "stroke-linejoin": "round", 'd': this.collapsed ? "M8.25 4.5l7.5 7.5-7.5 7.5" : "M19.5 8.25l-7.5 7.5-7.5-7.5" })
                            ]),
                    ]),
                    h('span', { class: 'font-semibold uppercase' }, editorStrings[document.documentElement.lang][`slice_meta_type_${this.meta_type}`]),
                    (this.slice[this.meta_type] && this.slice[this.meta_type].length) ? h('span', { class: 'rounded bg-gray-100 text-xs font-semibold px-1 text-gray-800' }, this.slice[this.meta_type].length) : null
                ]),

                this.collapsed ? null : h('div', { class: "flex flex-col gap-2" }, [
                    ...this.slice[this.meta_type].map((mt) => {
                        return h('div', { class: "flex flex-row gap-2  py-2  pl-2 " },
                            [


                                h(BilingualInput, {
                                    inputSize: (this.meta_type === 'alts' ? 'lg' : null),
                                    modelValue: mt,
                                    class: 'w-full',
                                    'onUpdate:modelValue': (value) => { mt.en = value.en; mt.fr = value.fr }
                                }),

                                h(TinyButton, {
                                    'class': 'justify-self-end', 'innerHTML': "🗑️", danger: true, onClick: (e) => {
                                        this.slice[this.meta_type] = this.slice[this.meta_type].filter(i => i !== mt);
                                    }
                                }),


                            ])
                    }),

                    h(TinyButton, {
                        'class': "self-center",
                        'innerHTML': "➕", onClick: (e) => {
                            this.slice[this.meta_type].push({ en: "", fr: "" });
                        }
                    })
                ]),


            ]

        );

    }
}
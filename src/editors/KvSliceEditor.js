import { h } from 'vue'
import BilingualInput from "../components/Editor/Inputs/BilingualInput.vue"
import TinyButton from "../components/Editor/TinyButton.vue"
import strings from "../editor-strings"
import MarkdownDriver from '../MarkdownDriver'
import Renderer from '../components/Renderer/Renderer'

export default {
    props: ['slice', 'isEditingMeta'],
    data() {
        return {
            editingLabels: false
        }
    },
    setup(props, { emit }) {

        if (props.slice.readonly) {

            const md = new MarkdownDriver;
            md.shouldRenderInline(true);
            return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
                h('div', { class: 'col-span-2 font-bold', innerHTML: md.render(strings[document.documentElement.lang].readonly_slice) }),
                Renderer.methods.renderSliceAsVnode(props.slice, 'en'),
                Renderer.methods.renderSliceAsVnode(props.slice, 'fr'),
            ])
        }



        return () => {

            let metas = [];

            if (props.isEditingMeta) {
                metas.push(


                    h('div', { class: 'grid grid-cols-2 gap-2' }, [

                        h(BilingualInput, {
                            class: "w-full",
                            modelValue: props.slice.prototype.key.label,
                            label: strings[document.documentElement.lang].kv_slice_key_label,
                            'onUpdate:modelValue': (value) => {
                                props.slice.prototype.key.label = value;
                            }
                        }),
                        h(BilingualInput, {
                            class: "w-full",
                            modelValue: props.slice.prototype.value.label,
                            label: strings[document.documentElement.lang].kv_slice_value_label,
                            'onUpdate:modelValue': (value) => {
                                props.slice.prototype.value.label = value;
                            }
                        }),
                    ]),
                )
            }



            let rows = [];

            props.slice.content.forEach((entry) => {
                let kvBlock = h('div', { 'class': 'flex flex-col gap-2  p-2 border-r-2 border-gray-300' }, [

                    h(TinyButton, {
                        'class': 'place-self-end', 'innerHTML': "🗑️", danger: true, onClick: (e) => {
                            props.slice.removeKvEntry(entry);
                        }
                    }),

                    h('div', { class: 'grid grid-cols-2 gap-2' }, [
                        h('div', { class: 'flex flex-col font-semibold' }, [
                            h('div', { class: '', innerText: `${props.slice.prototype.key.label?.en ?? 'Key'} • ${props.slice.prototype.key.label?.fr ?? 'Clé'}` }),
                            h(BilingualInput, {
                                class: "w-full",
                                modelValue: entry.key.content,
                                'onUpdate:modelValue': (value) => {
                                    entry.key.content = value;
                                }
                            }),
                        ]),
                        h('div', { class: 'flex flex-col' }, [
                            h('div', { class: '', innerText: `${props.slice.prototype.value.label?.en ?? 'Value'} • ${props.slice.prototype.value.label?.fr ?? 'Valeur'}` }),
                            h(BilingualInput, {
                                class: "w-full",
                                modelValue: entry.value.content,
                                'onUpdate:modelValue': (value) => {
                                    entry.value.content = value;
                                }
                            }),
                        ])
                    ]),







                ])

                rows.push(kvBlock);
            });


            rows.push(h(TinyButton, {
                'class': "self-center",
                'innerHTML': "➕", onClick: (e) => {
                    props.slice.appendKvEntry();
                }
            }));



            return h('div', { class: 'flex flex-col gap-4' }, [
                h('div', { class: 'border-l-4 border-amber-300 pl-4' }, metas),
                h('div', { class: 'p-4 bg-slate-100 rounded flex flex-col gap-8' }, rows)
            ])


        }



    }
}

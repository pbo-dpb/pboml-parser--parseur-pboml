import { h } from 'vue'
import BilingualInput from "../components/Editor/Inputs/BilingualInput.vue"
import TinyButton from "../components/Editor/TinyButton.vue"


export default {
    props: ['slice'],
    setup(props, { emit }) {

        if (props.slice.readonly) {
            return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
                props.slice.renderReadonlyVnode(false, "en"),
                props.slice.renderReadonlyVnode(false, "fr"),
            ])
        }



        return () => {

            let rows = [];
            props.slice.content.forEach((entry) => {
                let kvBlock = h('div', { 'class': 'flex flex-col gap-2  py-2  pl-4 pr-2 border-r-2 border-gray-300' }, [

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
                'innerHTML': "➕", onClick: (e) => {
                    props.slice.appendKvEntry();
                }
            }));

            return h('div', { class: 'flex flex-col gap-4 ml-4' }, rows)


        }



    }
}

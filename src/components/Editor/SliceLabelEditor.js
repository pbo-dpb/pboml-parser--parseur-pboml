import { h } from 'vue'
import TinyButton from "./TinyButton.vue"
import BilingualInput from "../../components/Editor/Inputs/BilingualInput.vue"
import strings from '../../editor-strings'
export default {
    props: ["label", "isEditing"],
    emits: ['update:modelValue'],

    render() {


        let contentNodes;

        if (this.isEditing) {
            contentNodes = [
                h('fieldset', { class: 'flex flex-col gap-2 w-full border-l-4 border-amber-300 pl-4' }, [
                    h(BilingualInput, {
                        modelValue: this.label,
                        label: strings[document.documentElement.lang].slice_title_field_label,
                        'onUpdate:modelValue': (value) => this.$emit('update:modelValue', value)
                    })
                ]),
            ]
        } else {
            if (this.label.en && this.label.fr) {
                contentNodes = [
                    h('span', { innerText: this.label.en }),
                    h('span', { innerText: this.label.fr }),
                ]
            } else {
                contentNodes = [
                    h('span', { innerText: strings[document.documentElement.lang].no_slice_title, class: 'italic' })
                ]
            }

        }

        return [
            h('div', { class: 'flex flex-row gap-2 ' }, [
                h(this.isEditing ? 'div' : 'legend', { class: `flex flex-col gap-1 w-full ${this.isEditing ? '' : 'font-thin text-2xl'}` }, contentNodes),
            ])

        ];

    }

}
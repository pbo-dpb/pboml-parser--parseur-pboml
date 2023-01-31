import { h } from 'vue'
import TinyButton from "./TinyButton.vue"
import BilingualInput from "../../components/Editor/Inputs/BilingualInput.vue"
import strings from '../../editor-strings'
export default {
    props: ["label"],
    data() {
        return {
            isEditing: false
        }
    },

    render() {

        let actionNode;
        if (!this.isEditing) {
            actionNode = h(TinyButton, {
                'class': 'bg-blue-100', innerText: '🖊️', onClick: (e) => {
                    this.isEditing = true;
                },
            })
        }
        let contentNodes;

        if (this.isEditing) {
            contentNodes = [
                h('fieldset', { class: 'flex flex-col gap-2 w-full' }, [
                    h(BilingualInput, {
                        modelValue: this.label,
                        'onUpdate:modelValue': (value) => this.$emit('update:modelValue', value)
                    })
                ])
                ,
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
            h('div', { class: 'flex flex-row gap-2 font-thin text-2xl' }, [
                actionNode,
                h(this.isEditing ? 'div' : 'legend', { class: 'flex flex-col gap-1 w-full' }, contentNodes),
            ])

        ];

    }

}
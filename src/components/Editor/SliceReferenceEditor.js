import { h } from 'vue'
import BilingualInput from "../../components/Editor/Inputs/BilingualInput.vue"
import strings from '../../editor-strings'
export default {
    props: ["referenced_as", "isEditing"],
    emits: ['update:modelValue'],

    render() {


        let contentNodes;

        if (this.isEditing) {
            contentNodes = [
                h('fieldset', { class: 'flex flex-col gap-2 w-full border-l-4 border-amber-300 pl-4' }, [
                    h(BilingualInput, {
                        modelValue: this.referenced_as,
                        label: strings[document.documentElement.lang].slice_referenced_as_field_label,
                        'onUpdate:modelValue': (value) => this.$emit('update:modelValue', value)
                    })
                ]),
            ]
        } else {
            if (this.referenced_as.en && this.referenced_as.fr) {
                contentNodes = [
                    h('span', { class: 'text-sm font-semibold' }, `${this.referenced_as.en} • ${this.referenced_as.fr}`),
                ]
            } else {
                contentNodes = null
            }

        }

        return [
            contentNodes ? h('div', { class: 'flex flex-row gap-2 ' }, [
                h(this.isEditing ? 'div' : 'legend', { class: this.isEditing ? `flex gap-1 w-full flex-col` : '' }, contentNodes),
            ]) : null

        ];

    }

}
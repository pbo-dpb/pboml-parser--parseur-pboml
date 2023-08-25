import { h } from 'vue'
import SingleInput from "../../components/Editor/Inputs/SingleInput.vue"
import strings from '../../editor-strings'
export default {
    props: ["id", "isEditing"],
    emits: ['update:modelValue'],

    render() {


        let contentNodes;

        if (this.isEditing) {
            contentNodes = [
                h('fieldset', { class: 'flex flex-col gap-2 w-full border-l-4 border-amber-300 pl-4' }, [
                    h(SingleInput, {
                        modelValue: this.id,
                        label: "ID",
                        hint: strings[document.documentElement.lang].slice_id_hint,
                        'onBlur': (event) => this.$emit('update:modelValue', event.target.value)
                    })
                ]),
            ]
        } else {
        }

        return [
            contentNodes ? h('div', { class: 'flex flex-row gap-2 ' }, [
                h(this.isEditing ? 'div' : 'legend', { class: this.isEditing ? `flex gap-1 w-full flex-col` : '' }, contentNodes),
            ]) : null

        ];

    }

}
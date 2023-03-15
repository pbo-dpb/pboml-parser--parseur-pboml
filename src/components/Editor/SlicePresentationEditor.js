import { h } from 'vue'
import editorStrings from '../../editor-strings'
import SelectInput from "../../components/Editor/Inputs/SelectInput.vue"

export default {
    props: ["presentation", "isEditing"],
    emits: ['update:modelValue'],

    render() {

        let choicesMap = new Map();
        choicesMap.set(editorStrings[document.documentElement.lang]['presentation_none'], 'null');
        choicesMap.set(editorStrings[document.documentElement.lang]['presentation_figure'], "figure");
        choicesMap.set(editorStrings[document.documentElement.lang]['presentation_aside'], "aside");
        let contentNodes;

        if (this.isEditing) {
            contentNodes = [
                h(SelectInput, {
                    choices: Object.fromEntries(choicesMap),
                    modelValue: this.presentation ? this.presentation : 'null',
                    'onUpdate:modelValue': (value) => this.$emit('update:modelValue', value === 'null' ? null : value)
                }),
            ]

        } else {
            if (this.presentation === 'aside') {
                contentNodes = [
                    h('div', { class: 'bg-blue-100 rounded p-2 font-semibold text-sm' }, editorStrings[document.documentElement.lang]['presentation_aside'])
                ]
            } else if (this.presentation === 'figure') {
                contentNodes = [
                    h('div', { class: 'bg-gray-300 rounded p-2 font-semibold text-sm' }, editorStrings[document.documentElement.lang]['presentation_figure'])
                ]
            }
        }

        return contentNodes;
    }

}
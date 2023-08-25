import { h } from 'vue'
import editorStrings from '../../editor-strings'
import SelectInput from "../../components/Editor/Inputs/SelectInput.vue"
import { CheckCircleIcon } from '@heroicons/vue/20/solid';

export default {
    props: ["presentation", "isEditing"],
    emits: ['update:modelValue'],

    render() {

        let choicesMap = [
            { value: null, label: editorStrings[document.documentElement.lang]['presentation_none'], classes: ['border-gray-100', 'border-l-gray-300', ''] },
            { value: 'figure', label: editorStrings[document.documentElement.lang]['presentation_figure'], classes: ['items-center', 'border-gray-300', 'bg-gray-100', 'rounded-tr-lg'] },
            { value: 'aside', label: editorStrings[document.documentElement.lang]['presentation_aside'], classes: ['items-center', 'border-blue-300', 'bg-blue-100', 'rounded-tr-lg'] },
        ];
        let contentNodes;

        if (this.isEditing) {
            contentNodes = h('div', { class: 'grid grid-cols-3 gap-4' }, [
                ...choicesMap.map((choiceType) => {

                    return h('label', { class: ['border-2', 'p-2', 'text-blue-800', 'text-sm', 'font-semibold', 'gap-1', 'flex', 'flex-col', ...choiceType.classes].join(' ') }, [
                        h('span', {}, choiceType.label),
                        h('input', {
                            class: 'peer sr-only',
                            type: "radio",
                            value: choiceType.value,
                            checked: choiceType.value === this.presentation,
                            'onInput': (e) => { this.$emit('update:modelValue', choiceType.value) },
                        }),
                        h(CheckCircleIcon, { 'class': 'self-center h-4 w-4 hidden peer-checked:block fill-green-800', 'aria-hidden': true }, () => []),
                    ])

                })
            ])

        }

        return contentNodes;
    }

}
import { h } from 'vue'
import strings from "../editor-strings"
import MarkdownDriver from '../MarkdownDriver'
import BilingualInput from "../components/Editor/Inputs/BilingualInput.vue"
import SelectInput from "../components/Editor/Inputs/SelectInput.vue"

export default {
    props: ['slice'],
    setup(props, { emit }) {

        if (props.slice.readonly) {
            const md = new MarkdownDriver;
            md.shouldBreakNewLines(false);
            return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
                h('div', { class: 'col-span-2 font-bold', innerHTML: md.render(strings[document.documentElement.lang].readonly_slice) }),
                props.slice.renderAsVnode("en"),
                props.slice.renderAsVnode("fr"),
            ])
        }

        return () => h('div', { class: 'flex flex-col gap-4' }, [

            h(SelectInput, {
                choices: {
                    "H1 (n+0)": 0,
                    "> H2 (n+1)": 1,
                    ">> H3 (n+2)": 2,
                    ">>> H4 (n+3)": 3,
                },
                modelValue: props.slice.level,
                'onUpdate:modelValue': (value) => {
                    props.slice.level = parseInt(value);
                }
            }),

            h(BilingualInput, {
                class: "w-full",
                modelValue: props.slice.content,
                'onUpdate:modelValue': (value) => {
                    props.slice.content = value;
                }
            }),
        ]);

    }
}

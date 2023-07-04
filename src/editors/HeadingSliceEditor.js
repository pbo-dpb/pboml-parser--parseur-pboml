import { h } from 'vue'
import strings from "../editor-strings"
import MarkdownDriver from '../MarkdownDriver'
import BilingualInput from "../components/Editor/Inputs/BilingualInput.vue"
import BigRadioInput from "../components/Editor/Inputs/BigRadioInput.vue"
import Renderer from '../components/Renderer/Renderer'

export default {
    props: ['slice'],
    setup(props, { emit }) {

        if (props.slice.readonly) {
            const md = new MarkdownDriver;
            return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
                h('div', { class: 'col-span-2 font-bold', innerHTML: md.render(strings[document.documentElement.lang].readonly_slice) }),

                Renderer.methods.renderSliceAsVnode(props.slice, 'en'),
                Renderer.methods.renderSliceAsVnode(props.slice, 'fr'),
            ])
        }

        return () => h('div', { class: 'flex flex-col gap-4' }, [

            h(BigRadioInput, {
                choices: {
                    "H1": 0,
                    "> H2": 1,
                    ">> H3": 2,
                    ">>> H4": 3,
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

import { h } from 'vue'
import strings from "../editor-strings"
import MarkdownDriver from '../MarkdownDriver'
import BilingualInput from "../components/Editor/Inputs/BilingualInput.vue"

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

            h(BilingualInput, {
                class: "w-full",
                modelValue: props.slice.content,
                'onUpdate:modelValue': (value) => {
                    props.slice.content = value;
                }
            }),

            h('div', { class: 'grid grid-cols-2 gap-4' }, [
                h('figure', { class: "shadow flex justify-center items-center" }, [
                    props.slice.content.en ? h('img', { src: props.slice.content.en, class: 'max-h-64' }) : h('span', '❌'),
                ]),
                h('figure', { class: "shadow flex justify-center items-center" }, [
                    props.slice.content.fr ? h('img', { src: props.slice.content.fr, class: 'max-h-64' }) : h('span', '❌'),
                ]),
            ])

        ]);

    }
}

import { h } from 'vue'
import MarkdownTextarea from "../components/Editor/Inputs/MarkdownTextarea.vue"
import strings from "../editor-strings"
import MarkdownDriver from '../MarkdownDriver'

export default {
    props: ['slice'],
    setup(props, { emit }) {

        if (props.slice.readonly) {
            const md = new MarkdownDriver;
            return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
                h('div', { class: 'col-span-2 font-bold', innerHTML: md.render(strings[document.documentElement.lang].readonly_slice) }),
                props.slice.constructor.rendererForSliceRendererType(props.slice, 'html').renderAsVnode("en"),
                props.slice.constructor.rendererForSliceRendererType(props.slice, 'html').renderAsVnode("fr"),
            ])
        }

        return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
            h(MarkdownTextarea, {
                label: "EN",
                modelValue: props.slice.content['en'],
                'onUpdate:modelValue': (value) => {
                    emit('update:modelValue', {
                        en: value,
                        fr: props.slice.content.fr
                    }
                    )
                }
            }),
            h(MarkdownTextarea, {
                label: "FR",
                modelValue: props.slice.content['fr'],
                'onUpdate:modelValue': (value) => {
                    emit('update:modelValue', {
                        en: props.slice.content.en,
                        fr: value
                    }
                    )
                }
            }),
        ]);

    }
}

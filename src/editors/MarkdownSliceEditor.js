import { h } from 'vue'
import { Remarkable } from 'remarkable';
import MarkdownSlice from '../models/contents/MarkdownSlice.js'
import MarkdownTextarea from "../components/Editor/Inputs/MarkdownTextarea.vue"
import strings from "../editor-strings"

export default {
    props: ['slice'],
    setup(props, { emit }) {

        if (props.slice.readonly) {
            const md = new Remarkable({ breaks: false, });
            return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
                h('div', { class: 'col-span-2 font-bold', innerHTML: md.render(strings[document.documentElement.lang].readonly_slice) }),
                props.slice.renderAsVnode("en"),
                props.slice.renderAsVnode("fr"),
            ])
        }

        return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
            h(MarkdownTextarea, {
                class: "h-64",
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
                class: "h-64",
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

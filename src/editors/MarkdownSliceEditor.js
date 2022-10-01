import { h } from 'vue'
import { Remarkable } from 'remarkable';
import MarkdownSlice from '../models/contents/MarkdownSlice.js'
import MarkdownTextarea from "../components/Editor/Inputs/MarkdownTextarea.vue"

export default {
    props: ['slice'],
    setup(props, { emit }) {

        if (props.slice.readonly) {
            return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
                props.slice.renderReadonlyVnode("en"),
                props.slice.renderReadonlyVnode("fr"),
            ])
        }

        return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
            h(MarkdownTextarea, {
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

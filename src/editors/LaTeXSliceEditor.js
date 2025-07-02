import { h } from 'vue'
import strings from "../editor-strings"
import MarkdownDriver from '../MarkdownDriver'
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
            h('div', { "class": "flex flex-col gap-2" }, [
                h('label', { 'class': 'font-semibold' }, "EN"),
                h("textarea", {
                    'class': "border border-gray-300 rounded-sm p-1 h-96 font-mono",
                    value: props.slice.content['en'],
                    'onChange': (e) => {
                        emit('update:modelValue', {
                            en: e.target.value,
                            fr: props.slice.content.fr
                        }
                        )
                    }
                })
            ]),
            h('div', { "class": "flex flex-col gap-2" }, [
                h('label', { 'class': 'font-semibold' }, "FR"),
                h("textarea", {
                    'class': "border border-gray-300 rounded-sm p-1 h-96 font-mono",
                    value: props.slice.content['fr'],
                    'onChange': (e) => {
                        emit('update:modelValue', {
                            en: props.slice.content.en,
                            fr: e.target.value
                        }
                        )
                    }
                })
            ])
        ]);

    }
}

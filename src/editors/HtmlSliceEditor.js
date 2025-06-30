import { h } from 'vue'
import strings from "../editor-strings"
import MarkdownDriver from '../MarkdownDriver'
import Renderer from '../components/Renderer/Renderer'
import CheckboxInput from '../components/Editor/Inputs/CheckboxInput.vue'

export default {
    props: ['slice', 'isEditingMeta'],
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


            props.isEditingMeta ? h('div', { class: 'border-l-4 pl-4 border-amber-300' }, [
                h(CheckboxInput, {
                    label: strings[document.documentElement.lang].html_slice_should_remove_default_styles,
                    modelValue: props.slice.remove_default_styles,
                    'onUpdate:modelValue': (value) => {
                        props.slice.remove_default_styles = value;
                    }
                }),


            ]) : null,


            props.isEditingMeta ? h('div', { class: 'border-l-4 pl-4 border-amber-300 ' }, [

                h('div', { "class": "flex flex-col gap-2" }, [
                    h('label', { 'class': 'font-semibold' }, "CSS"),
                    h("textarea", {
                        'class': "border border-gray-300 rounded-sm p-1 h-96 font-mono",
                        value: props.slice.css,
                        'onChange': (e) => {
                            props.slice.css = e.target.value ? e.target.value : null;
                        }
                    })
                ])
            ]) : null,




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

import { h, defineAsyncComponent } from "vue"
import editorStrings from "../editor-strings"
import SelectInput from "../components/Editor/Inputs/SelectInput.vue"
import MarkdownTextarea from "../components/Editor/Inputs/MarkdownTextarea.vue"
import BibtexTextarea from "../components/Editor/Inputs/BibtexTextarea.vue"
import DeleteButton from "../components/Editor/DeleteButton"


export default {
    data() {
        return {
            "inuid":
                Math.random().toString(36).substring(2)
        }
    },
    props: ['annotation'],
    emits: ["delete"],
    methods: {
        sanitizeId(id) {
            this.annotation.id = id ? id.replace(/[^a-z0-9\_\-]/gi, '') : ''
        }
    },
    render() {
        const strings = editorStrings[document.documentElement.lang];
        return [
            h('div', { class: 'flex flex-row justify-end gap-4' }, [h(DeleteButton, {
                'onDelete': () => {
                    this.$emit("delete", this.annotation);
                }
            }
            )]),
            h('div', { class: 'flex flex-col gap-1' }, [
                h('label', {
                    class: `font-semibold ${!this.annotation.id ? 'text-red-800' : ''}`,
                    for: `${this.inuid}-id`,
                }, strings.annotation_id_label),
                h('input', {
                    class: `border  p-1 rounded ${!this.annotation.id ? 'border-red-800' : 'border-gray-300'}`,
                    id: `${this.inuid}-id`,
                    value: this.annotation.id,
                    'onChange': (e) => { this.sanitizeId(e.target.value); },
                }),
                this.annotation.id ? h('p', { class: 'text-sm' }, [strings.annotation_id_helper, h('span', { class: 'font-mono rounded bg-gray-100' }, `[^${this.annotation.id}]`)]) : null
            ]),

            h(SelectInput, {
                choices: {
                    "Markdown": `markdown`,
                    "Bibtex": `bibtex`
                },
                label: strings.annotation_content_type_label,
                modelValue: this.annotation.content_type,
                'onUpdate:modelValue': (value) => {
                    this.annotation.content_type = value;
                }
            }),


            this.annotation.content_type === 'markdown' ? h('div', { class: 'grid grid-cols-2 gap-4' }, [
                h(MarkdownTextarea, {
                    label: "EN",
                    modelValue: this.annotation.content.en,
                    'onUpdate:modelValue': (value) => {
                        this.annotation.content.en = value
                    }
                }),
                h(MarkdownTextarea, {
                    label: "FR",
                    modelValue: this.annotation.content.fr,
                    'onUpdate:modelValue': (value) => {
                        this.annotation.content.fr = value
                    }
                }),
            ]) : null,



            this.annotation.content_type === 'bibtex' ? h('div', { class: 'grid grid-cols-2 gap-4' }, [
                h('div', {}, [
                    h(BibtexTextarea, {
                        label: "EN",
                        modelValue: this.annotation.content.en,
                        'onUpdate:modelValue': (value) => {
                            this.annotation.content.en = value
                        }
                    })
                ]),
                h('div', {}, [
                    h(BibtexTextarea, {
                        label: "FR",
                        modelValue: this.annotation.content.fr,
                        'onUpdate:modelValue': (value) => {
                            this.annotation.content.fr = value
                        }
                    })]),
            ]) : null,
        ]

    }

}
import { h, defineAsyncComponent, readonly } from "vue"
import editorStrings from "../editor-strings"
import SelectInput from "../components/Editor/Inputs/SelectInput.vue"
import MarkdownTextarea from "../components/Editor/Inputs/MarkdownTextarea.vue"
import BibtexTextarea from "../components/Editor/Inputs/BibtexTextarea.vue"
import DeleteButton from "../components/Editor/DeleteButton"
import MoveButton from "../components/Editor/MoveButton";


export default {
    data() {
        return {
            "inuid":
                Math.random().toString(36).substring(2)
        }
    },
    props: ['annotation', 'readonlyId', 'canMoveUp', 'canMoveDown'],
    emits: ["delete", "move"],
    methods: {
        sanitizeId(id) {
            this.annotation.id = id ? id.replace(/[^a-z0-9\_\-]/gi, '') : ''
        }
    },
    render() {
        const strings = editorStrings[document.documentElement.lang];
        return h('fieldset', { class: `border-2 border-slate-300 p-4 flex flex-col gap-4 rounded` }, [
            h('legend', { class: `text-sm px-2 text-gray-800 border-2 flex flex-row gap-2 items-center w-full justify-between w-full rounded py-2` }, [
                h('div', { class: 'font-semibold text-lg flex flex-row gap-2 font-mono' }, `[^${this.annotation.id}]`),
                h('div', { class: 'flex flex-row justify-end gap-1' }, [
                    h(DeleteButton, {
                        'onDelete': () => {
                            this.$emit("delete", this.annotation);
                        }
                    }
                    ),
                    h(MoveButton, {
                        canMoveUp: this.canMoveUp,
                        canMoveDown: this.canMoveDown,
                        'onMove': (direction, event) => {
                            this.$emit("move", direction, event);
                        }
                    }, () => []),
                ]),
            ]),

            this.readonlyId ? null : h('div', { class: 'flex flex-col gap-1' }, [
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
        ])

    }

}
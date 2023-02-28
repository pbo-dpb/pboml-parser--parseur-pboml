import { h, setTransitionHooks, Suspense } from 'vue'
import LoadingIndicator from "../../components/LoadingIndicator.vue"
import SliceLabelEditor from '../../components/Editor/SliceLabelEditor.js';
import ChoiceRenderer from '../../components/Editor/Inputs/ChoiceRenderer.js';

export default class Slice {
    constructor(payload) {
        this.id = payload.id;
        this.type = payload.type;
        this.readonly = payload.readonly;
        this.display_label = payload.display_label;
        this.presentation = payload.presentation ? payload.presentation : null;
        this.choices = payload.choices;
        this.print_only = payload.print_only;

        this.referenced_as = {
            en: payload.referenced_as?.en,
            fr: payload.referenced_as?.fr
        };

        this.label = {
            en: payload.label?.en,
            fr: payload.label?.fr
        }

        this.sources = payload.sources ? payload.sources.map(src => {
            return {
                en: src?.en,
                fr: src?.fr
            }
        }) : [];

        this.notes = payload.notes ? payload.notes.map(src => {
            return {
                en: src?.en,
                fr: src?.fr
            }
        }) : [];

        this.content = payload.content;


        this.state = {
            isEditingMeta: false,
            sequence: 0
        }

    }

    _renderLabelTitleVnode(language, force = false) {
        if ((!this.display_label && !force) || !this.label?.[language]) return null;

        let labelNodeType = 'h2'
        let labelNodeClasses = ["font-thin break-after-avoid"]
        let labelNodeContent = this.label[language];

        if (this.presentation) {
            labelNodeType = 'header'
            labelNodeClasses.push("text-center text-xl")
        } else {
            labelNodeClasses.push('text-2xl')
        }

        if (this.presentation === 'figure') {
            labelNodeType = "figcaption";
            if (this.presentation === "figure" && this.referenced_as[language]) {
                labelNodeContent = `<b>${this.referenced_as[language]}</b> &ndash; ${labelNodeContent}`;
            }
        }

        return h(labelNodeType, { innerHTML: labelNodeContent, class: labelNodeClasses.join(" ") });
    }

    __renderMetaVnodes(label, content, language) {
        return [
            h('dl', { class: 'flex flex-col grid-cols-3 gap-.5 border-l-2 border-gray-200 dark:border-gray-800 pl-2 ' }, [
                h('dt', { class: "text-xs font-semibold", innerHTML: label }),
                h('dd', { class: "prose-sm ", innerHTML: content.map(src => src[language]).join("; ") }),
            ]),

        ]
    }

    _renderSourcesVnodes(language) {
        if (!this.sources.length) return [];
        return this.__renderMetaVnodes((this.sources.length > 1 ? 'Sources' : 'Source'), this.sources, language);
    }

    _renderNotesVnodes(language) {
        if (!this.notes.length) return [];
        return this.__renderMetaVnodes(this.notes.length > 1 ? 'Notes' : 'Note', this.notes, language);
    }

    _renderMetaVnodes(language) {
        if (!this.sources.length && !this.notes.length) return [];

        return h('div', { 'class': 'flex flex-col gap-2' }, [
            ...this._renderSourcesVnodes(language),
            ...this._renderNotesVnodes(language)
        ])
    }


    _buildVnodes(language) {
        return [
            this._renderLabelTitleVnode(language),
            this.renderReadonlyVnode(language),
            this._renderMetaVnodes(language)
        ];
    }

    renderReadonlyVnode(language) {
        return [

        ]
    }

    _buildEditorInputVnodes() {
        return [];
    }

    _buildEditorChoicesInputVnode() {
        return [new ChoiceRenderer(this).renderAsVnode()]
    }


    __buildEditorsVnode() {

        return [
            h(SliceLabelEditor, {
                'label': this.label,
                'isEditing': this.state.isEditingMeta,
                'onEditing': (value) => {
                    this.state.isEditingMeta = value;
                },
                'onUpdate:modelValue': (value) => {
                    this.label.en = value.en; this.label.fr = value.fr
                }
            }),
            ...(this.choices ? this._buildEditorChoicesInputVnode() : this._buildEditorInputVnodes())
        ];
    }

    renderAsVnode(language = document.documentElement.lang) {
        let classes = ["flex flex-col gap-4 print:mt-4"];
        classes.push(this.print_only ? 'hidden print:flex' : 'flex')
        classes.push(this.presentation === "figure" ? "mx-auto w-full xl:w-2/3 bg-gradient-to-tr from-white to-gray-100 rounded-tr-3xl py-4 break-inside-avoid-page" : "");
        classes.push(this.presentation === "aside" ? "bg-gradient-to-tr from-sky-100 to-sky-50  rounded-tr-3xl p-4 break-inside-avoid-page" : "");

        let elType = 'section';
        if (this.presentation === 'figure') elType = 'figure';
        else if (this.presentation === 'aside') elType = 'aside';

        return h(elType, { class: classes.join(" "), id: this.anchor }, this._buildVnodes(language));
    }

    renderEditingVnode() {
        return h('fieldset', { class: `border-2 border-slate-300 p-4 flex flex-col gap-4 rounded ${this.readonly ? ' filter grayscale opacity-80' : ''}` }, h(Suspense, null, {
            default: () => h('div', { class: 'flex flex-col gap-2' }, this.__buildEditorsVnode()),
            fallback: () => h('template', null, LoadingIndicator)
        }));
    }

    get anchor() {
        return `${this.type}-${this.state.sequence}`
    }

    toArray() {


        let serialization = {
            type: this.type,
            id: this.id,
            readonly: this.readonly,
            display_label: this.display_label,
            presentation: this.presentation,
            choices: this.choices,
            referenced_as: (this.referenced_as.fr || this.referenced_as.en) ? this.referenced_as : null,
            label: {
                en: this.label?.en,
                fr: this.label?.fr
            },
            sources: this.sources.length ? this.sources : null,
            notes: this.notes.length ? this.notes : null,
            content: this.content
        };



        return Object.fromEntries(Object.entries(serialization).filter(([_, v]) => v !== null));;
    }
}
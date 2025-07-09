import { h, defineAsyncComponent } from 'vue'
import ChoiceRenderer from '../../components/Editor/Inputs/ChoiceRenderer.js';


const defaults = {
    presentation: null,
    readonly: false,
    display_label: true,
    print_only: false
}

export default class Slice {
    constructor(payload) {
        this.id = payload.id;
        this.type = payload.type;
        this.readonly = payload.readonly !== undefined ? payload.readonly : defaults.readonly;
        this.display_label = payload.display_label !== undefined ? payload.display_label : defaults.display_label;
        this.presentation = payload.presentation !== undefined ? payload.presentation : defaults.presentation;
        this.choices = payload.choices;
        this.print_only = payload.print_only !== undefined ? payload.print_only : defaults.print_only;

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

        this.alts = payload.alts ? payload.alts.map(src => {
            return {
                en: src?.en,
                fr: src?.fr
            }
        }) : [];

        this.content = payload.content;



        this.state = {
            isEditingSourceCode: false,
            isEditingMeta: false,
            isPreviewing: false,
            sequence: 0,
            prefix: null,
            canMoveUp: true,
            canMoveDown: true,
            callbacks: {
                move: null,
                delete: null
            }
        }

        this.state._unlocked = payload?.state?._unlocked !== undefined ? payload.state._unlocked : false;

    }


    get labelStrings() {
        return {
            en: [this.referenced_as['en'], this.label['en']].filter(x => x),
            fr: [this.referenced_as['fr'], this.label['fr']].filter(x => x),
        }
    }


    _buildEditorInputVnodes() {
        return [];
    }

    _buildEditorChoicesInputVnode() {
        return [new ChoiceRenderer(this).renderAsVnode()]
    }


    __buildEditorsVnode() {

        return [

            h('div', { class: 'mb-4 empty:hidden' }, [h(defineAsyncComponent(() => import("../../components/Editor/SlicePresentationEditor.js")), {
                'presentation': this.presentation,
                'isEditing': this.state.isEditingMeta,
                'onUpdate:modelValue': (value) => {
                    this.presentation = value;
                }
            })]),

            h('div', { class: 'mb-4 empty:hidden' }, [h(defineAsyncComponent(() => import('../../components/Editor/SliceReferenceEditor.js')), {
                'referenced_as': this.referenced_as,
                'isEditing': this.state.isEditingMeta,
                'onUpdate:modelValue': (value) => {
                    this.referenced_as.en = value.en;
                    this.referenced_as.fr = value.fr;
                }
            })]),


            h('div', { class: 'mb-4 empty:hidden' }, [h(defineAsyncComponent(() => import('../../components/Editor/SliceLabelEditor.js')), {
                'label': this.label,
                'isEditing': this.state.isEditingMeta,
                'onUpdate:modelValue': (value) => {
                    this.label.en = value.en;
                    this.label.fr = value.fr
                }
            })]),


            h('div', { class: 'mb-4 empty:hidden' }, [h(defineAsyncComponent(() => import('../../components/Editor/SliceIdEditor.js')), {
                'id': this.id,
                'isEditing': this.state.isEditingMeta,
                'onUpdate:modelValue': (value) => {
                    this.id = value ? value : null;
                }
            })]),

            ...(this.choices ? this._buildEditorChoicesInputVnode() : this._buildEditorInputVnodes()),

            h('div', { class: 'mt-4' }, [h(defineAsyncComponent(() => import('../../editors/SliceMetasEditor.js')), {
                slice: this
            })]),
        ];
    }


    renderEditingVnode(language = document.documentElement.lang) {
        return h(defineAsyncComponent(() => import('../../editors/SliceEditor.js')), { slice: this, language: language, id: this.anchor, key: this.anchor });
    }

    get anchor() {
        return `${this.state.prefix ? this.state.prefix + '-' : ''}${this.type}-${this.state.sequence}`
    }

    toArray() {


        let serialization = {
            type: this.type,
            id: this.id,
            readonly: this.readonly,
            display_label: this.display_label,
            presentation: this.presentation,
            print_only: this.print_only,
            choices: this.choices,
            referenced_as: (this.referenced_as.fr || this.referenced_as.en) ? this.referenced_as : null,
            label: {
                en: this.label?.en,
                fr: this.label?.fr
            },
            sources: this.sources.length ? this.sources : null,
            notes: this.notes.length ? this.notes : null,
            alts: this.alts.length ? this.alts : null,
            content: this.content,
        };

        if (this.state._unlocked) {
            serialization.state = {
                _unlocked: true,
            }
        }


        for (const [key, value] of Object.entries(defaults)) {
            if (serialization[key] === value) {
                delete serialization[key];
            }
        }

        return Object.fromEntries(Object.entries(serialization).filter(([_, v]) => v !== null));;
    }


    static rendererObjectForSliceRendererType(rendererType) {
        switch (rendererType) {
            case 'html':
                return "SliceHtmlRenderer";
        }
        throw `No renderer object for renderer type ${rendererType}`;
    }

}
import { h, Suspense } from 'vue'
import LoadingIndicator from "../../components/LoadingIndicator.vue"
import SliceLabelEditor from '../../components/Editor/SliceLabelEditor.js';
import ChoiceRenderer from '../../components/Editor/Inputs/ChoiceRenderer.js';

export default class Slice {
    constructor(payload, sequence = 0, depth = 0) {
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
        this.content = payload.content;

        this.state = {
            isEditingMeta: false
        }

        this.sequence = sequence;
        this.depth = depth;
    }

    _renderLabelTitleVnode(language, force = false) {
        if ((!this.display_label && !force) || !this.label?.[language]) return null;

        let labelNodeType;
        let labelNodeClasses = ["font-thin break-after-avoid"]
        let labelNodeContent = this.label[language];
        if (this.presentation === 'figure') {
            labelNodeType = "figcaption";
            labelNodeClasses.push("text-center text-xl")

            if (this.presentation === "figure" && this.referenced_as) {
                labelNodeContent = `<b>${this.referenced_as[language]}</b> &ndash; ${labelNodeContent}`;
            }

        } else {
            labelNodeType = "h2";
            labelNodeClasses.push("text-2xl");
        }

        return h(labelNodeType, { innerHTML: labelNodeContent, class: labelNodeClasses.join(" ") });
    }


    _buildVnodes(language) {
        return [
            this._renderLabelTitleVnode(language),
            this.renderReadonlyVnode(language)
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
        classes.push(this.presentation === "figure" ? "bg-gradient-to-tr  from-white to-gray-50 rounded-tr-3xl pt-4 py-4 break-inside-avoid-page" : "");
        return h(this.presentation === 'figure' ? 'figure' : 'section', { class: classes.join(" ") }, this._buildVnodes(language));
    }

    renderEditingVnode() {
        return h('fieldset', { class: `border-2 border-slate-300 p-4 flex flex-col gap-4 rounded ${this.readonly ? ' filter grayscale opacity-80' : ''}` }, h(Suspense, null, {
            default: () => h('div', { class: 'flex flex-col gap-2' }, this.__buildEditorsVnode()),
            fallback: () => h('template', null, LoadingIndicator)
        }));
    }

    toArray() {
        return {
            type: this.type,
            id: this.id,
            readonly: this.readonly,
            display_label: this.display_label,
            presentation: this.presentation,
            choices: this.choices,
            referenced_as: this.referenced_as,
            label: {
                en: this.label?.en,
                fr: this.label?.fr
            },
            content: this.content
        }
    }
}
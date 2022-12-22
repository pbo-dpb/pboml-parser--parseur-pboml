import { h, Suspense } from 'vue'
import LoadingIndicator from "../../components/LoadingIndicator.vue"
import SliceLabelEditor from '../../components/Editor/SliceLabelEditor.js';

export default class Slice {
    constructor(payload) {
        this.id = payload.id;
        this.type = payload.type;
        this.readonly = payload.readonly;
        this.display_label = payload.display_label;
        this.slice_group = payload.slice_group;
        this.is_figure = payload.is_figure ? payload.is_figure : false;
        this._choices = payload._choices;
        this.print_only = payload.print_only;
        this.label = {
            en: payload.label?.en,
            fr: payload.label?.fr
        }
        this.content = payload.content;
    }

    _renderLabelTitleVnode(language, force = false) {
        if ((!this.display_label && !force) || !this.label?.[language]) return null;

        let labelNodeType;
        let labelNodeClasses = ["font-thin break-after-avoid"]
        let labelNodeContent = this.label[language];
        if (this.slice_group) {
            labelNodeType = "h3";
            labelNodeClasses.push("text-xl");
        } else if (this.is_figure) {
            labelNodeType = "figcaption";
            labelNodeClasses.push("text-center text-xl")

            if (typeof this.is_figure === "number") {
                labelNodeContent = `Figure ${this.is_figure} &ndash; ${labelNodeContent}`;
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
        return null
    }

    _buildEditorInputVnodes() {
        return [];
    }


    __buildEditorsVnode() {


        return [
            (new SliceLabelEditor(this.label)).renderAsVnode(),
            ...(this.choices ? this._buildEditorInputVnodes() : this._buildEditorInputVnodes())
        ];
    }

    renderAsVnode(language = document.documentElement.lang) {
        let classes = ["flex flex-col gap-4 print:mt-4"];
        classes.push(this.print_only ? 'hidden print:flex' : 'flex')
        classes.push(this.is_figure ? "bg-gradient-to-tr  from-white to-gray-50 rounded-tr-3xl pt-4 py-4 break-inside-avoid-page" : "");
        return h(this.is_figure ? 'figure' : 'section', { class: classes.join(" ") }, this._buildVnodes(language));
    }

    renderEditingVnode() {
        return h('fieldset', { class: `flex flex-col gap-4 print:mt-4 ${this.readonly ? ' filter grayscale' : ''}` }, h(Suspense, null, {
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
            is_figure: this.is_figure,
            slice_group: this.slice_group,
            label: {
                en: this.label?.en,
                fr: this.label?.fr
            },
            content: this.content
        }
    }
}
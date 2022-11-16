import { h, Suspense } from 'vue'
import LoadingIndicator from "../../components/LoadingIndicator.vue"

export default class Slice {
    constructor(payload) {
        this.id = payload.id;
        this.type = payload.type;
        this.readonly = payload.readonly;
        this.display_label = payload.display_label;
        this.is_figure = payload.is_figure ? payload.is_figure : false;
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
        let labelNodeClasses = ["font-thin"]
        let labelNodeContent = this.label[language];
        if (this.slice_group) {
            labelNodeType = "h3";
            labelNodeClasses.push("text-xl");
        } else if (this.is_figure) {
            labelNodeType = "figcaption";
            labelNodeClasses.push("text-center", "border-y", "border-gray-100", "dark:border-gray-800", "py-2", "xl:w-2/3", "self-center")

            if (typeof this.is_figure === "number") {
                labelNodeContent = `Figure ${this.is_figure} &ndash; ${labelNodeContent}`;
            }

        } else {
            labelNodeType = "h2";
            labelNodeClasses.push("text-2xl");
        }

        return h(labelNodeType, { innerHTML: labelNodeContent, class: labelNodeClasses.join(" ") });
    }

    _buildVnodes(print, language) {
        return [
            this._renderLabelTitleVnode(language),
            this.renderReadonlyVnode(print, language)
        ];
    }

    renderReadonlyVnode(language) {
        return null
    }

    _buildEditingVnodes() {
        return [
            h('div', { class: 'grid grid-cols-2 gap-4' }, [
                this._renderLabelTitleVnode('en', true),
                this._renderLabelTitleVnode('fr', true)
            ])
        ];
    }

    renderAsVnode(print = false, language = document.documentElement.lang) {
        return h(this.is_figure ? 'figure' : 'section', { class: `flex flex-col gap-4 print:mt-4 ${this.print_only ? 'hidden print:flex' : 'flex'}` }, this._buildVnodes(print, language));
    }

    renderEditingVnode() {
        return h('div', { class: 'flex flex-col gap-4 print:mt-4' }, h(Suspense, null, {
            default: () => h('div', { class: 'flex flex-col gap-2' }, this._buildEditingVnodes()),
            fallback: () => h('template', null, LoadingIndicator)
        }));
    }

    toArray() {
        return {
            type: this.type,
            readonly: this.readonly,
            display_label: this.display_label,
            label: {
                en: this.label?.en,
                fr: this.label?.fr
            },
            content: this.content
        }
    }
}
import { h, Suspense } from 'vue'
import LoadingIndicator from "../../components/LoadingIndicator.vue"

export default class Slice {
    constructor(payload) {
        this.id = payload.id;
        this.type = payload.type;
        this.readonly = payload.readonly;
        this.display_label = payload.display_label;
        this.print_only = payload.print_only;
        this.label = {
            en: payload.label?.en,
            fr: payload.label?.fr
        }
        this.content = payload.content;
    }

    _renderLabelTitleVnode(language, force = false) {
        if (!this.display_label && !force) return null;
        return h('h2', { innerHTML: this.label[language], class: "text-2xl font-thin" });
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
        return h('div', { class: `flex flex-col gap-4 print:mt-4 ${this.print_only ? 'hidden print:flex' : 'flex'}` }, this._buildVnodes(print, language));
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
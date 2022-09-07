import { h } from 'vue'

export default class Slice {
    constructor(payload) {
        this.type = payload.type;
        this.readonly = payload.readonly;
        this.display_label = payload.display_label;
        this.label = {
            en: payload.label?.en,
            fr: payload.label?.fr
        }
        this.content = payload.content;
    }

    _renderLabelTitleVnode(language) {
        if (!this.display_label) return null;
        return h('h2', { innerHTML: this.label[language], class: "text-2xl font-thin" });
    }

    _buildVnodes(print, language) {
        return [
            this._renderLabelTitleVnode(language),
        ];
    }

    renderAsVnode(print = false, language = document.documentElement.lang) {
        return h('div', { class: 'flex flex-col gap-4 break-inside-avoid-page print:mt-4' }, this._buildVnodes(print, language));
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
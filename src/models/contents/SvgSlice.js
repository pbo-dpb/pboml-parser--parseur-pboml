import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";

export default class SvgSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.content = {
            en: payload.content?.en,
            fr: payload.content?.fr
        }
        this.type = "svg"
        this.state.renderedAnchorIdPrefix = `svg-slice-render-${Math.random().toString(36).substring(2)}-`;
    }

    renderReadonlyVnode(language) {
        try {
            if (!this.content[language]) throw 'Missing svg.';
            const parser = new DOMParser();

            let doc = parser.parseFromString(this.content[language], "image/svg+xml")
            doc.documentElement.setAttribute('id', this.state.renderedAnchorIdPrefix + language);
            doc.documentElement.removeAttribute('width');
            doc.documentElement.removeAttribute('height');
            doc.documentElement.classList.add('xl:w-2/3')
            return h('div', { innerHTML: doc.documentElement.outerHTML, class: 'w-full dark:invert flex flex-col items-center' });
        } catch (error) {
            return h('div', { class: 'text-red-800 font-semibold text-4xl' }, () => h('span', {}, `⚠️`))
        }

    }


    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/SvgSliceEditor.js')), { slice: this, 'onUpdate:modelValue': (value) => { this.content = value } }))
        return vnodes;
    }

    toArray() {
        let array = super.toArray();
        array.content = {
            en: this.content?.en,
            fr: this.content?.fr
        }
        return array;
    }

}
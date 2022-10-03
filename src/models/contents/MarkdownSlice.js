import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";
import { Remarkable } from 'remarkable';


export default class MarkdownSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.content = {
            en: payload.content?.en,
            fr: payload.content?.fr
        }
    }

    renderReadonlyVnode(print, language) {
        const md = new Remarkable();
        return h('div', { class: "prose dark:prose-invert max-w-none prose-headings:font-thin", innerHTML: md.render(this.content[language]) });
    }


    _buildEditingVnodes() {
        let vnodes = super._buildEditingVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/MarkdownSliceEditor.js')), { slice: this, 'onUpdate:modelValue': (value) => { this.content = value } }))
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
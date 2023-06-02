import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";
import MarkdownDriver from "../../MarkdownDriver"


export default class MarkdownSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.content = {
            en: payload.content?.en,
            fr: payload.content?.fr
        }
        this.type = "markdown"
    }

    renderReadonlyVnode(language) {
        const md = new MarkdownDriver();
        return h('div', { class: "pboml-prose", innerHTML: md.render(this.content[language]) });
    }


    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
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
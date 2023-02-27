import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";
import MarkdownDriver from '../../MarkdownDriver';


export default class HeadingSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.content = {
            en: payload.content?.en,
            fr: payload.content?.fr
        }

        // Zero indexed level; when rendered to HTML, will use 2+level (so 0 will render as h2, 1 as h3, etc. up to h6)
        this.level = payload.level ? payload.level : 0;
        this.type = "heading";
    }

    renderReadonlyVnode(language) {

        let headingElType = `h${2 + this.level}`;
        let classes = ['font-thin'];

        switch (this.level) {
            case 0:
                classes.push('text-2xl');
                break;
            case 1:
                classes.push('text-xl');
                break;
            case 2:
                classes.push('text-lg');
                break;
        }

        const md = new MarkdownDriver;
        md.shouldBreakNewLines(false);
        md.shouldRenderInline(true);
        return h(headingElType, { innerHTML: md.render(this.content[language]), class: classes.join(' ') });
    }


    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/MarkdownSliceEditor.js')), { slice: this, 'onUpdate:modelValue': (value) => { this.content = value } }))
        return vnodes;
    }

    toArray() {
        let array = super.toArray();
        delete array.display_label;
        delete array.label;
        delete array.presentation;
        array.content = {
            en: this.content?.en,
            fr: this.content?.fr
        }
        array.level = this.level;
        return array;
    }

}
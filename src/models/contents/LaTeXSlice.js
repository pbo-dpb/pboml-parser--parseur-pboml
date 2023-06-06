import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";
import LaTeXSliceHtmlRenderer from '../../Renderers/Html/LaTeXSliceHtmlRenderer';


export default class LaTeXSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.content = {
            en: payload.content?.en,
            fr: payload.content?.fr
        }
        this.type = "LaTeX"
    }

    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/LaTeXSliceEditor.js')), { slice: this, 'onUpdate:modelValue': (value) => { this.content = value } }))
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

    static rendererForSliceRendererType(slice, rendererType) {
        switch (rendererType) {
            case 'html':
                return new LaTeXSliceHtmlRenderer(slice);
        }
    }

}
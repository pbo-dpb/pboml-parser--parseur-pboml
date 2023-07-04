import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";


export default class MarkdownSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.content = {
            en: payload.content?.en,
            fr: payload.content?.fr
        }
        this.type = "markdown"
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



    static rendererObjectForSliceRendererType(rendererType) {
        switch (rendererType) {
            case 'html':
                return "MarkdownSliceHtmlRenderer";
        }
        return super.rendererObjectForSliceRendererType(rendererType);
    }

}
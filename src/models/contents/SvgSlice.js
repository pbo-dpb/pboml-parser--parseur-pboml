import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";
import SvgSliceHtmlRenderer from '../../Renderers/Html/SvgSliceHtmlRenderer';

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

    static rendererForSliceRendererType(slice, rendererType) {
        switch (rendererType) {
            case 'html':
                return new SvgSliceHtmlRenderer(slice);
        }
    }

}
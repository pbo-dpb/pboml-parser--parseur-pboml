import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";

export default class HtmlSlice extends Slice {
    static defaults = {
        remove_default_styles: false,
        css: null,
    }

    constructor(payload) {
        super(payload);
        this.content = {
            en: payload.content?.en,
            fr: payload.content?.fr
        }
        this.css = payload.css;
        this.type = "html"
        this.remove_default_styles = payload.remove_default_styles ? true : false
    }

    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/HtmlSliceEditor.js')), { slice: this, 'onUpdate:modelValue': (value) => { this.content = value }, isEditingMeta: this.state.isEditingMeta }))
        return vnodes;
    }

    toArray() {
        let array = super.toArray();
        array.content = {
            en: this.content?.en,
            fr: this.content?.fr
        }

        array.css = this.css;
        array.remove_default_styles = this.remove_default_styles;

        // Remove default values from  output
        for (const [key, value] of Object.entries(HtmlSlice.defaults)) {
            if (array[key] == value) {
                delete array[key];
            }
        }
        return array;
    }



    static rendererObjectForSliceRendererType(rendererType) {
        switch (rendererType) {
            case 'html':
                return "HtmlSliceHtmlRenderer";
        }
        return super.rendererObjectForSliceRendererType(rendererType);
    }

}
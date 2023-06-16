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


    __buildEditorsVnode() {

        return [

            h('div', {}, [h(defineAsyncComponent(() => import('../../components/Editor/SliceReferenceEditor.js')), {
                'referenced_as': this.referenced_as,
                'isEditing': this.state.isEditingMeta,
                'onUpdate:modelValue': (value) => {
                    this.referenced_as.en = value.en;
                    this.referenced_as.fr = value.fr;
                }
            })]),

            ...(this.choices ? this._buildEditorChoicesInputVnode() : this._buildEditorInputVnodes())
        ];
    }


    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/HeadingSliceEditor.js')), { slice: this }))
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



    static rendererObjectForSliceRendererType(rendererType) {
        switch (rendererType) {
            case 'html':
                return "HeadingSliceHtmlRenderer";
        }
        return super.rendererObjectForSliceRendererType(rendererType);
    }

}
import { h, defineAsyncComponent } from 'vue'
import KvListVariablePair from './KvListVariablePair';
import Slice from "./Slice";


export default class KvListSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.type = "kvlist";
        this.prototype = {
            key: {
                type: payload.prototype?.key?.type,
                label: {
                    en: payload.prototype?.key?.label?.en,
                    fr: payload.prototype?.key?.label?.fr,
                }
            },
            value: {
                type: payload.prototype?.value?.type,
                label: {
                    en: payload.prototype?.value?.label?.en,
                    fr: payload.prototype?.value?.label?.fr,
                }
            },
            display_labels: payload.prototype?.display_labels ? true : false
        }

        this.content = (payload.content && !!payload.content.forEach) ? payload.content.map((el) => new KvListVariablePair(this.prototype, el)) : [];
    }


    appendKvEntry() {
        this.content.push(new KvListVariablePair(this.prototype));
    }

    removeKvEntry(entry) {
        this.content = this.content.filter(kve => kve !== entry);
    }



    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/KvSliceEditor.js')), { slice: this, isEditingMeta: this.state.isEditingMeta }))
        return vnodes;
    }



    toArray() {
        let array = super.toArray();

        array['prototype'] = {
            key: {
                type: this.prototype?.key.type,
                label: { en: this.prototype?.key.label.en, fr: this.prototype?.key.label.fr }
            },
            value: {
                type: this.prototype?.value.type,
                label: { en: this.prototype?.value.label.en, fr: this.prototype?.value.label.fr }
            },

        };

        if (this.prototype?.display_labels === true) {
            array['prototype']['display_labels'] = true;
        }

        array.content = !!this.content.forEach ? this.content.map(kvp => kvp.toArray()) : [];

        return array;
    }



    static rendererObjectForSliceRendererType(rendererType) {
        switch (rendererType) {
            case 'html':
                return "KvListSliceHtmlRenderer";
        }
        return super.rendererObjectForSliceRendererType(rendererType);
    }

}
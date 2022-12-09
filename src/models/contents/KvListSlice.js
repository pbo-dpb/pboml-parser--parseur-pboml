import { h, defineAsyncComponent } from 'vue'
import KvListVariablePair from './KvListVariablePair';
import Slice from "./Slice";
const language = document.documentElement.lang;


export default class KvListSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.prototype = {
            key: {
                type: payload.prototype.key?.type,
                label: {
                    en: payload.prototype.key?.label?.en,
                    fr: payload.prototype.key?.label?.fr,
                }
            },
            value: {
                type: payload.prototype.value?.type,
                label: {
                    en: payload.prototype.value?.label?.en,
                    fr: payload.prototype.value?.label?.fr,
                }
            }
        }

        this.content = (payload.content && !!payload.content.forEach) ? payload.content.map((el) => new KvListVariablePair(this.prototype, el)) : [];
    }


    appendKvEntry() {
        this.content.push(new KvListVariablePair(this.prototype));
    }

    removeKvEntry(entry) {
        this.content = this.content.filter(kve => kve !== entry);
    }

    renderReadonlyVnode(print, language) {
        return h('dl', { 'class': 'flex flex-col gap-2' }, (!!this.content.forEach ? this.content.map((kv) => {
            return kv.getKvNode(language);
        }) : null))
    }


    _buildEditingVnodes() {
        let vnodes = super._buildEditingVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/KvSliceEditor.js')), { slice: this }))
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
            }
        };

        array.content = !!this.content.forEach ? this.content.map(kvp => kvp.toArray()) : [];

        return array;
    }


}
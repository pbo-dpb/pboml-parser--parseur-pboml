import { h } from 'vue'
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

        this.content = payload.content.map((el) => new KvListVariablePair(this.prototype, el));
    }


    _buildVnodes(print, language) {
        let vnodes = super._buildVnodes(print, language);

        vnodes.push(h('dl', { 'class': 'flex flex-col gap-2' }, this.content.map((kv) => {
            return kv.getKvNode(language);
        })));

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

        array.content = this.content.map(kvp => kvp.toArray());

        return array;
    }


}
import { h } from 'vue'
import KvListVariablePair from './KvListVariablePair';
import Slice from "./Slice";
const language = document.documentElement.lang;


export default class KvListSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.prototype = {
            key: {
                type: payload.key?.type,
                label: {
                    en: payload.key?.label?.en,
                    fr: payload.key?.label?.fr,
                }
            },
            value: {
                type: payload.value?.type,
                label: {
                    en: payload.value?.label?.en,
                    fr: payload.value?.label?.fr,
                }
            }
        }

        this.content = payload.content.map((el) => new KvListVariablePair(this.prototype, el));
    }


    _buildVnodes() {
        let vnodes = super._buildVnodes();

        vnodes.push(h('dl', { 'class': 'flex flex-col gap-2' }, this.content.map((kv) => {
            return kv.getKvNode();
        })));

        return vnodes;
    }

}
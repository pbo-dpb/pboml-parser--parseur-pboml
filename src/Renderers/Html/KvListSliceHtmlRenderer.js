import { h, defineAsyncComponent } from 'vue'
import KvListVariablePair from '../../models/contents/KvListVariablePair';
import SliceHtmlRenderer from "./SliceHtmlRenderer";
const language = document.documentElement.lang;


export default class KvListSliceHtmlRenderer extends SliceHtmlRenderer {


    renderReadonlyVnode(language) {
        return h('dl', { 'class': 'flex flex-col gap-2 break-inside-avoid' }, (!!this.slice.content.forEach ? this.slice.content.map((kv) => {
            return kv.getKvNode(language);
        }) : null))
    }



}
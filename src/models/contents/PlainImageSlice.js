import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";


export default class PlainImageSlice extends Slice {
    constructor(payload) {
        super(payload);

        this.content = {
            en: payload.content?.en,
            fr: payload.content?.fr
        }
        this.display_label = payload.display_label === false ? false : true;
        this.presentation = payload.presentation ? payload.presentation : 'figure';
        this.type = "plain_image"
    }

    renderReadonlyVnode(language) {
        return h('figure', { class: "flex justify-center" }, [h('img', { src: this.content[language] })]);
    }


    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        //TODO implement
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

}
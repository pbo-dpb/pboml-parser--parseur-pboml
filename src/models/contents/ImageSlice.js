import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";


export default class ImageSlice extends Slice {
    constructor(payload) {
        super(payload);

        this.content = {
            en: payload.content?.en,
            fr: payload.content?.fr
        }
        this.thumbnails = {
            en: payload.thumbnails?.en,
            fr: payload.thumbnails?.fr,
        };

        this.display_label = payload.display_label === false ? false : true;
        this.presentation = payload.presentation ? payload.presentation : 'figure';
        this.type = "image"
    }

    renderReadonlyVnode(language) {

        if (!this.thumbnails[language]) {
            // Render the original image inline
            return h('figure', { class: "flex justify-center" }, [h('img', { src: this.content[language], 'alt': this.label[language] })]);
        }



    }


    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/ImageSliceEditor.js')), { slice: this }))
        return vnodes;
    }

    toArray() {
        let array = super.toArray();
        array.content = {
            en: this.content?.en,
            fr: this.content?.fr
        }
        if (array.thumbnails.en || array.thumbnails.fr)
            array.thumbnails = this.thumbnails
        return array;
    }

}
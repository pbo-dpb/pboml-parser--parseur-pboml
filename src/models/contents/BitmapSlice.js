import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";

export const BITMAP_RESOLUTIONS = { sm: 640, md: 768, lg: null };
export const BITMAP_FORMATS = ['webp', 'png'];
export const BITMAP_DENSITIES = ['1x', '2x', '3x'];

export default class BitmapSlice extends Slice {
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
        this.type = "bitmap"
    }




    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/BitmapSliceEditor.js')), { slice: this }))
        return vnodes;
    }

    toArray() {
        let array = super.toArray();
        array.content = {
            en: this.content?.en,
            fr: this.content?.fr
        }
        if (this.thumbnails?.en || this.thumbnails?.fr)
            array.thumbnails = this.thumbnails
        return array;
    }



    static rendererObjectForSliceRendererType(rendererType) {
        switch (rendererType) {
            case 'html':
                return "BitmapSliceHtmlRenderer";
        }
        return super.rendererObjectForSliceRendererType(rendererType);
    }


}
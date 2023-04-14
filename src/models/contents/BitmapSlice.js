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
        this.presentation = payload.presentation ? payload.presentation : 'figure';
        this.type = "bitmap"
    }

    buildReadonlySourceNodeForResolution(language, resolution, format) {

        const attributes = {
            'type': `bitmap/${format}`
        };

        let srcSet = [];
        BITMAP_DENSITIES.forEach(pixelDensity => {
            let url = this.thumbnails[language][`${resolution}_${pixelDensity}_${format}`];
            if (url) srcSet.push(`${url} ${pixelDensity}`)
        })
        if (!srcSet.length)
            return null;

        attributes.srcset = srcSet.join(', ');

        let maxForRes = BITMAP_RESOLUTIONS[resolution];
        if (maxForRes) {
            attributes['media'] = `(max-width: ${maxForRes}px)`;
        }

        return h('source', { ...attributes });

    }

    buildReadonlyImgNode(language) {
        return h('img', { src: this.content[language], 'alt': this.label[language], fetchpriority: 'low', loading: 'lazy' });
    }

    renderReadonlyVnode(language) {

        let bitmapNode;
        if (!this.thumbnails[language]) {
            // Render the original bitmap inline
            bitmapNode = h('figure', { class: "flex justify-center" }, [this.buildReadonlyImgNode(language)]);
        } else {
            bitmapNode = h('picture', {
            }, [
                ...Object.keys(BITMAP_RESOLUTIONS).map((rs) => {
                    return BITMAP_FORMATS.map(ft => this.buildReadonlySourceNodeForResolution(language, rs, ft))
                }),
                this.buildReadonlyImgNode(language)
            ]);
        }

        return h('a', { href: this.content[language], target: '_blank', class: 'flex items-center justify-center' }, [
            bitmapNode
        ])

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

}
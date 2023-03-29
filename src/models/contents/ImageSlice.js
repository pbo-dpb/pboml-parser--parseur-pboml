import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";

export const IMAGE_RESOLUTIONS = { sm: 640, md: 768, lg: null };
export const IMAGE_FORMATS = ['webp', 'png'];
export const IMAGE_DENSITIES = ['1x', '2x', '3x'];

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

    buildReadonlySourceNodeForResolution(language, resolution, format) {

        const attributes = {
            'type': `image/${format}`
        };

        let srcSet = [];
        IMAGE_DENSITIES.forEach(pixelDensity => {
            let url = this.thumbnails[language][`${resolution}_${pixelDensity}_${format}`];
            if (url) srcSet.push(`${url} ${pixelDensity}`)
        })
        if (!srcSet.length)
            return null;

        attributes.srcset = srcSet.join(', ');

        let maxForRes = IMAGE_RESOLUTIONS[resolution];
        if (maxForRes) {
            attributes['media'] = `(max-width: ${maxForRes}px)`;
        }

        return h('source', { ...attributes });

    }

    buildReadonlyImgNode(language) {
        return h('img', { src: this.content[language], 'alt': this.label[language], fetchpriority: 'low', loading: 'lazy' });
    }

    renderReadonlyVnode(language) {

        let imageNode;
        if (!this.thumbnails[language]) {
            // Render the original image inline
            imageNode = h('figure', { class: "flex justify-center" }, [this.buildReadonlyImgNode(language)]);
        } else {
            imageNode = h('picture', {
            }, [
                ...Object.keys(IMAGE_RESOLUTIONS).map((rs) => {
                    return IMAGE_FORMATS.map(ft => this.buildReadonlySourceNodeForResolution(language, rs, ft))
                }),
                this.buildReadonlyImgNode(language)
            ]);
        }

        return h('a', { href: this.content[language], target: '_blank', class: 'flex items-center justify-center' }, [
            imageNode
        ])

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
        if (array.thumbnails?.en || array.thumbnails?.fr)
            array.thumbnails = this.thumbnails
        return array;
    }

}
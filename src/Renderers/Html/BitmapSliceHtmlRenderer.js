import { h, defineAsyncComponent } from 'vue'
import SliceHtmlRenderer from "./SliceHtmlRenderer";
import { BITMAP_RESOLUTIONS, BITMAP_FORMATS, BITMAP_DENSITIES } from '../../models/contents/BitmapSlice';

export default class BitmapSliceHtmlRenderer extends SliceHtmlRenderer {

    buildReadonlySourceNodeForResolution(language, resolution, format) {

        const attributes = {
            'type': `image/${format}`
        };

        let srcSet = [];
        BITMAP_DENSITIES.forEach(pixelDensity => {
            let url = this.slice.thumbnails[language][`${resolution}_${pixelDensity}_${format}`];
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
        return h('img', { src: this.slice.content[language], 'alt': this.slice.label[language], fetchpriority: 'low', loading: 'lazy' });
    }

    renderReadonlyVnode(language) {

        let bitmapNode;
        if (!this.slice.thumbnails[language]) {
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

        return h('a', { href: this.slice.content[language], target: '_blank', class: 'flex items-center justify-center' }, [
            bitmapNode
        ])

    }



}
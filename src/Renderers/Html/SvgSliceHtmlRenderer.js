import { h, defineAsyncComponent } from 'vue'
import SliceHtmlRenderer from "./SliceHtmlRenderer";
import SvgRenderer from '../../components/SvgRenderer.js';

export default class SvgSliceHtmlRenderer extends SliceHtmlRenderer {

    renderReadonlyVnode(language) {
        try {
            if (!this.slice.content[language]) throw 'Missing svg.';

            const parser = new DOMParser();

            let doc = parser.parseFromString(this.slice.content[language], "image/svg+xml")
            doc.documentElement.setAttribute('id', this.slice.state.renderedAnchorIdPrefix + language);
            doc.documentElement.removeAttribute('width');
            doc.documentElement.removeAttribute('height');
            return h(SvgRenderer, { payload: doc.documentElement.outerHTML, class: 'w-full @4xl/slice:w-2/3 self-center dark:invert flex flex-col' });
        } catch (error) {
            return h('div', { class: 'text-red-800 font-semibold text-4xl' }, () => h('span', {}, `⚠️`))
        }

    }

}
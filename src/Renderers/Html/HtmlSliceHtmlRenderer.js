import { h, defineAsyncComponent } from 'vue'
import SliceHtmlRenderer from "./SliceHtmlRenderer";

export default class SvgSliceHtmlRenderer extends SliceHtmlRenderer {

    renderReadonlyVnode(language) {
        try {
            if (!this.slice.content[language]) throw `Missing HTML for language ${language}.`;
            return h(defineAsyncComponent(() => import("../../components/HtmlRenderer.js")), {
                payload: this.slice.content[language],
                class: 'prose dark:prose-invert max-w-none',
                css: this.slice.css,
                removeDefaultStyles: this.slice.remove_default_styles
            });
        } catch (error) {
            return h('div', { class: 'text-red-800 font-semibold text-4xl' }, () => h('span', {}, `⚠️`))
        }

    }

}
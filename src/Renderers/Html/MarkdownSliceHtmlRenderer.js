import { h, defineAsyncComponent } from 'vue'
import SliceHtmlRenderer from "./SliceHtmlRenderer";
import MarkdownDriver from '../../MarkdownDriver';

export default class MarkdownSliceHtmlRenderer extends SliceHtmlRenderer {


    renderReadonlyVnode(language) {
        const md = new MarkdownDriver();
        return h('div', { class: "pboml-prose", innerHTML: md.render(this.slice.content[language]) });
    }

}
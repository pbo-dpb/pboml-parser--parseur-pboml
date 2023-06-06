import { h, defineAsyncComponent } from 'vue'
import SliceHtmlRenderer from "./SliceHtmlRenderer";


export default class LaTeXSliceHtmlRenderer extends SliceHtmlRenderer {

    renderReadonlyVnode(language) {
        return h(defineAsyncComponent(() => import('../../components/LaTeXRenderer.js')), {
            payload: this.slice.content[language]
        });
    }


}
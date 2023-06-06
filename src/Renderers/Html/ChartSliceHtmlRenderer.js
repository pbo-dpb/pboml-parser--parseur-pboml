import { h, defineAsyncComponent, Suspense } from 'vue'
import SliceHtmlRenderer from "./SliceHtmlRenderer";
const ArrayTableGrapher = defineAsyncComponent(() => import('../../components/Grapher/ArrayTableGrapher.js'))
const DataTableGrapher = defineAsyncComponent(() => import('../../components/Grapher/DataTableGrapher.js'))
import LoadingIndicator from "../../components/LoadingIndicator.vue"


import rendererStrings from '../../renderer-strings.js';

export default class ChartSliceHtmlRenderer extends SliceHtmlRenderer {


    renderReadonlyVnode(language) {

        let grapher;
        if (this.slice.datatable) {
            grapher = h(DataTableGrapher, {
                language: language,
                datatable: this.slice.datatable
            })
        } else if (this.slice.arraytable) {
            grapher = h(ArrayTableGrapher, {
                language: language,
                arraytable: this.slice.arraytable
            })
        }

        return h(Suspense, null, {
            default: () => h('div', { class: 'flex print:block flex-col items-center justify-center' }, [
                h('div', { class: `w-full` }, [
                    grapher
                ])
            ]),
            fallback: () => h('template', null, LoadingIndicator)
        });
    }



    renderAltsVnodes(language) {
        if (!this.slice.alts.length) {
            let content;
            if (this.slice.datatable) {
                content = this.slice.datatable.renderReadonlyVnode(language)
            } else if (this.slice.arraytable) {
                content = this.slice.arraytable.renderReadonlyVnode(language)
            }
            return content ? this.renderMetaVnodes(rendererStrings[language].alts_label, content, language, true) : [];
        };
        return super.renderAltsVnodes(language);
    }


}
import { h, defineAsyncComponent, Suspense } from 'vue'
import Slice from "./Slice";
const ArrayTableGrapher = defineAsyncComponent(() => import('../../components/Grapher/ArrayTableGrapher.js'))
const DataTableGrapher = defineAsyncComponent(() => import('../../components/Grapher/DataTableGrapher.js'))
import LoadingIndicator from "../../components/LoadingIndicator.vue"
import DataTable from './DataTable/DataTable';
import ArrayTable from './ArrayTable/ArrayTable';

import rendererStrings from '../../renderer-strings.js';


export default class ChartSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.type = "chart"
        if (payload.arraytable) {
            this.arraytable = new ArrayTable(payload.arraytable)
        } else {
            this.datatable = new DataTable(payload.datatable);
        }
    }


    renderReadonlyVnode(language) {

        let grapher;
        if (this.datatable) {
            grapher = h(DataTableGrapher, {
                language: language,
                datatable: this.datatable
            })
        } else if (this.arraytable) {
            grapher = h(ArrayTableGrapher, {
                language: language,
                arraytable: this.arraytable
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

    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/ChartSliceEditor.js')), { slice: this, 'onUpdate:datatable': (datatable) => { this.datatable = datatable } }))
        return vnodes;
    }


    renderAltsVnodes(language) {
        if (!this.alts.length) {
            let content;
            if (this.datatable) {
                content = this.datatable.renderReadonlyVnode(language)
            } else if (this.arraytable) {
                content = this.arraytable.renderReadonlyVnode(language)
            }
            return content ? this.renderMetaVnodes(rendererStrings[language].alts_label, content, language, true) : [];
        };
        return super.renderAltsVnodes(language);
    }



    toArray() {
        let array = super.toArray();
        array.datatable = this.datatable;
        array.arraytable = this.arraytable;
        return array;
    }


}
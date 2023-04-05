import { h, defineAsyncComponent, Suspense } from 'vue'
import Slice from "./Slice";
const ArrayTableGrapher = defineAsyncComponent(() => import('../../components/Grapher/ArrayTableGrapher.js'))
const DataTableGrapher = defineAsyncComponent(() => import('../../components/Grapher/DataTableGrapher.js'))
import LoadingIndicator from "../../components/LoadingIndicator.vue"
import DataTable from './DataTable/DataTable';

export default class ChartSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.type = "chart"
        if (payload.datatable) {
            this.datatable = payload.datatable ? new DataTable(payload.datatable) : null;
        } else if (payload.arraytable) {
            this.arraytable = payload.arraytable ? payload.arraytable : null;
            this.axes = payload.axes ? payload.axes : null;
            this.colors = payload.colors ? payload.colors : null;
            this.strings = {
                en: payload.strings?.en,
                fr: payload.strings?.fr
            }
            if (payload.chart_type) {
                this.chart_types = [payload.chart_type]
            } else {
                this.chart_types = payload.chart_types ? payload.chart_types : 'bar'
            }
        }

    }


    renderReadonlyVnode(language) {

        let grapher;
        if (this.datatable) {
            grapher = h(DataTableGrapher, {
                language: language,
                datatable: datatable
            })
        } else if (this.arraytable) {
            grapher = h(ArrayTableGrapher, {
                language: language,
                strings: this.strings,
                types: this.chart_types,
                arraytable: this.arraytable,
                axes: this.axes,
                colors: this.colors,
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
        vnodes.push(h('div', { class: 'grid grid-cols-2 gap-2' }, [
            this.renderReadonlyVnode('en'),
            this.renderReadonlyVnode('fr')
        ]))
        return vnodes;
    }



    toArray() {
        let array = super.toArray();
        array.strings = this.strings;
        array.datatable = this.datatable;
        array.arraytable = this.arraytable;
        array.axes = this.axes;
        array.chart_types = this.chart_types;
        return array;
    }


}
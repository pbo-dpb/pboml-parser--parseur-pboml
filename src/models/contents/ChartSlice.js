import { h, defineAsyncComponent, Suspense } from 'vue'
import Slice from "./Slice";
import DataTable from './DataTable/DataTable';
import ArrayTable from './ArrayTable/ArrayTable';

import ChartSliceHtmlRenderer from '../../Renderers/Html/ChartSliceHtmlRenderer';


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




    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/ChartSliceEditor.js')), { slice: this, 'onUpdate:datatable': (datatable) => { this.datatable = datatable } }))
        return vnodes;
    }




    toArray() {
        let array = super.toArray();
        array.datatable = this.datatable;
        array.arraytable = this.arraytable;
        return array;
    }

    static rendererForSliceRendererType(slice, rendererType) {
        switch (rendererType) {
            case 'html':
                return new ChartSliceHtmlRenderer(slice);
        }
    }
}
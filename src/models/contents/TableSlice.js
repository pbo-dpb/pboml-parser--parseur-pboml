import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";
import DataTable from './DataTable/DataTable';


export default class TableSlice extends Slice {

    constructor(payload) {
        super(payload);
        this.type = "table"
        this.datatable = new DataTable(payload);
        this.datatable.state.caption = this.labelStrings
    }


    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/TableSliceEditor.js')), { slice: this, 'onUpdate:datatable': (datatable) => { this.datatable = datatable } }))
        return vnodes;
    }


    toArray() {
        let array = super.toArray();
        const letDatatableArray = this.datatable.toArray();
        array.variables = letDatatableArray.variables;
        array.content = letDatatableArray.content;
        array.presentation_style = letDatatableArray.presentation_style;
        array.entrygroups = letDatatableArray.entrygroups;
        return array;
    }



    static rendererObjectForSliceRendererType(rendererType) {
        switch (rendererType) {
            case 'html':
                return "TableSliceHtmlRenderer";
        }
        return super.rendererObjectForSliceRendererType(rendererType);
    }


}
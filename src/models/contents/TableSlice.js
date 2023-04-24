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


    renderReadonlyVnode(language) {
        let vnodes = super.renderReadonlyVnode(language);
        vnodes.push(this.datatable.renderReadonlyVnode(language))
        return vnodes;
    }



    renderAsVnode(language = document.documentElement.lang) {
        let parentVnode = super.renderAsVnode(language);
        parentVnode.props.class = `${parentVnode.props.class} break-inside-avoid-page`;
        return parentVnode;
    }

    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/TableSliceEditor.js')), { slice: this, 'onUpdate:modelValue': (value) => { } }))
        return vnodes;
    }


    toArray() {
        let array = super.toArray();

        const letDatatableArray = this.datatable.toArray();
        array.variables = letDatatableArray.variables;
        array.content = letDatatableArray.content;
        return array;
    }

}
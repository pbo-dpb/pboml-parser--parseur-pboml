import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";
import DataTable from './DataTable/DataTable';


export default class ChartSlice extends Slice {

    constructor(payload) {
        super(payload);
        this.type = "chart"
        this.datatable = new DataTable(payload.datatable);
    }


    renderReadonlyVnode(language) {
        let vnodes = super.renderReadonlyVnode(language);
        vnodes.push(h(defineAsyncComponent(() => import('../../components/ChartRenderer/ChartRenderer.js')), { language, data: this.datatable }, () => []));
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
        array.datatable = this.datatable;
        return array;
    }

}
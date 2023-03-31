import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";
import Table from './Table';


export default class TableSlice extends Slice {

    constructor(payload) {
        super(payload);
        this.type = "table"
        this.table = new Table(payload);
    }


    renderReadonlyVnode(language) {
        let vnodes = super.renderReadonlyVnode(language);
        vnodes.push(this.table.renderReadonlyVnode(language))
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

        array.variables = {};

        Object.entries(this.table.variables).forEach((entry) => {
            const [key, value] = entry;
            array.variables[key] = value.toArray();
        });

        array.content = this.table.content;
        return array;
    }

}
import { h } from 'vue'
import Slice from "./Slice";
const language = document.documentElement.lang;
import { Remarkable } from 'remarkable';
import TableSliceVariable from './TableSliceVariable';


export default class TableSlice extends Slice {
    constructor(payload) {
        super(payload);
        let variables = {};
        Object.entries(payload.variables).forEach((entry) => {
            const [key, value] = entry;
            variables[key] = new TableSliceVariable(value);
        });
        this.variables = variables;
        this.content = payload.content;
    }

    get variableCount() {
        return Object.values(this.variables).length;
    }

    __buildHorizontalHeader() {
        return h('thead', {}, [h('tr', { class: "" }, Object.values(this.variables).map(vr => {
            let node = vr.getTableHeaderVnode();
            node.props['width'] = `${100 / this.variableCount}%`;
            return node;
        }))])
    }

    __buildHorizontalBody() {
        let rows = this.content.map(row => {

            let columns = [];
            Object.entries(row).forEach((entry) => {
                const [key, value] = entry;
                const variable = this.variables[key];
                columns.push(variable.getTableCellVnode(value));
            });
            return h('tr', { class: "" }, columns);
        })
        return h('tbody', {}, rows);
    }

    _buildVnodes() {
        let vnodes = super._buildVnodes();

        vnodes.push(h('table', { class: "table-fixed border-collapse border border-gray-300 dark:border-gray-700" }, [
            this.__buildHorizontalHeader(),
            this.__buildHorizontalBody(),
        ]));

        return vnodes;
    }

}
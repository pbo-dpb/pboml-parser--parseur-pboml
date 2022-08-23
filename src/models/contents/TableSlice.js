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

    get bodyRowsCount() {
        return this.content.length;
    }

    get mobileShouldUseVertical() {
        return this.variableCount < this.bodyRowsCount;
    }

    __buildHorizontalHeader() {
        return h('thead', {}, [h('tr', { class: "" }, Object.values(this.variables).map(vr => {
            let node = vr.getTableHeaderVnode('col');
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
                columns.push(variable.getTableCellVnode(value, 'row'));
            });
            return h('tr', { class: "" }, columns);
        })
        return h('tbody', {}, rows);
    }

    __buildVerticalBody() {

        let rows = [];
        Object.entries(this.variables).forEach((entry) => {
            const [key, variable] = entry;

            let columns = [];
            let headerCol = variable.getTableHeaderVnode('row');
            headerCol.props['width'] = `${100 / (this.bodyRowsCount + 1)}%`;
            columns.push(headerCol);

            this.content.forEach(content => {
                let cell = variable.getTableCellVnode(content[key], 'col');
                cell.props['width'] = `${100 / (this.bodyRowsCount + 1)}%`;
                columns.push(cell);
            })
            rows.push(columns);
        });

        return h('tbody', {}, rows.map(row => {
            return h('tr', {}, row)
        }));
    }



    _buildVnodes() {
        let vnodes = super._buildVnodes();
        vnodes.push(h('table', {
            class: `table-fixed border-collapse border border-gray-300 dark:border-gray-700 ${this.mobileShouldUseVertical ? "lg:hidden" : "hidden lg:table"}`
        }, [
            this.__buildHorizontalHeader(),
            this.__buildHorizontalBody(),
        ]));

        vnodes.push(h('table', { class: `table-fixed border-collapse border border-gray-300 dark:border-gray-700 ${this.mobileShouldUseVertical ? "hidden lg:table" : "lg:hidden"}` },
            this.__buildVerticalBody(),
        ));

        return vnodes;
    }

}
import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";
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

    __buildHorizontalHeader(print, language) {
        return h('thead', {}, [h('tr', { class: "" }, Object.values(this.variables).map(vr => {
            let node = vr.getTableHeaderVnode('col', language);
            node.props['width'] = `${100 / this.variableCount}%`;
            return node;
        }))])
    }

    __buildHorizontalBody(print, language) {
        let rows = this.content.map(row => {

            let columns = [];
            Object.entries(row).forEach((entry) => {
                const [key, value] = entry;
                const variable = this.variables[key];
                columns.push(variable.getTableCellVnode(value, 'row', print, language));
            });
            return h('tr', { class: "" }, columns);
        })
        return h('tbody', {}, rows);
    }

    __buildVerticalBody(print, language) {

        let rows = [];
        Object.entries(this.variables).forEach((entry) => {
            const [key, variable] = entry;

            let columns = [];
            let headerCol = variable.getTableHeaderVnode('row', language);
            headerCol.props['width'] = `${100 / (this.bodyRowsCount + 1)}%`;
            columns.push(headerCol);

            this.content.forEach(content => {
                let cell = variable.getTableCellVnode(content[key], 'col', print, language);
                cell.props['width'] = `${100 / (this.bodyRowsCount + 1)}%`;
                columns.push(cell);
            })
            rows.push(columns);
        });

        return h('tbody', {}, rows.map(row => {
            return h('tr', {}, row)
        }));
    }


    renderReadonlyVnode(print, language) {
        return null; // Readonly tables are not supported
    }


    _buildVnodes(pring, language) {
        let vnodes = super._buildVnodes(print, language);
        vnodes.push(h('table', {
            class: `table-fixed border-collapse border border-gray-300 dark:border-gray-700 ${this.mobileShouldUseVertical ? "lg:hidden print:hidden" : "hidden lg:table print:table print:text-sm"}`
        }, [
            this.__buildHorizontalHeader(print, language),
            this.__buildHorizontalBody(print, language),
        ]));

        vnodes.push(h('table', { class: `table-fixed border-collapse border border-gray-300 dark:border-gray-700 ${this.mobileShouldUseVertical ? "hidden lg:table print:table print:text-sm" : "lg:hidden print:hidden"}` },
            this.__buildVerticalBody(print, language),
        ));

        return vnodes;
    }

    _buildEditingVnodes() {
        let vnodes = super._buildEditingVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/TableSliceEditor.js')), { slice: this, 'onUpdate:modelValue': (value) => { } }))
        return vnodes;
    }


    toArray() {
        let array = super.toArray();

        array.variables = {};

        Object.entries(this.variables).forEach((entry) => {
            const [key, value] = entry;
            array.variables[key] = value.toArray();
        });

        array.content = this.content;
        return array;
    }

}
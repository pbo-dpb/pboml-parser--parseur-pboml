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

    __buildHorizontalHeader(language) {
        return h('thead', {}, [h('tr', { class: "" }, Object.values(this.variables).map(vr => {
            let node = vr.getTableHeaderVnode('col', language);
            node.props['width'] = `${100 / this.variableCount}%`;
            return node;
        }))])
    }

    __buildHorizontalBody(language) {
        let rows = this.content.map(row => {

            let columns = [];
            Object.entries(row).forEach((entry) => {
                const [key, value] = entry;
                const variable = this.variables[key];
                columns.push(variable.getTableCellVnode(value, 'row', language));
            });
            return h('tr', { class: "break-inside-avoid" }, columns);
        })
        return h('tbody', {}, rows);
    }

    __buildVerticalBody(language) {

        let rows = [];
        Object.entries(this.variables).forEach((entry) => {
            const [key, variable] = entry;

            let columns = [];
            let headerCol = variable.getTableHeaderVnode('row', language);
            headerCol.props['width'] = `${100 / (this.bodyRowsCount + 1)}%`;
            columns.push(headerCol);

            this.content.forEach(content => {
                let cell = variable.getTableCellVnode(content[key], 'col', language);
                cell.props['width'] = `${100 / (this.bodyRowsCount + 1)}%`;
                columns.push(cell);
            })
            rows.push(columns);
        });

        return h('tbody', {}, rows.map(row => {
            return h('tr', {}, row)
        }));
    }


    renderReadonlyVnode(language) {
        return null; // Readonly tables are not supported
    }


    renderAsVnode(language = document.documentElement.lang) {
        let parentVnode = super.renderAsVnode(language);
        parentVnode.props.class = `${parentVnode.props.class} break-inside-avoid-page`;
        return parentVnode;
    }

    _buildVnodes(language) {
        let vnodes = super._buildVnodes(language);
        vnodes.push(h('table', {
            class: `table-fixed border-collapse border border-gray-300 dark:border-gray-700 break-inside-avoid-page ${this.mobileShouldUseVertical ? "lg:hidden print:hidden" : "hidden lg:table print:table print:text-sm"}`
        }, [
            this.__buildHorizontalHeader(language),
            this.__buildHorizontalBody(language),
        ]));

        vnodes.push(h('table', { class: `table-fixed border-collapse border border-gray-300 break-inside-avoid dark:border-gray-700 ${this.mobileShouldUseVertical ? "hidden lg:table print:table print:text-sm" : "lg:hidden print:hidden"}` },
            this.__buildVerticalBody(language),
        ));

        return vnodes;
    }

    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
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
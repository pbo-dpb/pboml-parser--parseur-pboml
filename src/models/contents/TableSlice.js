import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";
import TableSliceVariable from './TableSliceVariable';


export default class TableSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.type = "table"
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

    get shouldShowVerticalTable() {
        // If a 3 column (or less) table is possible, show it vertically on mobile
        if (window.innerWidth < 1024 && this.bodyRowsCount < 4 && this.variableCount > 2) return true;

        // When a table is a time series, always show it horizontally
        if (this.descriptiveVariableIsTimeSeries) return false;

        return this.variableCount < this.bodyRowsCount;
    }

    get descriptiveVariableIsTimeSeries() {
        let descriptiveVariable = Object.values(this.variables).find(v => v.is_descriptive);
        if (!descriptiveVariable) return false;

        if (descriptiveVariable.is_time) return true;
        const descriptiveVariableKey = Object.keys(this.variables).find(key => this.variables[key] === descriptiveVariable);

        /**
         * Count the number of values that match a year or fiscal year pattern.
         * For example, 2023, 2023-24 and 2023-2024 would count as a year
         * value. If more than half of the variable's values are year
         * values we consider the content a time series.
         */
        const timeSeriesTest = /^[0-9]{4}(\-[0-9]{2,4})?$/gm;
        let yearCount = 0;
        this.content.forEach(col => {
            if (timeSeriesTest.test(col?.[descriptiveVariableKey]?.en ?? '') || timeSeriesTest.test(col?.[descriptiveVariableKey]?.fr ?? '')) yearCount++;
        })

        return yearCount > this.content.length / 2;
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
        let vnodes = super.renderReadonlyVnode(language);

        if (this.shouldShowVerticalTable) {
            vnodes.push(h('table', {
                class: `table-fixed border-collapse border border-gray-300 dark:border-gray-700 break-inside-avoid-page  lg:table print:table print:text-sm`
            }, [
                this.__buildHorizontalHeader(language),
                this.__buildHorizontalBody(language),
            ]));
        } else {
            vnodes.push(h('table', { class: `table-fixed border-collapse border border-gray-300 break-inside-avoid dark:border-gray-700  lg:table print:table print:text-sm` },
                this.__buildVerticalBody(language),
            ));
        }





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

        Object.entries(this.variables).forEach((entry) => {
            const [key, value] = entry;
            array.variables[key] = value.toArray();
        });

        array.content = this.content;
        return array;
    }

}
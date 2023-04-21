import { h } from 'vue'
import DataTableVariable from "./DataTableVariable";
import DataTableEntry from './DataTableEntry';
const isLg = ((window.innerWidth > 0) ? window.innerWidth : screen.width) >= 1024;

export default class DataTable {
    constructor(payload) {
        let variables = {};
        Object.entries(payload?.variables ?? {}).forEach((entry) => {
            const [key, value] = entry;
            variables[key] = new DataTableVariable(value);
        });
        this.variables = variables;

        let dataTableEntries = [];
        this.content = (payload?.content ?? []).map(entry => {
            return new DataTableEntry(entry);
        });
    }

    get variableCount() {
        return Object.values(this.variables).length;
    }

    get bodyRowsCount() {
        return this.content.length;
    }


    get descriptiveVariableKeyPair() {
        let vK = null;
        let vV = null;
        Object.entries(this.variables).forEach((entry) => {
            const [key, value] = entry;
            if (!vK && value.is_descriptive) {
                vK = key;
                vV = value;
            }
        });
        return [vK, vV];
    }

    get descriptiveVariableKey() {
        const [key, value] = this.descriptiveVariableKeyPair;
        return key
    }

    groupsMapForLanguage(language) {
        const groups = new Map();

        Object.entries(this.variables).forEach((entry) => {
            const [key, variable] = entry;
            if (variable.is_descriptive) return;
            const groupName = variable.group?.[language] ?? '';
            let updatedGroup = {
                ...(groups.get(groupName) ? groups.get(groupName) : {})
            }
            updatedGroup[key] = variable;
            groups.set(groupName, updatedGroup)
        });
        return groups;
    }


    __buildTableRowColumnsNodes(shouldUseGroupsPresentation, key, variable, language) {

        let columns = [];
        let headerCol = variable.getTableHeaderVnode('row', language);
        if (isLg)
            headerCol.props['width'] = `${100 * (1 / (shouldUseGroupsPresentation ? 6 : 3))}%`;
        else
            headerCol.props['class'] += ' w-32'
        columns.push(headerCol);

        this.content.forEach(content => {
            let cell = variable.getTableCellVnode(content[key], 'col', language);
            if (isLg)
                cell.props['width'] = `${(100 * (2 / 3)) / (this.bodyRowsCount)}%`;
            else
                cell.props['class'] = cell.props['class'] + ' w-24'
            columns.push(cell);
        })
        return columns;
    }

    __buildTheadNode(shouldUseGroupsPresentation, language) {
        let rows = []

        Object.entries(this.variables).forEach((entry) => {
            const [key, variable] = entry;
            if (!variable.is_descriptive) return;
            let columns = this.__buildTableRowColumnsNodes(shouldUseGroupsPresentation, key, variable, language)
            rows.push(h('tr', {}, [
                shouldUseGroupsPresentation ? h('td', { class: (isLg ? '' : ' w-32') }, '') : null,
                ...columns
            ]))
        });

        return h('thead', {}, rows);
    }

    __buildTableNodes(language) {

        let groups = this.groupsMapForLanguage(language);
        const shouldUseGroupsPresentation = groups.size > 1;

        let nodes = [
            this.__buildTheadNode(shouldUseGroupsPresentation, language)
        ];

        groups.forEach((variables, groupName) => {
            let trs = [];
            let isFirst = true;
            Object.entries(variables).forEach((varEntry) => {
                const [key, variable] = varEntry;
                let columns = this.__buildTableRowColumnsNodes(shouldUseGroupsPresentation, key, variable, language)

                let groupCell;
                if (shouldUseGroupsPresentation && isFirst) {
                    let cellClasses = (groupName ? DataTableVariable.getCellBaseClass() : '') + (isLg ? '' : ' w-32')
                    groupCell = h('th', { scope: 'rowgroup', rowspan: Object.values(variables).length, class: cellClasses }, groupName);
                }

                trs.push(h('tr', {}, [groupCell, ...columns]))
                isFirst = false;
            });

            nodes.push(h('tbody', {}, trs))
        });

        return nodes;

    }


    renderReadonlyVnode(language) {
        let vnodes = [];

        vnodes.push(h('div', {
            class: 'overflow-x-auto'
        }, [
            h('table', { class: `min-w-full w-max lg:w-full table-fixed border-collapse  break-inside-avoid lg:table print:table print:text-sm` },
                ...this.__buildTableNodes(language),
            )
        ]));

        return vnodes;
    }


}
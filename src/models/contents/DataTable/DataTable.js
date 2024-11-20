import { h } from 'vue'
import DataTableVariable from "./DataTableVariable";
import DataTableEntry from './DataTableEntry';
import rendererStrings from '../../../renderer-strings';

const isLg = ((window.innerWidth > 0) ? window.innerWidth : screen.width) >= 1024;

export default class DataTable {


    static defaults = {
        presentation_style: 'prose',
    }

    constructor(payload) {
        let variables = {};

        Object.entries(payload?.variables ?? {}).forEach((entry) => {
            const [key, value] = entry;
            variables[key] = new DataTableVariable(value, key);
        });
        this.variables = variables;



        const content = payload?.content ?? [];
        this.content = (Symbol.iterator in content ? content : []).map(entry => {
            return new DataTableEntry(entry);
        });

        this.presentation_style = (payload?.presentation_style && payload.presentation_style !== undefined) ? payload.presentation_style : DataTable.defaults.presentation_style;


        this.state = {
            caption: null
        }
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


    deleteVariableWithKey(variableKey) {
        delete this.variables[variableKey];
        this.content.forEach((ct) => delete ct[variableKey])
    }

    groupsMapForLanguage(language) {
        const groups = [];

        const descriptiveVariablesThatAreAlreadyPartOfThead = this.__tHeadVariables(language);

        Object.entries(this.variables).forEach((entry) => {
            const [key, variable] = entry;

            if (variable.is_descriptive && Object.keys(descriptiveVariablesThatAreAlreadyPartOfThead).includes(key)) return;

            const groupName = variable.group?.[language] ?? '';

            if (groups.length === 0 || groups[groups.length - 1].key !== groupName) {
                let newGroupVariables = {};
                newGroupVariables[key] = variable;
                groups.push({ key: groupName, variables: newGroupVariables });
            } else {
                groups[groups.length - 1].variables[key] = variable;
            }
        });


        return groups;
    }

    getAllUnitsUsedInTableForLanguage(language) {

        let units = [];
        Object.entries(this.variables).forEach((entry) => {
            const [key, variable] = entry;
            if (variable.is_descriptive) return;
            const unit = (variable.unit?.[language] ?? '').trim()
            if (!unit || units.includes(unit)) return;
            units.push(unit)
        });
        return units;

    }

    getWholeTableUnitForLanguage(language) {

        const units = this.getAllUnitsUsedInTableForLanguage(language);
        if (units.length > 1) return null;

        return units[0];
    }




    __buildTableRowColumnsNodes(shouldUseGroupsPresentation, key, variable, language, inThead) {

        let columns = [];
        let headerCol = variable.getTableHeaderVnode('row', language, !this.getWholeTableUnitForLanguage(language), false, this);
        if (isLg)
            headerCol.props['width'] = `${100 * (1 / (shouldUseGroupsPresentation ? 6 : 3))}%`;
        else
            headerCol.props['class'] += ' w-32'
        columns.push(headerCol);

        this.content.forEach(content => {
            let cell = variable.getTableCellVnode(content[key], inThead ? 'col' : false, language, content.emphasize, this);
            if (isLg)
                cell.props['width'] = `${(100 * (2 / 3)) / (this.bodyRowsCount)}%`;
            else
                cell.props['class'] = cell.props['class'] + ' w-24'
            columns.push(cell);
        })
        return columns;
    }

    __tHeadVariables() {
        let theadVariables = {}

        let lastElIsDescriptive = false;
        for (const [key, variable] of Object.entries(this.variables)) {

            if (!lastElIsDescriptive && !variable.is_descriptive) {
                lastElIsDescriptive = false;
                continue;
            } else if (lastElIsDescriptive && !variable.is_descriptive) {
                break;
            }

            theadVariables[key] = variable;
            lastElIsDescriptive = true;
        }
        return theadVariables;
    }

    __buildTheadNode(shouldUseGroupsPresentation, language) {

        const tHeadVariables = this.__tHeadVariables(language);
        let rows = [];

        for (const [key, variable] of Object.entries(tHeadVariables)) {
            let columns = this.__buildTableRowColumnsNodes(shouldUseGroupsPresentation, key, variable, language, true)
            rows.push(h('tr', {}, [
                shouldUseGroupsPresentation ? h('td', { class: (isLg ? '' : ' w-32') }, '') : null,
                ...columns
            ]))

        }

        return h('thead', {}, rows);
    }

    __buildTableNodes(language) {

        let groups = this.groupsMapForLanguage(language);


        const shouldUseGroupsPresentation = groups.length > 1;

        let nodes = [
            this.__buildTableCaptionNodes(language),
            this.__buildTheadNode(shouldUseGroupsPresentation, language)
        ];

        groups.forEach((group) => {
            let groupName = group.key;
            let variables = group.variables;
            let trs = [];
            let isFirst = true;
            Object.entries(variables).forEach((varEntry) => {
                const [key, variable] = varEntry;
                let columns = this.__buildTableRowColumnsNodes(shouldUseGroupsPresentation, key, variable, language, false)

                let groupCell;
                if (shouldUseGroupsPresentation && isFirst) {
                    let cellClasses = (groupName ? `${DataTableVariable.getCellBaseClass()} pboml-prose` : '') + (isLg ? '' : ' w-32')

                    groupCell = h('th', { scope: 'row', rowspan: Object.values(variables).length, class: `bg-transparent ${cellClasses}` }, groupName ? groupName : [
                        h('span', { class: 'sr-only' }, rendererStrings[language].empty_cell_label),
                    ]);

                }

                trs.push(h('tr', {}, [groupCell, ...columns]))
                isFirst = false;
            });

            nodes.push(h('tbody', {}, trs))
        });

        return nodes;

    }


    __buildTableCaptionNodes(language) {

        let captionStrings = [
            ...this.state.caption?.[language] ?? [],
            this.getWholeTableUnitForLanguage(language)
        ].filter(x => x);
        if (!captionStrings.length) return [];

        return h('caption', { class: 'sr-only' }, [captionStrings.join(', ')]);
    }


    /**
     * We repeat the title's figure 
     */
    renderReadonlyVnode(language) {
        let vnodes = [];

        let globalUnit = this.getWholeTableUnitForLanguage(language)

        if (globalUnit) vnodes.push(h('div', { 'aria-hidden': true, class: 'font-thin text-gray-800 dark:text-gray-200 border-l-2 border-gray-200 dark:border-gray-700  pl-2' }, `${globalUnit}`))

        vnodes.push(h('div', {
            class: 'overflow-x-auto'
        }, [
            h('table', { class: `min-w-full w-max lg:w-full table-fixed border-collapse break-inside-avoid lg:table print:table print:text-sm` },
                this.__buildTableNodes(language),
            ),

        ]));

        return vnodes;
    }


    toArray() {
        let array = {
            presentation_style: this.presentation_style
        };

        // Remove default values from  output
        for (const [key, value] of Object.entries(DataTable.defaults)) {
            if (array[key] == value) {
                delete array[key];
            }
        }

        array.variables = {};

        Object.entries(this.variables).forEach((entry) => {
            const [key, value] = entry;
            array.variables[key] = value.toArray();
        });

        array.content = this.content.map((entry) => entry.toArray());
        return array;
    }

}
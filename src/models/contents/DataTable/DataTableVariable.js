import { h } from 'vue'
import MarkdownDriver from '../../../MarkdownDriver';
import rendererStrings from '../../../renderer-strings';
import deepEqual from 'deep-equal';
import DataTableEntry from './DataTableEntry';
import { ArrowTurnDownRightIcon, ChevronDoubleRightIcon } from '@heroicons/vue/16/solid';

const defaults = {
    skip_chart: false,
    is_descriptive: false,
    group: null,
    emphasize: false,
    unit: null,
    type: 'markdown',
    presentation_style: 'inherit',
    level: 0,

    // Chart related properties
    chart_type: 'bar',
    tension: 0
}

export default class DataTableVariable {
    static #cellBaseClass = 'prose border border-gray-300 dark:border-gray-700 p-1 leading-snug text-balance hyphens-auto';

    constructor(payload, key) {

        this.key = key;

        this.label = {
            en: payload.label?.en,
            fr: payload.label?.fr
        }

        this.type = payload.type !== undefined ? payload.type : defaults.type;
        this.readonly = payload.readonly;
        this.is_descriptive = payload.is_descriptive;
        this.presentation_style = (payload?.presentation_style && payload.presentation_style !== undefined) ? payload.presentation_style : defaults.presentation_style;
        this.skip_chart = payload.skip_chart ? true : false
        this.emphasize = (payload.emphasize !== defaults.emphasize) ? payload.emphasize : defaults.emphasize;
        this.chart_type = payload.chart_type ? payload.chart_type : defaults.chart_type;
        this.level = payload.level ? payload.level : defaults.level;
        this.group = payload.group ? {
            en: payload.group?.en ?? '',
            fr: payload.group?.fr ?? ''
        } : null
        this.unit = payload.unit ? {
            en: payload.unit?.en ?? '',
            fr: payload.unit?.fr ?? ''
        } : null

        this.tension = payload.tension !== undefined ? payload.tension : defaults.tension;
    }

    static generateUniqueDataTableVariableId(label, otherVariables, groupname) {
        let key = (`${groupname ? groupname : ''} ${label ? label : ''}`).toLowerCase().replace('', '-').replace(/[^_a-z0-9]+/g, "")
        if (!key) key = (Math.random() + 1).toString(36).substring(8);

        if (!otherVariables) return key;

        // Avoid collisions with DataTableEntry formatting properties (eg. emphasize) or existing keys by appending a random string at the start and end
        while (!/^[a-z]/.test(key) || Object.keys(DataTableEntry.defaults).includes(key) || otherVariables[key] || Object.values(otherVariables).some((v) => v.key === key)) {
            key = (Math.random() + 1).toString(36).substring(8).replace(/[^a-z]+/g, "") + key;
        }

        return key;
    }

    static getCellBaseClass() {
        return this.#cellBaseClass;
    }


    getTableHeaderVnode(scope = null, language, shouldIncludeUnit = true, editorStyle = false, owningDataTable) {
        const md = new MarkdownDriver;
        let cellClasses = `${DataTableVariable.#cellBaseClass} sticky z-50 -left-2 max-w-50-vw text-left px-2`;

        if (editorStyle && this.is_descriptive) {
            cellClasses += " border-l-yellow-500 border-l-2 ";
        }

        let labelSpan;
        if (editorStyle) {
            labelSpan = h('div', { class: `flex flex-col` }, [
                h('div', { innerHTML: md.render(this.label[language]), class: "pboml-prose  prose-p:leading-snug w-full prose-sm" }),
                h('span', { class: 'font-mono text-xs opacity-50' }, this.key)
            ])

        } else if (this.label[language]) {
            labelSpan = h('span', { innerHTML: md.render(this.label[language]), class: "pboml-prose  prose-p:leading-snug w-full" });
        }

        let unitSpan;
        if (shouldIncludeUnit && this.unit?.[language]) {
            unitSpan = h('span', { class: 'text-gray-800 dark:text-gray-200 font-normal', innerHTML: md.render(this.unit[language]) });
        }

        let groupSpan;
        if (editorStyle && this.group?.[language]) {
            groupSpan = h('span', { class: 'text-gray-800 dark:text-gray-200 font-normal bg-slate-100 rounded-sm w-fit px-1', innerHTML: md.render(this.group[language]) });
        }


        if (this.emphasize) {
            cellClasses += " bg-[rgba(254,249,195,0.8)] dark:bg-[rgba(133,77,14,0.8)]";
        } else {
            cellClasses += " bg-[rgba(219,234,254,0.8)] dark:bg-[rgba(3,7,18,0.8)] lg:bg-transparent";
        }
        cellClasses += " backdrop-blur-xs lg:backdrop-blur-none";

        let cellContent = [];

        if (this.level > 0) {
            Array.from(Array(this.level).keys()).forEach((c) => {
                if (c < this.level - 1) {
                    cellContent.push(h('span', { class: 'size-2 shrink-0 grow-0', ariaHidden: true }, ' '));
                } else {
                    let opacity;
                    switch (this.level) {
                        case 1:
                            opacity = "opacity-20"
                            break;
                        case 2:
                            opacity = "opacity-30"
                            break;
                        case 3:
                            opacity = "opacity-40"
                            break;
                        case 4:
                            opacity = "opacity-50"
                            break;
                    }
                    cellContent.push(h(ArrowTurnDownRightIcon, { class: `size-4 shrink-0 grow-0 text-gray-500 dark:text-gray-500 ${opacity}` }));
                    cellContent.push(h('span', { class: 'sr-only' }, rendererStrings[language].indented_datatable_variable.replace(':level', this.level)));
                }

            }
            )
        }
        cellContent.push(h('div', { class: `flex flex-col gap-.5 w-full` }, [
            groupSpan,
            labelSpan,
            unitSpan,
        ]));

        if (!editorStyle && this.type === 'separator') {
            const colspan = owningDataTable.content.length + 1;
            return h('td', { class: `${cellClasses}  bg-slate-100 lg:bg-slate-100 dark:bg-slate-800 dark:lg:bg-slate-800 py-0 shadow-inner`, role: "separator", colspan }, [
                labelSpan ? h('div', { class: 'flex flex-row gap-0.5 w-full py-1 font-semibold' }, cellContent) : h('div', { class: "h-1" })
            ]);
        }





        return h('th', { class: cellClasses, scope: scope }, [
            h('div', { class: 'flex flex-row items-center gap-0.5 w-full' }, cellContent)
        ]);
    }



    getTableCellVnode(value, scope = null, language, emphasize = false, owningDataTable = null) {

        let cellClasses = DataTableVariable.#cellBaseClass;

        let presentation_style = this.presentation_style;
        if (presentation_style === 'inherit' && owningDataTable && owningDataTable.presentation_style === 'prose') {
            presentation_style = "prose";
        } else if (presentation_style === 'inherit' && owningDataTable && owningDataTable.presentation_style === 'accounting') {
            presentation_style = 'accounting';
        }


        let innerHTML;

        switch (this.type) {
            case 'markdown':
                const md = new MarkdownDriver;
                try {
                    innerHTML = md.render(value[language] ? value[language] : value)
                } catch (error) {
                    innerHTML = ""
                }
                cellClasses += " pboml-prose prose-p:leading-tight ";
                break;
            case 'number':
                innerHTML = (new Intl.NumberFormat(language)).format(value);
                break;
            default:
                innerHTML = value[language] ? value[language] : value;
        }

        switch (presentation_style) {
            case 'prose':
                cellClasses += " text-center";
                break;
            case 'accounting':
                cellClasses += " slashed-zero tabular-nums text-right px-2";
                break;
        }

        let shouldEmphasizeCell = false;
        if (this.emphasize) {
            shouldEmphasizeCell = true;
        } else if (emphasize) {
            shouldEmphasizeCell = true;
        }
        if ((!value && value !== 0) || innerHTML === "NaN" || innerHTML === "") {
            // Gray out non 0 falsish,  NaN values or completely empty cells.
            innerHTML = `<span class='sr-only'>${rendererStrings[language].empty_cell_label}</span>`;
            if (this.shouldEmphasizeCell) {
                cellClasses += " bg-gray-200 dark:bg-gray-800";
            } else {
                cellClasses += " bg-gray-100 dark:bg-gray-900";
            }
        } else if (shouldEmphasizeCell) {
            cellClasses += " bg-yellow-100 dark:bg-yellow-800";
        }


        let cellAttributes = { class: cellClasses, innerHTML };

        if (this.is_descriptive && scope) {
            cellAttributes.scope = scope;
        }

        return h(this.is_descriptive ? 'th' : 'td', cellAttributes);
    }


    toArray() {

        let arrayout = {
            label: { en: this.label?.en, fr: this.label?.fr },
            type: this.type,
            readonly: this.readonly,
            is_descriptive: this.is_descriptive,
            group: this.group,
            skip_chart: this.skip_chart,
            emphasize: this.emphasize,
            chart_type: this.chart_type,
            unit: this.unit,
            presentation_style: this.presentation_style,
            level: this.level,
        }

        // Remove default values and empty objects from output
        for (const [key, value] of Object.entries(defaults)) {
            if (deepEqual(arrayout[key], value) || deepEqual(arrayout[key], { en: '', fr: '' }) || deepEqual(arrayout[key], { en: '' }) || deepEqual(arrayout[key], { fr: '' })) {
                delete arrayout[key];
            }
        }

        if (!arrayout?.label?.en && !arrayout?.label?.fr) {
            delete arrayout.label;
        }


        return arrayout
    }


}
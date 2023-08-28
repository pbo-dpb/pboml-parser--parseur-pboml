import { h } from 'vue'
import MarkdownDriver from '../../../MarkdownDriver';
import rendererStrings from '../../../renderer-strings';
import deepEqual from 'deep-equal';
import DataTableEntry from './DataTableEntry';

const defaults = {
    is_time: false,
    skip_chart: false,
    is_descriptive: false,
    group: null,
    emphasize: false,
    unit: null,
    type: 'markdown',

    // Chart related properties
    chart_type: 'bar',
    tension: 0
}

export default class DataTableVariable {
    static #cellBaseClass = 'border border-gray-300 dark:border-gray-700 p-.5 text-center leading-snug hyphens-auto';

    constructor(payload) {
        this.label = {
            en: payload.label?.en,
            fr: payload.label?.fr
        }

        this.type = payload.type !== undefined ? payload.type : defaults.type;
        this.readonly = payload.readonly;
        this.is_descriptive = payload.is_descriptive;
        this.is_time = payload.is_time !== undefined ? payload.is_time : defaults.is_time;
        this.skip_chart = payload.skip_chart ? true : false
        this.emphasize = (payload.emphasize !== defaults.emphasize) ? payload.emphasize : defaults.emphasize;
        this.chart_type = payload.chart_type ? payload.chart_type : defaults.chart_type;
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

    static generateUniqueDataTableVariableId(label, otherVariables) {
        let key = (label ? label : '').toLowerCase().replace('', '-').replace(/[^_a-z0-9]+/g, "")
        if (!key) key = (Math.random() + 1).toString(36).substring(8);

        if (!otherVariables) return key;

        // Avoid collisions with DataTableEntry formatting properties (eg. emphasize) or existing keys by appending a random string at the end
        while (Object.keys(DataTableEntry.defaults).includes(key) || otherVariables[key]) {
            key += (Math.random() + 1).toString(36).substring(8);
        }
        return key;
    }

    static getCellBaseClass() {
        return this.#cellBaseClass;
    }


    getTableHeaderVnode(scope = null, language, shouldIncludeUnit = true, shouldIncludeGroup = false) {
        const md = new MarkdownDriver;

        let labelSpan = h('span', { innerHTML: md.render(this.label[language]), class: "pboml-prose" });

        let unitSpan;
        if (shouldIncludeUnit && this.unit?.[language]) {
            unitSpan = h('span', { class: 'text-gray-800 dark:text-gray-200 font-normal', innerHTML: md.render(this.unit[language]) });
        }

        let groupSpan;
        if (shouldIncludeGroup && this.group?.[language]) {
            groupSpan = h('span', { class: 'text-gray-800 dark:text-gray-200 font-normal', innerHTML: md.render(this.group[language]) });
        }

        return h('th', { class: `${DataTableVariable.#cellBaseClass} sticky left-0 bg-gray-100 lg:bg-transparent dark:bg-gray-950`, scope: scope }, [
            h('div', { class: 'flex flex-col gap-.5' }, [
                groupSpan,
                labelSpan,
                unitSpan,
            ])
        ]);
    }



    getTableCellVnode(value, scope = null, language) {

        let cellClasses = DataTableVariable.#cellBaseClass;
        let innerHTML;
        switch (this.type) {
            case 'markdown':
                const md = new MarkdownDriver;
                try {
                    innerHTML = md.render(value[language] ? value[language] : value)
                } catch (error) {
                    innerHTML = ""
                }
                cellClasses += " pboml-prose";
                break;
            case 'number':
                innerHTML = (new Intl.NumberFormat(language)).format(value);
                break;
            case 'fy':
                // Will break in 2100, sorry.
                if (language === 'fr')
                    innerHTML = `20${String(value).substring(0, 1)}-20${String(value).substring(2)}`;
                else
                    innerHTML = `20${String(value).substring(0, 1)}-${String(value).substring(2)}`;
                break;
            default:
                innerHTML = value[language] ? value[language] : value;
        }

        if ((!value && value !== 0) || innerHTML === "NaN") {
            // Gray out non 0 falsish or NaN values
            innerHTML = `<span class='sr-only'>${rendererStrings[language].empty_cell_label}</span>`;
            cellClasses += " bg-gray-100 dark:bg-gray-900"
        }

        return h(this.is_descriptive ? 'th' : 'td', { class: cellClasses, scope: (this.is_descriptive && scope ? scope : null), innerHTML });
    }


    toArray() {

        let arrayout = {
            label: { en: this.label?.en, fr: this.label?.fr },
            type: this.type,
            readonly: this.readonly,
            is_descriptive: this.is_descriptive,
            is_time: this.is_time,
            group: this.group,
            skip_chart: this.skip_chart,
            emphasize: this.emphasize,
            chart_type: this.chart_type,
            unit: this.unit,
        }

        // Remove default values and empty objects from output
        for (const [key, value] of Object.entries(defaults)) {

            if (deepEqual(arrayout[key], value) || deepEqual(arrayout[key], { en: '', fr: '' }) || deepEqual(arrayout[key], { en: '' }) || deepEqual(arrayout[key], { fr: '' })) {
                delete arrayout[key];
            }
        }


        return arrayout
    }


}
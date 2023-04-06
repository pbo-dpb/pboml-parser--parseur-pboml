import { h } from 'vue'
import MarkdownDriver from '../../../MarkdownDriver';

const defaults = {
    display_label: true,
    is_time: false,
    skip_chart: false,
    is_descriptive: false,
    group: null
}

export default class DataTableVariable {
    static #cellBaseClass = 'border border-gray-300 dark:border-gray-700 p-.5 text-center leading-snug';

    constructor(payload) {
        this.label = {
            en: payload.label?.en,
            fr: payload.label?.fr
        }

        this.unit = {
            en: payload.unit?.en,
            fr: payload.unit?.fr
        }

        this.type = payload.type;
        this.readonly = payload.readonly;
        this.display_label = payload.display_label !== undefined ? payload.display_label : defaults.display_label;
        this.is_descriptive = payload.is_descriptive;
        this.is_time = payload.is_time !== undefined ? payload.is_time : defaults.is_time;
        this.skip_chart = payload.skip_chart ? true : false
        this.group = payload.group ? {
            en: payload.group.en,
            fr: payload.group.fr
        } : null
    }



    getTableHeaderVnode(scope = null, language) {
        const md = new MarkdownDriver;
        md.shouldBreakNewLines(false);
        return h('th', { class: DataTableVariable.#cellBaseClass, scope: scope, innerHTML: this.display_label ? md.render(this.label[language]) : '' });
    }



    getTableCellVnode(value, scope = null, language) {

        let innerHTML;
        switch (this.type) {
            case 'markdown':
                const md = new MarkdownDriver;
                md.shouldBreakNewLines(false);

                try {
                    innerHTML = md.render(value[language] ? value[language] : value)
                } catch (error) {
                    innerHTML = ""
                }
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

        return h(this.is_descriptive ? 'th' : 'td', { class: `${DataTableVariable.#cellBaseClass}`, scope: (this.is_descriptive && scope ? scope : null), innerHTML });
    }


    toArray() {

        let arrayout = {
            label: { en: this.label?.en, fr: this.label?.fr },
            type: this.type,
            readonly: this.readonly,
            display_label: this.display_label,
            is_descriptive: this.is_descriptive,
            is_time: this.is_time
        }

        // Remove default values from  output
        for (const [key, value] of Object.entries(defaults)) {
            if (arrayout[key] === value) {
                delete arrayout[key];
            }
        }

        return arrayout
    }


}
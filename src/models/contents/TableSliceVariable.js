import { h } from 'vue'
import { Remarkable } from 'remarkable';


export default class TableSliceVariable {
    static #cellBaseClass = 'border border-gray-300 dark:border-gray-700 p-.5 text-center';

    constructor(payload) {
        this.label = {
            en: payload.label?.en,
            fr: payload.label?.fr
        }

        this.type = payload.type;
        this.readonly = payload.readonly;
        this.display_label = payload.display_label;
        this.is_descriptive = payload.is_descriptive;
    }



    getTableHeaderVnode(scope = null, language) {
        const md = new Remarkable({ breaks: false, });
        return h('th', { class: TableSliceVariable.#cellBaseClass, scope: scope, innerHTML: this.display_label ? md.render(this.label[language]) : '' });
    }



    getTableCellVnode(value, scope = null, print = false, language) {

        let innerHTML;
        switch (this.type) {
            case 'markdown':
                const md = new Remarkable({ breaks: false });

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

        return h(this.is_descriptive ? 'th' : 'td', { class: `${TableSliceVariable.#cellBaseClass} ${print ? 'py-2' : ''}`, scope: (this.is_descriptive && scope ? scope : null), innerHTML });
    }


    toArray() {
        return {
            label: { en: this.label?.en, fr: this.label?.fr },
            type: this.type,
            readonly: this.readonly,
            display_label: this.display_label,
            is_descriptive: this.is_descriptive
        }
    }


}
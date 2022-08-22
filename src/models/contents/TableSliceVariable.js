import { h } from 'vue'
const language = document.documentElement.lang;
import { Remarkable } from 'remarkable';


export default class TableSliceVariable {
    static #cellBaseClass = 'border border-gray-300 dark:border-gray-700 p-.5';

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



    getTableHeaderVnode() {
        const md = new Remarkable({ breaks: false, });
        return h('th', { class: TableSliceVariable.#cellBaseClass, innerHTML: this.display_label ? md.render(this.label[language]) : '' });
    }

    getTableCellVnode(value) {

        let innerHTML;
        switch (this.type) {
            case 'markdown':
                const md = new Remarkable({ breaks: false });
                innerHTML = md.render(value[language] ? value[language] : value)
                break;
            case 'number':
                innerHTML = (new Intl.NumberFormat(language)).format(value);
                break;
            default:
                innerHTML = value[language] ? value[language] : value;
        }

        return h(this.is_descriptive ? 'th' : 'td', { class: TableSliceVariable.#cellBaseClass, innerHTML });
    }


}
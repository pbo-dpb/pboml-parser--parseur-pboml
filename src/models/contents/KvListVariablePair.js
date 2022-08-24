import { h } from 'vue'
import { Remarkable } from 'remarkable';


export default class KvListVariablePair {
    constructor(prototype, payload) {

        this.key = {
            content: payload.key?.content,
        }

        this.value = {
            content: payload.value?.content,
        }
        this.display_label = payload.display_label;
        this.prototype = prototype;


    }

    renderKeyOrValueContentToHtml(type, value, language) {
        let innerHTML;

        switch (type) {
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
        return innerHTML;
    }

    getKeyVnode(language) {

        return h('dt', { class: "" }, [
            this.display_label ? h('span', { innerHTML: this.renderKeyOrValueContentToHtml('markdown', this.prototype.key.label, language) }) : null,
            h('span', { class: "font-semibold text-gray-800 text-sm", innerHTML: this.renderKeyOrValueContentToHtml(this.prototype.key.type, this.key.content, language) })
        ]);
    }

    getValueVnode(language) {
        return h('dd', { class: "col-span-2" }, [
            this.display_label ? h('span', { innerHTML: this.renderKeyOrValueContentToHtml('markdown', this.prototype.value.label, language) }) : null,
            h('span', { class: "text-sm", innerHTML: this.renderKeyOrValueContentToHtml(this.prototype.value.type, this.value.content, language) })
        ]);
    }

    getKvNode(language) {
        return h('div', { 'class': 'flex flex-col grid-cols-3 gap-.5 border-l-2 border-gray-200 dark:border-gray-800 pl-2 ' },
            [
                this.getKeyVnode(language),
                this.getValueVnode(language)
            ]);
    }


}
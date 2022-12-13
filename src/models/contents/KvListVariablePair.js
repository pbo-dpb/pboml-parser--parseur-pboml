import { h } from 'vue'
import { Remarkable } from 'remarkable';

const defaultProseClasses = "prose prose-sm dark:prose-invert max-w-none prose-a:font-normal prose-p:inline";

export default class KvListVariablePair {
    constructor(prototype, payload) {

        if (payload) {
            this.key = {
                content: payload.key?.content,
            }

            this.value = {
                content: payload.value?.content,
            }
        } else {
            const defaultStructures = {
                markdown: {
                    en: "",
                    fr: ""
                },
                number: 0,
                default: {
                    en: "",
                    fr: ""
                }
            }
            this.key = {
                content: defaultStructures[prototype.key.type] ? { ...defaultStructures }[prototype.key.type] : { ...defaultStructures['default'] }
            }

            this.value = {
                content: defaultStructures[prototype.key.type] ? { ...defaultStructures }[prototype.key.type] : { ...defaultStructures['default'] }
            }
        }


        this.display_label = payload?.display_label;
        this.prototype = prototype;


    }

    renderKeyOrValueContentToHtml(type, value, language) {

        if (Array.isArray(value[language])) {
            return value[language].map(it => this.renderKeyOrValueContentToHtml(type, it, language)).join(" <span role='separator'>•</span> ");
        }

        let innerHTML;

        switch (type) {
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
            default:
                innerHTML = value[language] ? value[language] : value;
        }
        return innerHTML;
    }

    getKeyVnode(language) {

        return h('dt', { class: "" }, [
            this.display_label ? h('span', { innerHTML: this.renderKeyOrValueContentToHtml('markdown', this.prototype.key.label, language), class: defaultProseClasses }) : null,
            h('span', { class: `${defaultProseClasses} prose-p:font-semibold prose-a:font-semibold`, innerHTML: this.renderKeyOrValueContentToHtml(this.prototype.key.type, this.key.content, language) })
        ]);
    }

    getValueVnode(language) {
        return h('dd', { class: "col-span-2" }, [
            this.display_label ? h('span', { innerHTML: this.renderKeyOrValueContentToHtml('markdown', this.prototype.value.label, language), class: defaultProseClasses }) : null,
            h('span', { class: defaultProseClasses, innerHTML: this.renderKeyOrValueContentToHtml(this.prototype.value.type, this.value.content, language) })
        ]);
    }

    getKvNode(language) {
        return h('div', { 'class': 'flex flex-col grid-cols-3 gap-.5 border-l-2 border-gray-200 dark:border-gray-800 pl-2 ' },
            [
                this.getKeyVnode(language),
                this.getValueVnode(language)
            ]);
    }


    toArray() {
        return {
            key: {
                content: this.key.content
            },
            value: {
                content: this.value.content
            }
        }
    }


}
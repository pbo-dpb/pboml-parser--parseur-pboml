
import { Cite } from '@citation-js/core'
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-csl";
import { data } from 'happy-dom/lib/PropertySymbol.js';
import { h } from "vue"


export default {
    props: ['annotation', 'language'],
    data() {
        return {
            _citation: null,
        }
    },
    render() {

        if (this._citation === null) {
            Cite.async(this.annotation.content[this.language]).then((reference) => {

                this._citation = reference.format('bibliography', {
                    format: 'html',
                    template: 'apa',
                    lang: `${this.language}-CA`
                })

            }, (error) => {
                console.error("Error parsing citation:", error);
                this._citation = false;
            });

            return h('div', {}, '');
        }


        return this._citation ? h('div', { innerHTML: this._citation }) : h('div', { class: "font-mono text-red-500", innerHTML: this.annotation.content[this.language] ? this.annotation.content[this.language] : this.annotation.content });

    },

}
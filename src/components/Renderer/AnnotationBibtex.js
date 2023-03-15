import Cite from "citation-js";
import { h } from "vue"


export default {
    props: ['annotation', 'language'],
    render() {

        let output;
        try {
            const reference = new Cite(this.annotation.content[this.language]);
            output = reference.format('bibliography', {
                format: 'html',
                template: 'apa',
                lang: `${this.language}-CA`
            })
            return h('div', { innerHTML: output });
        } catch (error) {

        }


        output = h('div', { class: "font-mono text-red-500" }, this.annotation.content[this.language]);

    }
}
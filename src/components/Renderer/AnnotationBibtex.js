import Cite from "citation-js";
import { h } from "vue"


export default {
    props: ['annotation', 'language'],
    render() {

        //let example = new Cite(this.annotation.content[this.language])
        let example = new Cite(this.annotation.content[this.language]);
        let output = example.format('bibliography', {
            format: 'html',
            template: 'apa',
            lang: `${this.language}-CA`
        })

        return h('div', { innerHTML: output })
    }
}
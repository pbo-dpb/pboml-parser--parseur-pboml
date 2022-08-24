import { h } from 'vue'
import Slice from "./Slice";
import { Remarkable } from 'remarkable';


export default class MarkdownSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.content = {
            en: payload.content?.en,
            fr: payload.content?.fr
        }
    }


    _buildVnodes(language) {
        let vnodes = super._buildVnodes();
        const md = new Remarkable();
        vnodes.push(h('div', { class: "prose dark:prose-invert max-w-none prose-headings:font-thin", innerHTML: md.render(this.content[language]) }));
        return vnodes;
    }

}
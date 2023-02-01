import { h, defineAsyncComponent } from 'vue'
import Slice from "./Slice";
import { Remarkable } from 'remarkable';


export default class MarkdownSlice extends Slice {
    constructor(payload) {
        super(payload);
        this.content = {
            en: payload.content?.en,
            fr: payload.content?.fr
        }
        this.type = "markdown"
    }

    renderReadonlyVnode(language) {
        const md = new Remarkable();

        md.renderer.rules.paragraph_open = (function () {
            var original = md.renderer.rules.paragraph_open;
            return function () {
                var paragraph = original.apply(this, arguments);
                if (paragraph === '<p>')
                    return paragraph.substring(0, paragraph.length - 1) + ' class="break-inside-avoid-page">';
                return paragraph
            };
        })();


        return h('div', { class: "pboml-prose", innerHTML: md.render(this.content[language]) });
    }


    _buildEditorInputVnodes() {
        let vnodes = super._buildEditorInputVnodes();
        vnodes.push(h(defineAsyncComponent(() => import('../../editors/MarkdownSliceEditor.js')), { slice: this, 'onUpdate:modelValue': (value) => { this.content = value } }))
        return vnodes;
    }

    toArray() {
        let array = super.toArray();
        array.content = {
            en: this.content?.en,
            fr: this.content?.fr
        }
        return array;
    }

}
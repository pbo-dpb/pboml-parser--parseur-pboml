import { Remarkable } from 'remarkable';

export default class MarkdownDriver {


    constructor() {
        const engine = new Remarkable();
        engine.block.ruler.disable(['footnote']);
        this.engine = engine;
        this.renderInline = false;
        this.breakNewLines = true;
    }


    shouldAvoidBreakingInsideParagraphs() {
        const md = this.engine;
        md.renderer.rules.paragraph_open = (function () {
            var original = md.renderer.rules.paragraph_open;
            return function () {
                var paragraph = original.apply(this, arguments);
                if (paragraph === '<p>')
                    return paragraph.substring(0, paragraph.length - 1) + ' class="break-inside-avoid-page">';
                return paragraph
            };
        })();
    }


    shouldRenderInline(val = true) {
        this.renderInline = val;
    }


    shouldBreakNewLines(val = true) {
        this.engine.set({
            breaks: val
        });
    }



    render(content) {
        return this.engine[this.renderInline ? 'renderInline' : 'render'](content);
    }


}
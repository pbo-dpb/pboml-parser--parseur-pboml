import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import Callbacks from './Callbacks';


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

    shouldConvertUrls() {
        this.engine.use(linkify)

    }



    render(content) {
        content = Callbacks.getBeforeMarkdownRendering ? Callbacks.getBeforeMarkdownRendering(content) : content;
        content = this.engine[this.renderInline ? 'renderInline' : 'render'](content);
        content = Callbacks.getAfterMarkdownRendering ? Callbacks.getAfterMarkdownRendering(content) : content;
        return content;
    }


}
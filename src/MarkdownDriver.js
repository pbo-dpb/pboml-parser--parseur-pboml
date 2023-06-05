import Callbacks from './Callbacks';
import { marked } from 'marked';
import markedLinkifyIt from "marked-linkify-it";
import DOMPurify from 'dompurify';
import markedKatex from "marked-katex-extension";


export default class MarkdownDriver {

    static parseGenericMarkdown(markdown) {
        return DOMPurify.sanitize(marked.parse(markdown));
    }

    constructor() {
        marked.use({
            async: false,
            pedantic: false,
            gfm: true,
            silent: true
        });

        marked.use(markedKatex({
            throwOnError: false,
            output: 'mathml'
        }));

    }



    shouldRenderInline(val = true) {
        this.renderInline = val;
    }


    shouldBreakNewLines(val = true) {
        console.info('`shouldBreakNewLines` is deprecated. Marked do not break by default.')

    }

    shouldConvertUrls() {
        marked.use(markedLinkifyIt({}, {}));
    }



    render(content) {

        content = Callbacks.getBeforeMarkdownRendering ? Callbacks.getBeforeMarkdownRendering(content) : content;


        if (this.renderInline) {
            content = marked.parseInline(content)
        } else {
            content = marked.parse(content);
        }
        content = DOMPurify.sanitize(content);
        content = Callbacks.getAfterMarkdownRendering ? Callbacks.getAfterMarkdownRendering(content) : content;

        return content;
    }


}
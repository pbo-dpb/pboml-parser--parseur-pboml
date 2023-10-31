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
            output: 'mathml',
            delimiters: { inline: '$$' }
        }));

    }



    shouldRenderInline(val = true) {
        this.renderInline = val;
    }


    shouldConvertUrls() {
        console.info(`shouldConvertUrls is deprecated.`);
        marked.use(markedLinkifyIt({}, {}));
    }

    /* Hackish method to prevent Firefox from rendering fiscal years on two lines with the dash character not being the hypenation character. */
    #addHyphenationPointsToFiscalYearOnlyContent(content) {
        const fiscalYearRegex = /\>([\d]{4})\-([\d]{2,4})\</gm;

        let m;
        while ((m = fiscalYearRegex.exec(content)) !== null) {

            if (m.index === fiscalYearRegex.lastIndex) {
                fiscalYearRegex.lastIndex++;
            }

            content = content.replaceAll(m[0], ` style="hyphenate-character: '';">${m[1]}&shy;-${m[2]}<`);

        }

        return content;
    }


    render(content) {

        if (!["string", "number"].includes(typeof content)) {
            content = "";
        }

        content = Callbacks.getBeforeMarkdownRendering ? Callbacks.getBeforeMarkdownRendering(content) : content;


        /*
        Special transformations
        */


        if (this.renderInline) {
            content = marked.parseInline(content)
        } else {
            content = marked.parse(content);
        }
        // Only run sanitize if not in test environment (DOMPurify is not available in test environment)
        if (process.env.NODE_ENV !== 'test')
            content = DOMPurify.sanitize(content);

        content = this.#addHyphenationPointsToFiscalYearOnlyContent(content);

        content = Callbacks.getAfterMarkdownRendering ? Callbacks.getAfterMarkdownRendering(content) : content;

        return content;
    }


}
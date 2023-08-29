import { h, defineAsyncComponent } from 'vue'
import MarkdownDriver from '../MarkdownDriver';
import rendererStrings from '../renderer-strings';

const defaults = {
    category: "note",
    content_type: 'markdown'
}

export default class Annotation {
    constructor(payload) {
        this.id = payload?.id
        this.category = payload.category ? payload.category : defaults.category;
        this.content_type = payload.content_type ? payload.content_type : defaults.content_type;

        this.content = {
            en: payload.content?.en,
            fr: payload.content?.fr
        };



        this.state = {
            ref_count: 0,
            prefix: null,
        }

    }

    get annotationAnchor() {
        return (this.state.prefix ? (this.state.prefix + '_') : "") + `antn_${this.id}`;
    }

    getReferenceAnchor(counter = 0) {
        return `ref_${this.annotationAnchor}_${counter}`;
    }

    getAnchorDomElement() {
        const sup = document.createElement("sup");
        const link = document.createElement("a");
        link.setAttribute('class', "pb__annotation-anchor no-underline print:no-underline print:text-gray-800 cursor-pointer text-blue-800 bg-blue-100 hover:bg-blue-200 dark:text-blue-100 dark:bg-blue-900 dark:hover:bg-blue-700 print:before:content-['['] print:after:content-[']'] rounded font-mono px-0.5 mx-0.5");
        link.setAttribute('href', `#${this.annotationAnchor}`);
        link.setAttribute('id', this.getReferenceAnchor(this.state.ref_count));
        link.setAttribute("role", "doc-noteref");
        link.setAttribute("aria-describedby", "pb__annotations-label");
        const textnode = document.createTextNode(this.id);
        link.appendChild(textnode)
        sup.appendChild(link);

        this.state.ref_count++;
        return sup;
    }

    toArray() {
        return {
            id: this.id,
            category: this.category,
            content_type: this.content_type,
            content: {
                en: this.content?.en,
                fr: this.content?.fr
            }
        }
    }


    renderMarkdown(language) {
        let markdownDriver = new MarkdownDriver();
        markdownDriver.shouldConvertUrls();
        return markdownDriver.render(this.content[language] ? this.content[language] : this.content)
    }


    renderContents(language) {
        switch (this.content_type) {
            case 'markdown':
                return [h('div', { innerHTML: this.renderMarkdown(language) })];
            case 'bibtex':
                return [h(defineAsyncComponent(() => import('../components/Renderer/AnnotationBibtex')), { annotation: this, language: language })]
        }
        return "";
    }


    renderAsVnode(language = document.documentElement.lang, highlight = false) {

        return [
            h('li', { class: `grid grid-cols-12 gap-4 print:flex print:gap-0 print:py-1 ${highlight ? 'border-r-4 bg-yellow-100 border-yellow-300 dark:bg-yellow-900 dark:border-yellow-700' : ''}` }, [
                h('div', { class: 'col-span-1 print:w-1/12 flex justify-end print:pr-4 gap-2 prose dark:prose-invert font-light tracking-wide proportional-nums text-gray-700 dark:text-gray-300' }, [
                    h('span', { class: 'print:hidden sr-only' }, `Note #${this.id}`),
                    h('span', { 'aria-hidden': true, }, `${this.id}.`),
                ]),
                h('div', { class: "col-span-11 print:w-11/12 flex flex-col gap-1" }, [
                    h('div', { 'class': 'pboml-non-reactive-prose prose-table:my-0 prose-p:inline break-inside-avoid', id: this.annotationAnchor }, [...this.renderContents(language)]),
                    highlight ? h('a', { href: `#${this.getReferenceAnchor()}`, class: "p-2 self-end text-yellow-600 hover:text-yellow-800 dark:text-yellow-100 hover:text-white", 'aria-label': rendererStrings[language].annotation_back_to_source }, [
                        h('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", 'stroke-width': "1.5", stroke: "currentColor", class: "w-4 h-4", 'aria-hidden': true }, [
                            h('path', { 'stroke-linecap': "round", 'stroke-linejoin': "round", d: "M9 9l6-6m0 0l6 6m-6-6v12a6 6 0 01-12 0v-3" })
                        ])
                    ]) : null,
                ])
            ])

        ]
    }


}
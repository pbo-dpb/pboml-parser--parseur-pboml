import { h, defineAsyncComponent } from 'vue'
import MarkdownDriver from '../MarkdownDriver';

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

    getAnchorDomElement() {
        const sup = document.createElement("sup");
        const link = document.createElement("a");
        //link.setAttribute('class', "no-underline print:no-underline print:text-gray-800 hover:underline bg-blue-100 print:before:content-['['] print:after:content-[']'] rounded font-mono px-0.5 mx-0.5");
        // At this time the anchor is non-interactive so we won't use blue.
        link.setAttribute('class', "no-underline print:no-underline cursor-text text-gray-800 bg-gray-100 print:before:content-['['] print:after:content-[']'] rounded font-mono px-0.5 mx-0.5");
        link.setAttribute('href', `#${this.annotationAnchor}`);
        link.setAttribute('id', `ref_${this.annotationAnchor}_${this.state.ref_count}`);
        link.setAttribute("role", "doc-noteref");
        link.setAttribute("aria-describedby", "annotations-label");
        link.innerText = this.id;
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
        markdownDriver.shouldRenderInline();
        markdownDriver.shouldConvertUrls();
        return markdownDriver.render(this.content[language] ? this.content[language] : this.content)
    }


    renderContent(language) {
        switch (this.content_type) {
            case 'markdown':
                return this.renderMarkdown(language);
        }
        return ""
    }


    renderAsVnode(language = document.documentElement.lang) {

        return [
            h('div', { class: 'flex flex-row gap-2' }, [
                h('dt', { class: 'w-8 shrink-0 prose dark:prose-invert' }, [
                    h('span', { class: 'print:hidden sr-only' }, `Note #${this.id}`),
                    h('span', { 'aria-hidden': true, }, `${this.id}.`),
                ]),
                h('dd', { 'class': 'col-span-11 prose dark:prose-invert max-w-none prose-a:font-normal prose-p:inline break-inside-avoid', innerHTML: this.renderContent(language), id: `${this.annotationAnchor}` })
            ])

        ]
    }


    renderEditingVnode(language = document.documentElement.lang) {


        return h('fieldset', { class: `border-2 border-slate-300 p-4 flex flex-col gap-4 rounded` }, [

            h(defineAsyncComponent(() => import('../editors/AnnotationEditor.js')), { annotation: this }),

        ])

    }

}
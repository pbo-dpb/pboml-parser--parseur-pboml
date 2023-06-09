import { h, defineAsyncComponent } from 'vue'
import Details from '../../components/Details.js';
import ChoiceRenderer from '../../components/Editor/Inputs/ChoiceRenderer.js';
import rendererStrings from '../../renderer-strings.js';
import MarkdownDriver from '../../MarkdownDriver.js';

export default class SliceHtmlRenderer {
    constructor(slice) {
        this.slice = slice;
    }

    getLabelStringsSpanVnodesForLanguage(language) {
        let labelStrings = this.slice.labelStrings[language];
        return labelStrings.map((str, index) => h('span', { class: '[&:not(:last-child)]:after:content-["–"] after:mx-1 after:text-gray-500' + (labelStrings.length > 1 ? ` first:font-normal` : '') }, str))
    }

    _renderLabelTitleVnode(language, force = false) {
        if ((!this.slice.display_label && !force) || !this.slice.label?.[language]) return null;

        let labelNodeType = 'h2'
        let labelNodeClasses = ["font-thin break-after-avoid"]

        if (this.slice.presentation) {
            labelNodeType = 'header'
            labelNodeClasses.push("text-center text-xl")
        } else {
            labelNodeClasses.push('text-2xl')
        }

        if (this.slice.presentation === 'figure') {
            labelNodeType = "figcaption";
        }



        return h(labelNodeType, { class: labelNodeClasses.join(" ") },
            this.getLabelStringsSpanVnodesForLanguage(language)
        );
    }


    __renderMetaContentArrayVnodes(contentArray, language) {
        const md = new MarkdownDriver;
        let classes = [
            "prose-sm", "prose-p:my-0",
            "prose-td:border", "prose-td:border-gray-300", "dark:prose-td:border-gray-700", "prose-td:p-2",
            "prose-th:border", "prose-th:border-gray-300", "dark:prose-th:border-gray-700", "prose-th:font-semibold", "prose-th:p-2", "prose-th:text-left",
            "prose-table:table-fixed", "prose-table:w-full",
        ]
        return h('div', { class: classes, innerHTML: contentArray.map(src => md.render(src[language])).join("") })
    }

    renderMetaVnodes(label, content, collapsible = false) {


        if (collapsible) {
            return [
                h(Details, { label: label }, {
                    default: () => content,
                }

                )
            ]
        }

        return [
            h('dl', { class: 'flex flex-col grid-cols-3 gap-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2 ' }, [
                h('dt', { class: "text-sm font-semibold", innerHTML: label }),
                content,
            ]),

        ]
    }

    renderSourcesVnodes(language) {
        if (!this.slice.sources.length) return [];
        return this.renderMetaVnodes((this.slice.sources.length > 1 ? 'Sources' : 'Source'), this.__renderMetaContentArrayVnodes(this.slice.sources, language));
    }

    renderNotesVnodes(language) {
        if (!this.slice.notes.length) return [];
        return this.renderMetaVnodes(this.slice.notes.length > 1 ? 'Notes' : 'Note', this.__renderMetaContentArrayVnodes(this.slice.notes, language));
    }

    renderAltsVnodes(language) {
        if (!this.slice.alts.length) return [];
        return this.renderMetaVnodes(rendererStrings[language].alts_label, this.__renderMetaContentArrayVnodes(this.slice.alts, language), true);
    }

    _renderMetaVnodes(language) {
        const metasVnodes = [
            ...this.renderAltsVnodes(language),
            ...this.renderSourcesVnodes(language),
            ...this.renderNotesVnodes(language)
        ];

        return metasVnodes.filter(v => v).length ? h('div', { 'class': 'flex flex-col gap-2' }, metasVnodes) : []
    }


    _buildVnodes(language) {
        return [
            this._renderLabelTitleVnode(language),
            this.renderReadonlyVnode(language),
            this._renderMetaVnodes(language)
        ];
    }

    renderReadonlyVnode(language) {
        return [

        ]
    }

    _buildEditorInputVnodes() {
        return [];
    }

    _buildEditorChoicesInputVnode() {
        return [new ChoiceRenderer(this).renderAsVnode()]
    }


    __buildEditorsVnode() {

        return [

            h('div', { class: 'mb-4 empty:hidden' }, [h(defineAsyncComponent(() => import("../../components/Editor/SlicePresentationEditor.js")), {
                'presentation': this.presentation,
                'isEditing': this.state.isEditingMeta,
                'onUpdate:modelValue': (value) => {
                    this.presentation = value;
                }
            })]),

            h('div', { class: 'mb-4 empty:hidden' }, [h(defineAsyncComponent(() => import('../../components/Editor/SliceReferenceEditor.js')), {
                'referenced_as': this.referenced_as,
                'isEditing': this.state.isEditingMeta,
                'onUpdate:modelValue': (value) => {
                    this.referenced_as.en = value.en;
                    this.referenced_as.fr = value.fr;
                }
            })]),


            h('div', { class: 'mb-4 empty:hidden' }, [h(defineAsyncComponent(() => import('../../components/Editor/SliceLabelEditor.js')), {
                'label': this.label,
                'isEditing': this.state.isEditingMeta,
                'onUpdate:modelValue': (value) => {
                    this.label.en = value.en;
                    this.label.fr = value.fr
                }
            })]),

            ...(this.choices ? this._buildEditorChoicesInputVnode() : this._buildEditorInputVnodes()),

            h('div', { class: 'mt-4' }, [h(defineAsyncComponent(() => import('../../editors/SliceMetasEditor.js')), {
                slice: this
            })]),
        ];
    }

    renderAsVnode(language = document.documentElement.lang) {
        let classes = ["flex flex-col gap-4 print:mt-4 @container/slice"];
        classes.push(this.print_only ? 'hidden print:flex' : 'flex')
        classes.push(this.presentation === "figure" ? "bg-gradient-to-tr from-transparent to-zinc-100 dark:to-zinc-800 rounded-tr-3xl p-4 break-inside-avoid-page pb__figure" : "");
        classes.push(this.presentation === "aside" ? "bg-gradient-to-tr from-sky-50 to-sky-100 dark:from-transparent dark:to-sky-900 rounded-tr-3xl p-4 break-inside-avoid-page  pb__aside" : "");

        let elType = 'section';
        if (this.presentation === 'figure') elType = 'figure';
        else if (this.presentation === 'aside') elType = 'aside';

        return h(elType, { class: classes.join(" "), id: this.anchor }, this._buildVnodes(language));
    }

    renderEditingVnode(language = document.documentElement.lang) {
        return h(defineAsyncComponent(() => import('../../editors/SliceEditor.js')), { slice: this, language: language, id: this.anchor });

    }

}
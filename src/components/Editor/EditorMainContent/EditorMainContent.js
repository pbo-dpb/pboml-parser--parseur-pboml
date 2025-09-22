import { defineAsyncComponent } from 'vue'
import PBOMLDocument from "../../../models/PBOMLDocument.js";
import { h } from 'vue'
import Tab from "../Tabs/Tab.vue";
import strings from "../../../editor-strings.js"
import { TableOfContents } from 'lucide-vue-next'
import TinyButton from '../TinyButton.vue';


export default {
    props: {
        pbomlDocument: PBOMLDocument,
    },

    data() {
        return {
            'currentTab': 'slices',
            strings: strings[document.documentElement.lang],
            shouldDisplayTableOfContents: false,
        }
    },

    components: {
        Tab,
    },

    render() {
        return h('main', { class: "flex flex-col gap-4" }, [


            h('div', { class: "flex flex-row justify-between gap-4 items-center" }, [h('div', {
                role: 'tablist', class: 'flex flex-row gap-4 mb-4 border-b border-gray-300'
            }, {
                default: () => [
                    h(Tab, { size: "md", selected: this.currentTab === 'slices', onClick: () => { this.currentTab = 'slices' } }, { default: () => this.strings.slices_section_title }),
                    h(Tab, { size: "md", selected: this.currentTab === 'annotations', onClick: () => { this.currentTab = 'annotations' } }, { default: () => this.strings.annotations_section_title }),
                    h('span', { class: 'self-center text-gray-400 select-none text-xl' }, '•'),
                    h(Tab, { size: "md", selected: this.currentTab === 'structure', onClick: () => { this.currentTab = 'structure' } }, { default: () => this.strings.structure_section_title }),
                ]
            }),

            h('div', { class: 'flex flex-row gap-2' }, [
                h(TinyButton, { toggled: this.shouldDisplayTableOfContents }, () => [
                    h(TableOfContents, { class: 'size-4', onClick: () => { this.shouldDisplayTableOfContents = !this.shouldDisplayTableOfContents }, title: this.strings.toc_toggle }),
                    h('span', { class: 'sr-only' }, this.strings.toc_toggle)
                ])
            ])
            ]),

            h('div', { class: `grid gap-4 ${this.shouldDisplayTableOfContents ? 'grid-cols-5' : 'grid-cols-4'}` }, [

                h('div', { class: "col-span-4" }, [
                    this.currentTab === 'annotations' ? h(defineAsyncComponent(() => import('../AnnotationsEditor/AnnotationsEditor.js')), { pbomlDocument: this.pbomlDocument }) : null,
                    this.currentTab === 'structure' ? h(defineAsyncComponent(() => import('../StructureEditor/StructureEditor.js')), { pbomlDocument: this.pbomlDocument }) : null,
                    this.currentTab === 'slices' ? h(defineAsyncComponent(() => import('./EditorSlices.js')), { pbomlDocument: this.pbomlDocument }) : null,
                ]),
                this.shouldDisplayTableOfContents ? h(defineAsyncComponent(() => import('../../Toc/Toc.js')), { 'pboml-document': this.pbomlDocument }) : null,
            ])
        ]);
    }
}
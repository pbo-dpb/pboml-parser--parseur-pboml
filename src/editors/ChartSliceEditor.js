import { h } from 'vue'

import strings from "../editor-strings"
import MarkdownDriver from '../MarkdownDriver'
import DataTableEditor from "../components/Editor/DataTableEditor/DataTableEditor.js"

export default {
    props: ['slice'],
    emits: ['update:datatable'],
    data() {
        return {
            updating: false
        }
    },
    watch: {
        slice: {
            deep: true,
            handler(nVal, oVal) {

                // Save preview node height and use it to set the height of the placeholder so things don't move too much around
                this.updating = this.$refs.previewNode?.offsetHeight ?? 0;
                this.$nextTick(() => {
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.updating = false;
                        }, "100")

                    })
                })

            }
        }
    },
    methods: {
        buildPreviewNode() {
            return this.updating ?
                h('div', { style: `height:${this.updating}px`, ref: 'placeHolderNode' }) :
                h('div', { class: "grid grid-cols-2 gap-4", ref: 'previewNode' }, [
                    this.slice.renderAsVnode("en"),
                    this.slice.renderAsVnode("fr"),
                ])
        }
    },
    render() {

        let previewNode = this.buildPreviewNode();

        if (this.slice.readonly || !this.slice.datatable) {
            const md = new MarkdownDriver;
            md.shouldBreakNewLines(false);
            md.shouldRenderInline(true);
            return () => h('div', {}, [
                h('div', { class: 'font-bold', innerHTML: md.render(strings[document.documentElement.lang].readonly_slice) }),
                previewNode
            ])
        }


        return h('div', {
            class: 'flex flex-col gap-4'
        }, [
            previewNode,
            this.slice.datatable ? h(DataTableEditor, { showChartProperties: true, datatable: this.slice.datatable, "onUpdate:datatable": (d) => this.$emit('update:datatable', d) }) : null
        ])

    }
}

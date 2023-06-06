import { h } from 'vue'

import BilingualInput from "../components/Editor/Inputs/BilingualInput.vue"
import NumberInput from "../components/Editor/Inputs/NumberInput.vue"
import strings from "../editor-strings"
import MarkdownDriver from '../MarkdownDriver'
import DataTableEditor from "../components/Editor/DataTableEditor/DataTableEditor.js"
import DataTable from '../models/contents/DataTable/DataTable'

export default {
    props: ['slice'],
    emits: ['update:datatable'],
    setup(props, { emit }) {

        if (props.slice.readonly) {
            const md = new MarkdownDriver;
            md.shouldBreakNewLines(false);
            md.shouldRenderInline(true);
            return () => h('div', { class: 'grid grid-cols-2 gap-4' }, [
                h('div', { class: 'col-span-2 font-bold', innerHTML: md.render(strings[document.documentElement.lang].readonly_slice) }),
                props.slice.constructor.rendererForSliceRendererType(props.slice, 'html').renderAsVnode("en"),
                props.slice.constructor.rendererForSliceRendererType(props.slice, 'html').renderAsVnode("fr"),
            ])
        }


        return () => [
            h(DataTableEditor, { datatable: props.slice.datatable, "onUpdate:datatable": (d) => emit('update:datatable', d) })
        ]



    }
}

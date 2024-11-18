import { h } from 'vue'

import DataTableVisualEditor from './DataTableVisualEditor';
import DataTableVariablesEditor from './DataTableVariablesEditor.vue';
import DataTableImporter from './DataTableImporter';
import DataTableDisplayEditor from './DataTableDisplayEditor.vue';
import Tab from "../Tabs/Tab.vue"
import editorStrings from '../../../editor-strings';
import DataTable from '../../../models/contents/DataTable/DataTable';
import { ArrowDownOnSquareIcon, TableCellsIcon, VariableIcon, PaintBrushIcon } from '@heroicons/vue/16/solid';

export default {
    props: {
        datatable: { type: DataTable, required: true },
        showChartProperties: { type: Boolean, default: false }
    },
    emits: ['update:datatable'],
    data() {
        return {
            currentTab: 'visual',
            language: document.documentElement.lang
        }
    },
    render() {

        let editorId = (Math.random() + 1).toString(36).substring(5);
        const visualEditorId = `data_table_editor_${editorId}`;
        const variablesEditorId = `variables_editor_${editorId}`;
        const displayEditorId = `display_editor_${editorId}`;
        const importerId = `importer_${editorId}`;
        return h('div', { class: 'flex flex-col gap-4' }, [

            h('div', { class: 'flex flex-row gap-4 items-center' }, [
                h(Tab, {
                    size: 'md',
                    controls: visualEditorId,
                    selected: this.currentTab === 'visual',
                    'onClick': () => this.currentTab = 'visual'
                }, {
                    default: () => [h(TableCellsIcon, { class: 'size-4' }, () => []), editorStrings[this.language].data_table_visual_editor]
                }),
                h(Tab, {
                    size: 'md',
                    controls: variablesEditorId,
                    selected: this.currentTab === 'variables',
                    'onClick': () => this.currentTab = 'variables'
                }, {
                    default: () => [h(VariableIcon, { class: 'size-4' }, () => []), editorStrings[this.language].data_table_variables_editor]
                }),

                h(Tab, {
                    size: 'md',
                    controls: displayEditorId,
                    selected: this.currentTab === 'display',
                    'onClick': () => this.currentTab = 'display'
                }, {
                    default: () => [h(PaintBrushIcon, { class: 'size-4' }, () => []), editorStrings[this.language].data_table_display_editor]
                }),

                h(Tab, {
                    size: 'md',
                    controls: importerId,
                    selected: this.currentTab === 'importer',
                    'onClick': () => this.currentTab = 'importer',
                    class: 'ml-auto'
                }, {
                    default: () => [h(ArrowDownOnSquareIcon, { class: 'size-4' }, () => []), editorStrings[this.language].data_table_importer]
                }),
            ]),
            this.currentTab === 'visual' ? h(DataTableVisualEditor, { datatable: this.datatable, id: visualEditorId, showChartProperties: this.showChartProperties }) : null,
            this.currentTab === 'variables' ? h(DataTableVariablesEditor, { datatable: this.datatable, id: variablesEditorId, showChartProperties: this.showChartProperties }) : null,
            this.currentTab === 'display' ? h(DataTableDisplayEditor, {
                datatable: this.datatable, id: displayEditorId
            }) : null,
            this.currentTab === 'importer' ? h(DataTableImporter, {
                datatable: this.datatable, id: importerId, 'onImport': (d) => {
                    this.$emit('update:datatable', (d))
                    this.currentTab = 'visual'
                }
            }) : null,
        ])



    }
}

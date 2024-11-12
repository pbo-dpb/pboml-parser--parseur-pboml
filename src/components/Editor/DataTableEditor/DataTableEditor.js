import { h } from 'vue'

import DataTableVisualEditor from './DataTableVisualEditor';
import DataTableVariablesEditor from './DataTableVariablesEditor.vue';
import DataTableImporter from './DataTableImporter';

import Tab from "../Tabs/Tab.vue"
import { ArrowDownOnSquareIcon, TableCellsIcon, VariableIcon } from '@heroicons/vue/24/solid'
import editorStrings from '../../../editor-strings';
import DataTable from '../../../models/contents/DataTable/DataTable';

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
        const importerId = `importer_${editorId}`;
        return h('div', { class: 'flex flex-col gap-4' }, [

            h('div', { class: 'flex flex-row gap-4 items-center' }, [
                h(Tab, {
                    controls: visualEditorId,
                    selected: this.currentTab === 'visual',
                    'onClick': () => this.currentTab = 'visual'
                }, {
                    default: () => [h(TableCellsIcon, { class: 'h-6 w-6' }, () => []), editorStrings[this.language].data_table_visual_editor]
                }),
                h(Tab, {
                    controls: variablesEditorId,
                    selected: this.currentTab === 'variables',
                    'onClick': () => this.currentTab = 'variables'
                }, {
                    default: () => [h(VariableIcon, { class: 'h-6 w-6' }, () => []), editorStrings[this.language].data_table_variables_editor]
                }),

                h(Tab, {
                    controls: importerId,
                    selected: this.currentTab === 'importer',
                    'onClick': () => this.currentTab = 'importer',
                    class: 'ml-auto'
                }, {
                    default: () => [h(ArrowDownOnSquareIcon, { class: 'h-6 w-6' }, () => []), editorStrings[this.language].data_table_importer]
                }),
            ]),
            this.currentTab === 'visual' ? h(DataTableVisualEditor, { datatable: this.datatable, id: visualEditorId, showChartProperties: this.showChartProperties }) : null,
            this.currentTab === 'variables' ? h(DataTableVariablesEditor, { datatable: this.datatable, id: variablesEditorId, showChartProperties: this.showChartProperties }) : null,
            this.currentTab === 'importer' ? h(DataTableImporter, {
                datatable: this.datatable, id: importerId, 'onImport': (d) => {
                    this.$emit('update:datatable', (d))
                    this.currentTab = 'visual'
                }
            }) : null,
        ])



    }
}

import { h } from 'vue'

import DataTableVisualEditor from './DataTableVisualEditor';
import DataTableVariablesEditor from './DataTableVariablesEditor';

import Tab from "../Tabs/Tab.vue"
import { TableCellsIcon, VariableIcon } from '@heroicons/vue/24/solid'
import editorStrings from '../../../editor-strings';

export default {
    props: ['datatable'],
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
        return h('div', { class: 'flex flex-col gap-4' }, [

            h('div', { class: 'flex flex-row gap-4 items-center' }, [
                h(Tab, {
                    controls: visualEditorId,
                    selected: this.currentTab === 'visual',
                    'onClick': () => this.currentTab = 'visual'
                }, {
                    default: () => [h(TableCellsIcon, { class: 'h-6 w-6' }), editorStrings[this.language].data_table_visual_editor]
                }),
                h(Tab, {
                    controls: variablesEditorId,
                    selected: this.currentTab === 'variables',
                    'onClick': () => this.currentTab = 'variables'
                }, {
                    default: () => [h(VariableIcon, { class: 'h-6 w-6' }), editorStrings[this.language].data_table_variables_editor]
                })
            ]),
            this.currentTab === 'visual' ? h(DataTableVisualEditor, { datatable: this.datatable, id: visualEditorId }) : null,
            this.currentTab === 'variables' ? h(DataTableVariablesEditor, { datatable: this.datatable, id: variablesEditorId }) : null
        ])



    }
}

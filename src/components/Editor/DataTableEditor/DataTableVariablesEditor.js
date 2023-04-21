import { h } from 'vue'
import DataTableVariableEditor from "./DataTableVariableEditor.js"
import Button from "../Button.vue"
import editorStrings from '../../../editor-strings.js'
import { PlusIcon } from '@heroicons/vue/24/solid'
import DataTableVariable from '../../../models/contents/DataTable/DataTableVariable.js'
import DataTableEntry from '../../../models/contents/DataTable/DataTableEntry.js'
export default {
    props: ['datatable'],
    methods: {
        addVariable(userVariableKey) {
            let key = (userVariableKey ? userVariableKey : '').toLowerCase().replace(/[^_a-z0-9]+/g, "")
            if (!key) return;

            // Avoid collisions with DataTableEntry formatting properties (eg. emphasize) or existing keys by appending a random string at the end
            while (Object.keys(DataTableEntry.defaults).includes(key) || this.datatable.variables[key]) {
                key += (Math.random() + 1).toString(36).substring(8);
            }

            let prefilledVariable;
            if (!this.datatable.variables || !Object.keys(this.datatable.variables).length) {
                prefilledVariable = { label: { en: userVariableKey, fr: userVariableKey }, type: 'markdown', is_descriptive: true }
            } else {
                prefilledVariable = { label: { en: userVariableKey, fr: userVariableKey }, type: 'number' }
            }
            this.datatable.variables[key] = new DataTableVariable(prefilledVariable);
        }
    },
    render() {

        const strings = editorStrings[document.documentElement.lang];

        let rows = [];
        Object.entries(this.datatable.variables).forEach((entry) => {
            const [key, variable] = entry;
            rows.push(h(DataTableVariableEditor, {
                variable: variable,
                variableKey: key,
                onDelete: () => this.datatable.deleteVariableWithKey(key)
            }))
        })

        return h('div', { class: 'flex flex-col gap-4' }, [
            ...rows,
            h(Button, {
                onClick: (e) => {
                    this.addVariable(window.prompt(strings.data_table_variables_editor_var_new_key));
                },
            }, () => [
                h(PlusIcon, { 'class': 'h-4 w-4' }, () => []),
                h('span', strings.data_table_variables_editor_var_new)
            ]),
        ]);
    }
}
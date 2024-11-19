<template>

    <div class="grid grid-cols-7 divide-x divide-gray-300 border border-gray-300">

        <div class="col-span-2 flex flex-col divide-y divide-gray-300">
            <div role="button" v-for="(variable, key) in datatable.variables" class="p-2 text-left "
                @click="currentVariableKey = key" :class="{
                    'bg-white cursor-pointer text-gray-700 hover:text-gray-800': key !== currentVariableKey,
                    'bg-purple-100 cursor-default': key === currentVariableKey
                }">
                <DataTableVariablesEditorVariablePreview :variable="variable" />
            </div>
            <button class="flex flex-row gap-2 p-2 text-blue-700 hover:text-blue-800 font-semibold items-center text-sm"
                @click="handleNew">
                <PlusIcon class="size-4" aria-hidden></PlusIcon> {{
                    editorStrings.data_table_variables_editor_var_new }}
            </button>
        </div>
        <div class="col-span-5 p-4">
            <DataTableVariableEditor v-if="currentVariableKey" :variable-key="currentVariableKey"
                :variable="datatable.variables[currentVariableKey]" @delete="handleDelete(currentVariableKey)" />
        </div>


    </div>

</template>
<script>
import DataTableVariableEditor from "./DataTableVariableEditor.js"
import Button from "../Button.vue"
import editorStrings from '../../../editor-strings.js'
import DataTableVariablesEditorVariablePreview from "./DataTableVariablesEditorVariablePreview.vue"
import DataTableVariable from '../../../models/contents/DataTable/DataTableVariable.js'
import { PlusIcon } from "@heroicons/vue/16/solid"

export default {
    props: ['datatable', 'showChartProperties'],
    data: function () {
        return {
            currentVariableKey: null,
            editorStrings: editorStrings[document.documentElement.lang]
        }
    },
    components: { DataTableVariableEditor, Button, PlusIcon, DataTableVariablesEditorVariablePreview },
    methods: {
        addVariable(userVariableKey) {
            if (!userVariableKey) return;
            let key = DataTableVariable.generateUniqueDataTableVariableId(userVariableKey, this.datatable.variables)

            let prefilledVariable;
            if (!this.datatable.variables || !Object.keys(this.datatable.variables).length) {
                prefilledVariable = { label: { en: userVariableKey, fr: userVariableKey }, type: 'markdown', is_descriptive: true }
            } else {
                prefilledVariable = { label: { en: userVariableKey, fr: userVariableKey }, type: 'number' }
            }
            this.datatable.variables[key] = new DataTableVariable(prefilledVariable, key);
            this.currentVariableKey = key;
        },
        handleDelete(key) {
            this.currentVariableKey = null;
            this.datatable.deleteVariableWithKey(key)
        },
        handleNew() {
            this.addVariable(window.prompt(this.editorStrings.data_table_variables_editor_var_new_key));
        }
    },
    mounted() {
        if (this.datatable.variables && Object.keys(this.datatable.variables).length) {
            this.currentVariableKey = Object.keys(this.datatable.variables)[0]
        }
    }

}
</script>
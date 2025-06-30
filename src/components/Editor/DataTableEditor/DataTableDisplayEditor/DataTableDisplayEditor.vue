<template>
    <div class="grid grid-cols-7 divide-x divide-gray-300 border border-gray-300">

        <div class="col-span-2 flex flex-col divide-y divide-gray-300">
            <div role="button" v-for="tab in availableTabs" class="p-2 text-left font-semibold"
                @click="selectedTab = tab.key" :class="{
                    'bg-white cursor-pointer text-gray-700 hover:text-blue-800 hover:bg-blue-50 hover:last:shadow-sm': tab.key !== selectedTab,
                    'bg-purple-100 cursor-default': tab.key === selectedTab
                }">
                <span>{{ tab.label }}</span>
            </div>

        </div>
        <div class="col-span-5 p-4">
            <DataTableDisplayEditorGeneral v-if="selectedTab == 'general'" :datatable="datatable" />
            <DataTableDisplayEditorVariables v-if="selectedTab == 'variables'" :datatable="datatable" />
            <DataTableDisplayEditorData v-if="selectedTab == 'data'" :datatable="datatable" />
        </div>


    </div>


</template>
<script setup>
import { ref, computed } from 'vue';
import DataTableDisplayEditorGeneral from './DataTableDisplayEditorGeneral.vue';
import DataTable from '../../../../models/contents/DataTable/DataTable';
import editorStrings from '../../../../editor-strings';
import DataTableDisplayEditorData from './DataTableDisplayEditorData.vue';
import DataTableDisplayEditorVariables from "./Variables/DataTableDisplayEditorVariables.vue";

const props = defineProps({
    datatable: DataTable,
});

const strings = ref(editorStrings[document.documentElement.lang]);

const selectedTab = ref('general');

const availableTabs = computed(() => {
    return [
        { key: 'general', label: strings.value.data_table_display_editor_general_tab },
        { key: 'variables', label: strings.value.data_table_display_editor_variables_tab },
        { key: 'data', label: strings.value.data_table_display_editor_data_tab }
    ]
});

</script>
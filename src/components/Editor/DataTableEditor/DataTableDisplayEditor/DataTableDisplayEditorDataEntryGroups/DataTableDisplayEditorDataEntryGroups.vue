<template>

    <fieldset class="rounded-sm border border-slate-300 p-4 flex flex-col gap-4">
        <legend class="font-semibold">{{ strings.data_table_display_editor_data_entry_groups_label }}</legend>
        <DataTableDisplayEditorDataEntryGroupsGroup v-for="group in datatable.entrygroups" :group :datatable
            @delete="deleteGroup(group)" />
        <span v-if="!datatable.entrygroups.length"
            class="bg-yellow-50 p-4 w-full text-yellow-700 text-sm font-semibold">{{
                strings.data_table_display_editor_data_entry_groups_empty
            }}</span>

        <TinyButton class="flex flex-row gap-2 p-2 text-blue-700 hover:text-blue-800 font-semibold items-center text-sm"
            @click="createNewGroup">
            <PlusIcon class="size-4" aria-hidden></PlusIcon> {{
                strings.data_table_display_editor_data_entry_groups_new }}
        </TinyButton>


    </fieldset>


</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import DataTable from '../../../../../models/contents/DataTable/DataTable';
import editorStrings from '../../../../../editor-strings';
import DataTableDisplayEditorDataEntryGroupsGroup from './DataTableDisplayEditorDataEntryGroupsGroup.vue';
import TinyButton from '../../../TinyButton.vue';
import DataTableEntryGroup from '../../../../../models/contents/DataTable/DataTableEntryGroup.js';
import { PlusIcon } from '@heroicons/vue/16/solid';

const props = defineProps({
    datatable: DataTable,
});

const strings = ref(editorStrings[document.documentElement.lang]);

const createNewGroup = () => {
    props.datatable.entrygroups.push(new DataTableEntryGroup());
}

const deleteGroup = (group) => {
    const index = props.datatable.entrygroups.indexOf(group);
    if (index > -1) {
        props.datatable.entrygroups.splice(index, 1);
    }
}

</script>
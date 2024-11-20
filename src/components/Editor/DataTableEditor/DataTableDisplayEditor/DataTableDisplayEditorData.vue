<template>
    <div class="flex flex-col gap-4">

        <DataTableDisplayEditorDataEntryGroups :datatable />


    </div>


</template>
<script setup>
import DataTable from '../../../../models/contents/DataTable/DataTable';
import DataTableDisplayEditorDataEntryGroups from './DataTableDisplayEditorDataEntryGroups/DataTableDisplayEditorDataEntryGroups.vue';

const props = defineProps({
    datatable: DataTable,
});

</script>
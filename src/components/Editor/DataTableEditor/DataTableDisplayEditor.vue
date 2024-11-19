<template>
    <div class="flex flex-col">
        <RadioInput :choices="presentationStyleChoices" :label="strings.data_table_presentation_type"
            v-model="datatable.presentation_style"></RadioInput>

    </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import RadioInput from '../Inputs/RadioInput.vue';
import DataTable from '../../../models/contents/DataTable/DataTable';
import editorStrings from '../../../editor-strings';
const props = defineProps({
    datatable: DataTable,
});

const strings = ref(editorStrings[document.documentElement.lang]);

const presentationStyleChoices = computed(() => {
    return {
        'accounting': strings.value.data_table_presentation_type_accounting,
        'prose': strings.value.data_table_presentation_type_prose
    }
});

</script>
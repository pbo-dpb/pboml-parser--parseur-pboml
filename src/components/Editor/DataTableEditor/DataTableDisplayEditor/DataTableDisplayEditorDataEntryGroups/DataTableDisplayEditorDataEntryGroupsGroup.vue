<template>
    <div class="flex flex-col gap-4 bg-slate-100 rounded-sm p-4">
        <div class="flex flex-row justify-between gap-1 border-b border-slate-300 pb-4 items-center">
            <span class="font-semibold">{{ spanDisplay }}</span>
            <TinyButton @click="emit('delete', group)" :danger="true">
                <TrashIcon class="size-4"></TrashIcon>
                <span class="sr-only">{{ strings.delete_button_label }}</span>
            </TinyButton>
        </div>

        <BilingualInput v-model="group.label" :label="strings.data_table_display_editor_data_entry_group_label">
        </BilingualInput>

        <NumberInput v-model="group.span" :label="strings.data_table_display_editor_data_entry_group_span" />

        <div class="bg-cyan-50 p-4 w-full" v-if="encompasses">
            <table class="w-full">
                <tbody>
                    <tr>
                        <td v-for="entry in encompasses" :width="`${100 / totalNumberOfEntries}%`"
                            class=" text-xs text-center p-2" :class="{
                                'font-semibold border-t-4 border-t-cyan-800': entry.isInRange,
                                'border-t-4 border-t-gray-300': !entry.isInRange
                            }">
                            {{ entry.label }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="bg-yellow-50 p-4 w-full text-yellow-700" v-if="groupExceedsDataTableContentSpan">
            {{ strings.data_table_display_editor_data_entry_group_exceeds_content_span }}
        </div>

    </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import { TrashIcon } from '@heroicons/vue/16/solid';
import editorStrings from '../../../../../editor-strings.js';
import DataTableEntryGroup from '../../../../../models/contents/DataTable/DataTableEntryGroup.js';
import TinyButton from '../../../TinyButton.vue';
import BilingualInput from '../../../Inputs/BilingualInput.vue';
import DataTable from '../../../../../models/contents/DataTable/DataTable.js';
import NumberInput from '../../../Inputs/NumberInput.vue';

const strings = ref(editorStrings[document.documentElement.lang]);


const props = defineProps({
    group: DataTableEntryGroup,
    datatable: DataTable,
});

const emit = defineEmits(['delete']);

const groupRange = computed(() => {
    let previousGroupsSpan = 1;


    for (const grp of props.datatable.entrygroups) {
        if (grp === props.group) {
            break;
        }
        previousGroupsSpan += grp.span;
    }
    return [previousGroupsSpan, previousGroupsSpan - 1 + props.group.span];
});

const spanDisplay = computed(() => {
    return `[${groupRange.value[0]}, ${groupRange.value[1]}] (/ ${totalNumberOfEntries.value})`;
});

const totalNumberOfEntries = computed(() => {
    return props.datatable.content.length;
});


const groupExceedsDataTableContentSpan = computed(() => {
    return groupRange.value[1] > totalNumberOfEntries.value;
});


const encompasses = computed(() => {

    const datatable = props.datatable;


    if (!datatable.variables || !datatable.content || datatable.variables.length === 0 || datatable.content.length === 0) {
        return null;
    }

    const descriptiveVariable = Object.values(datatable.variables).find(v => v.is_descriptive);

    if (!descriptiveVariable) {
        return null;
    }

    return datatable.content.map((entry, index) => {
        let entryForVariable = entry[descriptiveVariable.key];
        if (!entryForVariable) {
            entryForVariable = "--"
        }

        return {
            label: entryForVariable?.[document.documentElement.lang] ?? entryForVariable,
            isInRange: (index + 1) >= groupRange.value[0] && (index + 1) <= groupRange.value[1]
        }
    })


});

</script>
<template>
    <div class="flex flex-col">
        <DisplayEditorVariable v-for="(variable, index) in variablesArray" :key="variable.key" :variable :index
            :draggedSliceIndex="indexOfCurrentlyDraggedVar" @dragStart="handleDragStart" @dragEnd="handleDragEnd"
            @drop.prevent="handleDrop" />
    </div>


</template>
<script setup>
import { ref, computed } from 'vue';
import DataTable from '../../../../../models/contents/DataTable/DataTable';
import editorStrings from '../../../../../editor-strings';
import DisplayEditorVariable from './DisplayEditorVariable.vue';

const props = defineProps({
    datatable: DataTable,
});

const currentlyDraggedVar = ref(null)

const strings = ref(editorStrings[document.documentElement.lang]);

const variablesArray = computed(() => {
    return Object.values(props.datatable.variables);
});


const indexOfCurrentlyDraggedVar = computed(() => {
    const index = variablesArray.value.indexOf(currentlyDraggedVar.value);
    return index >= 0 ? index : null;
});

const handleDragStart = (event, variable) => {
    currentlyDraggedVar.value = variable
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', variable);
};

const handleDragEnd = (event) => {
    currentlyDraggedVar.value = null;
}

const handleDrop = (event, receivingIndex, receivingVariable) => {
    event.preventDefault();
    if (!receivingVariable) return;
    if (currentlyDraggedVar.value !== null && indexOfCurrentlyDraggedVar.value !== receivingIndex) {
        let reorderedVariables = [...variablesArray.value];

        reorderedVariables.splice(indexOfCurrentlyDraggedVar.value, 1);
        reorderedVariables.splice(receivingIndex, 0, currentlyDraggedVar.value);

        let newVariableObject = {};

        reorderedVariables.forEach((variable, index) => {
            newVariableObject[variable.key] = variable;
        });

        props.datatable.variables = newVariableObject;
    }
}


</script>
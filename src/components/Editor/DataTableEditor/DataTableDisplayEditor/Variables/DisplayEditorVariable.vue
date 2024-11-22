<template>
    <li draggable="true"
        class="transition-all  border  border-gray-300 px-2 py-1 text-sm flex flex-row gap-2 group items-center"
        @dragstart="handleDragStart" @dragend="handleDragEnd" @dragover.prevent="handleDragover" :class="{
            'opacity-30': isDragging, ...draggedOverClasses,
            'cursor-pointer': !showEditor
        }" @dragenter="" @dragleave="isBeingDraggedOver = false" @drop.prevent="handleDrop" @dblclick="toggleEditor">
        <ArrowsUpDownIcon class="h-4 w-4 text-blue-200 group-hover:text-blue-800"></ArrowsUpDownIcon>
        <DataTableVariablesEditorVariablePreview :variable="variable" />
    </li>

</template>
<script>
import DataTableVariable from "../../../../../models/contents/DataTable/DataTableVariable";
import editorStrings from '../../../../../editor-strings';
import DataTableVariablesEditorVariablePreview from '../../DataTableVariablesEditorVariablePreview.vue';
import { ArrowsUpDownIcon, PencilIcon } from '@heroicons/vue/24/outline';

export default {
    components: { ArrowsUpDownIcon, PencilIcon, DataTableVariablesEditorVariablePreview },
    props: {
        variable: {
            type: DataTableVariable,
            required: true,
        },
        index: {
            type: Number,
            required: true,
        },
        draggedSliceIndex: {
            type: Number,
            required: false,
        }
    },
    data() {
        return {
            language: document.documentElement.lang,
            editorStrings: editorStrings[document.documentElement.lang],
            isDragging: false,
            isBeingDraggedOver: false,
            showEditor: false,
        };
    },
    methods: {
        handleDragStart(e) {
            this.isDragging = true;
            this.$emit('dragStart', e, this.variable);
        },
        resetDragCues() {
            this.isDragging = false;
            this.isBeingDraggedOver = false;
        },
        handleDragover(event) {
            event.preventDefault();
            this.isBeingDraggedOver = true;
        },
        toggleEditor() {
            this.showEditor = !this.showEditor;
        },
        handleDragEnd(e) {
            this.$emit('dragend', e);
            this.resetDragCues();
        },
        handleDrop(e) {
            this.$emit('drop', e, this.index, this.variable);
            this.resetDragCues();
        }
    },
    computed: {

        draggedOverClasses() {
            return {
                'border-b-4 border-b-blue-300': this.index > this.draggedSliceIndex && this.isBeingDraggedOver,
                'border-t-4 border-t-blue-300': this.index < this.draggedSliceIndex && this.isBeingDraggedOver,
            }
        }
    },
};
</script>

<template>
    <li draggable="true"
        class="transition-all cursor-pointer border  border-gray-300 px-2 py-1 text-sm font-semibold flex flex-row gap-2 group"
        @dragstart="handleDragStart" @dragend="resetDragCues" @dragover.prevent="handleDragover"
        :class="{ 'opacity-30': isDragging, ...draggedOverClasses }" @dragenter="" @dragleave="isBeingDraggedOver = false"
        @drop.prevent="resetDragCues">
        <ArrowsUpDownIcon class="h-4 w-4 text-blue-200 group-hover:text-blue-800"></ArrowsUpDownIcon>
        <div>{{
            localizedSliceType
        }}
        </div>
    </li>
</template>
<script>
import Slice from '../../../../models/contents/Slice';
import editorStrings from "../../../../editor-strings"
import { ArrowsUpDownIcon } from '@heroicons/vue/24/outline';

export default {
    components: { ArrowsUpDownIcon },
    props: {
        slice: {
            type: Slice,
            required: true,
        },
        index: {
            type: Number,
            required: true,
        },
        draggedSliceIndex: {
            type: Number,
            required: false,
        },
    },
    data() {
        return {
            editorStrings: editorStrings[document.documentElement.lang],
            isDragging: false,
            isBeingDraggedOver: false
        };
    },
    methods: {
        handleDragStart() {
            this.isDragging = true;
        },
        resetDragCues() {
            this.isDragging = false;
            this.isBeingDraggedOver = false;
        },
        handleDragover(event) {
            event.preventDefault();
            this.isBeingDraggedOver = true;
        },
    },
    computed: {
        localizedSliceType() {
            return this.editorStrings[`slice_type_${this.slice.type}`]
        },
        draggedOverClasses() {
            return {
                'bg-blue-100': this.isBeingDraggedOver,
                'border-b-4 border-b-blue-300': this.index > this.draggedSliceIndex && this.isBeingDraggedOver,
                'border-t-4 border-t-blue-300': this.index < this.draggedSliceIndex && this.isBeingDraggedOver,
            }
        }
    },
};
</script>
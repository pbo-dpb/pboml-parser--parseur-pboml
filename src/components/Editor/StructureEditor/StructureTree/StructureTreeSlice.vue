<template>
    <li draggable="true"
        class="transition-all cursor-pointer border  border-gray-300 px-2 py-1 text-sm flex flex-row gap-2 group"
        @dragstart="handleDragStart" @dragend="resetDragCues" @dragover.prevent="handleDragover" :class="{
            'opacity-30': isDragging, ...draggedOverClasses, ...levelIndentClasses,
            'bg-blue-50': this.slice.presentation === 'aside',
            'bg-slate-50': this.slice.presentation === 'figure'
        }" @dragenter="" @dragleave="isBeingDraggedOver = false" @drop.prevent="resetDragCues">
        <ArrowsUpDownIcon class="h-4 w-4 text-blue-200 group-hover:text-blue-800"></ArrowsUpDownIcon>
        <div class="flex">
            <div :title="localizedSliceType" class="font-semibold w-12">{{
                localizedSliceTypeAbbr
                }}</div>
            <div v-if="descriptor" :class="{ 'font-semibold': this.slice.type === 'heading' }">{{ descriptor }}</div>
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
        level: {
            type: Number,
            required: true,
        }
    },
    data() {
        return {
            language: document.documentElement.lang,
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
        localizedSliceTypeAbbr() {
            return this.editorStrings[`slice_type_abbrev_${this.slice.type}`] + (this.slice.type === "heading" ? this.slice.level + 1 : "");
        },
        descriptor() {

            let descriptor = [];

            if (this.slice.referenced_as) {
                descriptor.push(this.slice.referenced_as?.[this.language] ?? null);
            }

            if (this.slice.type === "heading") {
                descriptor.push(this.slice.content?.[this.language] ?? null);
            } else if (this.slice.label) {
                descriptor.push(this.slice.label?.[this.language] ?? null);
            }

            return descriptor.filter(d => d).join(" - ");
        },
        draggedOverClasses() {
            return {
                'border-b-4 border-b-blue-300': this.index > this.draggedSliceIndex && this.isBeingDraggedOver,
                'border-t-4 border-t-blue-300': this.index < this.draggedSliceIndex && this.isBeingDraggedOver,
            }
        },
        levelIndentClasses() {
            return {
                'ml-2': this.level == 1,
                'ml-4': this.level == 2,
                'ml-6': this.level == 3,
                'ml-8': this.level == 4,
            }
        }
    },
};
</script>
<template>
    <li draggable="true"
        class="transition-all  border  border-gray-300 px-2 py-1 text-sm flex flex-row gap-2 group items-center"
        @dragstart="handleDragStart" @dragend="resetDragCues" @dragover.prevent="handleDragover" :class="{
            'opacity-30': isDragging, ...draggedOverClasses, ...levelIndentClasses,
            'bg-blue-50': this.slice.presentation === 'aside',
            'bg-slate-50': this.slice.presentation === 'figure',
            'cursor-pointer': !showEditor
        }" @dragenter="" @dragleave="isBeingDraggedOver = false" @drop.prevent="resetDragCues"
        @dblclick="toggleEditor">
        <ArrowsUpDownIcon class="h-4 w-4 text-blue-200 group-hover:text-blue-800"></ArrowsUpDownIcon>
        <div class="flex flex-row justify-between w-full items-center">
            <div class="flex items-center">
                <div :title="localizedSliceType" class="font-semibold w-12">{{
                    localizedSliceTypeAbbr
                }}</div>
                <div v-if="descriptor" :class="{ 'font-semibold': this.slice.type === 'heading' }">{{ descriptor }}
                </div>
            </div>
            <button @click="toggleEditor" class="p-1 hover:bg-blue-100 rounded-sm">
                <PencilIcon class="size-4 text-blue-200 group-hover:text-blue-800"></PencilIcon>
                <span class="sr-only">{{ editorStrings.edit }}</span>
            </button>
        </div>
        <StructureTreeEditDialog v-if="showEditor" :slice="slice" @close="toggleEditor"></StructureTreeEditDialog>
    </li>

</template>
<script>
import Slice from '../../../../models/contents/Slice';
import editorStrings from "../../../../editor-strings"
import { ArrowsUpDownIcon, PencilIcon } from '@heroicons/vue/24/outline';
import StructureTreeEditDialog from './StructureTreeEditDialog';

export default {
    components: { ArrowsUpDownIcon, StructureTreeEditDialog, PencilIcon },
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
            isBeingDraggedOver: false,
            showEditor: false,
            shouldLockSliceOnClose: null
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
        toggleEditor() {

            if (this.showEditor) {
                // Closing the editor

                if (this.shouldLockSliceOnClose !== false) {
                    // Lock the slice if it was not explicitly unlocked
                    this.slice.state._unlocked = false;
                }

            } else {
                // Opening the editor
                if (this.slice.state._unlocked === true) {
                    this.shouldLockSliceOnClose = false;
                }

                this.slice.state._unlocked = true;
            }

            this.showEditor = !this.showEditor;
        }
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

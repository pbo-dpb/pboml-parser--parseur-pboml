<template>
    <div class="flex flex-col ">
        <button @click="expanded = !expanded" class="w-fit mx-auto hover:text-blue-800 transition-all" :class="{
            'shadow-inner text-blue-500 ml-auto mr-0': expanded, 'text-blue-800': !expanded
        }" :alt="strings.create_slice" :aria-expanded="expanded" :aria-controls="stagerId">
            <PlusCircleIcon v-if="!expanded" aria-hidden="true" class="w-6 h-6" /><span class="sr-only">{{
                strings.create_slice }}</span>
            <XMarkIcon v-if="expanded" aria-hidden="true" class="w-6 h-6" /><span class="sr-only">X</span>
        </button>
        <transition enter-active-class="duration-300 ease-out" enter-from-class="transform opacity-0"
            enter-to-class="opacity-100" leave-active-class="duration-200 ease-in" leave-from-class="opacity-100"
            leave-to-class="transform opacity-0">

            <div v-if="expanded" class="flex flex-col gap-2 border border-blue-500 p-2 rounded" :id="stagerId">
                <div class="grid grid-cols-8 gap-4">
                    <button
                        class="rounded bg-blue-100 hover:bg-blue-800 text-sm  text-blue-900 hover:text-white p-2 flex flex-col gap-2 w-full text-center items-center justify-center"
                        v-for="button in buttons" @click="generateSliceFromButton(button)">
                        {{ button.label }}
                        <BeakerIcon class="w-4 h-4" v-if="button.advanced" />
                    </button>
                </div>
            </div>

        </transition>
    </div>
</template>
<script>
import MarkdownSlice from '../../../models/contents/MarkdownSlice'
import KvListSlice from '../../../models/contents/KvListSlice'
import HeadingSlice from '../../../models/contents/HeadingSlice'
import BitmapSlice from '../../../models/contents/BitmapSlice'
import SvgSlice from '../../../models/contents/SvgSlice'
import TableSlice from '../../../models/contents/TableSlice'
import ChartSlice from '../../../models/contents/ChartSlice'
import LaTeXSlice from '../../../models/contents/LaTeXSlice'
import HtmlSlice from '../../../models/contents/HtmlSlice'

import { PlusCircleIcon, XMarkIcon, BeakerIcon } from '@heroicons/vue/24/solid'

import TinyButton from "../TinyButton.vue"

import editorStrings from "../../../editor-strings.js"
const language = document.documentElement.lang;


export default {
    emits: ["new"],
    props: {
        soft: Boolean,
    },

    data() {
        return {
            strings: editorStrings[language],
            expanded: false,
            stagerId: Math.random().toString(36).substring(2)
        }
    },
    components: {
        TinyButton,
        PlusCircleIcon,
        XMarkIcon,
        BeakerIcon
    },
    mounted() {
        if (!this.soft) this.expanded = true;
    },
    computed: {
        buttons() {
            return [
                {
                    label: this.strings.slice_type_markdown,
                    type: MarkdownSlice
                },
                {
                    label: this.strings.slice_type_heading,
                    type: HeadingSlice
                },
                {
                    label: this.strings.slice_type_table,
                    type: TableSlice,
                },
                {
                    label: this.strings.slice_type_svg,
                    type: SvgSlice,
                },

                {
                    label: this.strings.slice_type_kvlist,
                    type: KvListSlice
                },
                {
                    label: this.strings.slice_type_chart,
                    type: ChartSlice
                },
                {
                    label: this.strings.slice_type_bitmap,
                    type: BitmapSlice,
                    advanced: true
                },

                {
                    label: this.strings.slice_type_LaTeX,
                    type: LaTeXSlice,
                    advanced: true
                },

                {
                    label: this.strings.slice_type_html,
                    type: HtmlSlice,
                    advanced: true
                }



            ]
        }
    },
    methods: {
        generateSliceFromButton(button) {

            if (button.advanced && !window.confirm(this.strings.advanced_slice_warning)) return;
            let newSlice = new button.type({});
            this.$emit('new', newSlice);
            this.expanded = false;
        }
    }

}
</script>
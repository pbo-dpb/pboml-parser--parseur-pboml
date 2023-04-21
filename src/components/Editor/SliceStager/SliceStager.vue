<template>
    <div class="flex flex-col gap-2 border-t border-blue-300 pt-2">
        <div class="flex flex-row text-xl font-thin text-blue-800 items-center gap-2">
            <PlusIcon class="w-4 h-4"></PlusIcon> <span class=''>{{
                strings.create_slice
            }}</span>
        </div>
        <div class="grid grid-cols-8 gap-4">
            <TinyButton
                class="rounded bg-blue-100 hover:bg-blue-300 text-sm text-blue-800 p-2 flex flex-col gap-2 w-full text-center"
                v-for="button in buttons" @click="generateSliceFromButton(button)">
                {{ button.label }}
            </TinyButton>
        </div>
    </div>
</template>
<script>
import MarkdownSlice from '../../../models/contents/MarkdownSlice'
import KvListSlice from '../../../models/contents/KvListSlice'
import HeadingSlice from '../../../models/contents/HeadingSlice'
import BitmapSlice from '../../../models/contents/BitmapSlice'
import SvgSlice from '../../../models/contents/SvgSlice'
import TableSlice from '../../../models/contents/TableSlice'

import { PlusIcon } from '@heroicons/vue/24/solid'

import TinyButton from "../TinyButton.vue"

import editorStrings from "../../../editor-strings.js"
const language = document.documentElement.lang;


export default {

    data() {
        return {
            strings: editorStrings[language],
        }
    },
    components: {
        TinyButton,
        PlusIcon,
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
                    label: this.strings.slice_type_bitmap,
                    type: BitmapSlice
                },
                {
                    label: this.strings.slice_type_kvlist,
                    type: KvListSlice
                },
                {
                    label: this.strings.slice_type_svg,
                    type: SvgSlice,
                },
                {
                    label: this.strings.slice_type_table,
                    type: TableSlice,
                }

            ]
        }
    },
    methods: {
        generateSliceFromButton(button) {
            let newSlice = new button.type({});
            this.$emit('new', newSlice);
        }
    }

}
</script>
<template>
    <div class="flex flex-col gap-2 border-l-2 pl-2" :class="{
        'border-yellow-600': staging,
        'border-blue-800': staging
    }">
        <Button :aria-pressed="staging" @click="staging = !staging">{{
            strings.create_slice
        }}
            <PlusIcon class="w-6 h-6"></PlusIcon>
        </Button>

        <div class="grid grid-cols-4 gap-4" v-if="staging">
            <TinyButton
                class="rounded bg-blue-100 hover:bg-blue-300 text-sm text-blue-800 p-2 flex flex-col gap-2 w-full text-center"
                v-for="button in buttons" @click="generateSliceFromButton(button)">
                <PlusCircleIcon class="w-6 h-6"></PlusCircleIcon>
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

import { PlusIcon, PlusCircleIcon } from '@heroicons/vue/24/solid'

import Button from "../Button.vue"

import editorStrings from "../../../editor-strings.js"
import TinyButton from '../TinyButton.vue'
const language = document.documentElement.lang;


export default {

    data() {
        return {
            staging: null,
            strings: editorStrings[language],

        }
    },
    components: { Button, PlusIcon, TinyButton, PlusCircleIcon },

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
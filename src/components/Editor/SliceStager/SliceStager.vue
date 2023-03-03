<template>
    <Button v-if="!staging" @click="staging = !staging">{{
        strings.create_slice
    }}
        ➕</Button>

    <div class="grid grid-cols-4 gap-4" v-else>
        <button
            class="rounded bg-blue-100 hover:bg-blue-300 text-sm text-blue-800 p-2 flex flex-col gap-2 w-full text-center"
            v-for="button in buttons" @click="generateSliceFromButton(button)">
            {{ button.label }}
        </button>
    </div>
</template>
<script>
import MarkdownSlice from '../../../models/contents/MarkdownSlice'
import KvListSlice from '../../../models/contents/KvListSlice'
import Button from "../Button.vue"

import editorStrings from "../../../editor-strings.js"
const language = document.documentElement.lang;


export default {

    data() {
        return {
            staging: null,
            strings: editorStrings[language],

        }
    },
    components: { Button },

    computed: {
        buttons() {
            return [
                {
                    label: this.strings.slice_type_markdown,
                    type: MarkdownSlice
                },
                {
                    label: this.strings.slice_type_kvlist,
                    type: KvListSlice
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
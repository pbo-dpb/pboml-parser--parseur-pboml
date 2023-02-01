<template>
    <fieldset class="flex flex-col p-1 gap-0.5 border border-gray-300 rounded">
        <legend v-if="label" class="font-semibold px-1">{{ label }}</legend>


        <label class="flex flex-row items-center text-left">
            <markdown-input :value="modelValue" @input="handleInput" class="border border-gray-300 p-1 w-full">
            </markdown-input>
        </label>


    </fieldset>



</template>
<script setup>

import MarkdownInput from "./MarkdownInput.vue"
const props = defineProps(['modelValue', 'label'])
const emit = defineEmits(['update:modelValue'])


const handleInput = (event) => {
    emit('update:modelValue', event.target.value)
}

</script>
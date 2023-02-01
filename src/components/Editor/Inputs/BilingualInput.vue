<template>
    <fieldset class="flex flex-col p-1 gap-0.5 border border-gray-300 rounded">

        <legend v-if="label" class="font-semibold px-1">{{ label }}</legend>

        <label class="flex flex-row items-center text-left">
            <span class="w-8">EN</span>
            <markdown-input :value="modelValue.en" @input="handleEnInput" class="border border-gray-300 p-1 w-full">
            </markdown-input>
        </label>

        <label class="flex flex-row items-center text-left">
            <span class="w-8">FR</span>
            <markdown-input :value="modelValue.fr" @input="handleFrInput" class="border border-gray-300 p-1 w-full">
            </markdown-input>
        </label>


    </fieldset>



</template>
<script setup>

import MarkdownInput from "./MarkdownInput.vue"
const props = defineProps(['modelValue', 'label'])
const emit = defineEmits(['update:modelValue'])


const handleEnInput = (event) => {
    emit('update:modelValue', { en: event.target.value, fr: props.modelValue.fr })
}

const handleFrInput = (event) => {
    emit('update:modelValue', { fr: event.target.value, en: props.modelValue.en })
}
</script>
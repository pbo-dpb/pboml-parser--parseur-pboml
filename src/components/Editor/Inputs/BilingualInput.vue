<template>
    <fieldset class="flex p-1  border border-gray-300 rounded flex-wrap" :class="{
        'flex-col gap-0.5': inputSize !== 'lg',
        'flex-row': inputSize === 'lg'
    }">

        <legend v-if="label" class="font-semibold px-1 w-full">{{ label }}</legend>

        <template v-if="inputSize !== 'lg'">
            <label class="flex flex-row items-center text-left">
                <span class=" w-8 px-1 text-center tracking-tighter">EN</span>
                <markdown-input :value="modelValue.en" @input="handleEnInput" class="border border-gray-300 p-1 w-full">
                </markdown-input>
            </label>

            <label class="flex flex-row items-center text-left">
                <span class=" w-8 px-1 text-center tracking-tighter">FR</span>
                <markdown-input :value="modelValue.fr" @input="handleFrInput" class="border border-gray-300 p-1 w-full">
                </markdown-input>
            </label>
        </template>
        <template v-else>
            <markdown-textarea class="w-1/2 px-2" :model-Value="modelValue.en" @input="handleEnInput"
                label="EN"></markdown-textarea>
            <markdown-textarea class="w-1/2 px-2" :model-Value="modelValue.fr" @input="handleFrInput"
                label="FR"></markdown-textarea>
        </template>


    </fieldset>
</template>
<script setup>

import MarkdownInput from "./MarkdownInput.vue"
import MarkdownTextarea from "./MarkdownTextarea.vue"

const props = defineProps(['modelValue', 'label', "inputSize"])
const emit = defineEmits(['update:modelValue'])


const handleEnInput = (event) => {
    emit('update:modelValue', { en: event.target.value, fr: props.modelValue.fr })
}

const handleFrInput = (event) => {
    emit('update:modelValue', { fr: event.target.value, en: props.modelValue.en })
}

</script>
<template>
    <fieldset class="flex p-1  border border-gray-300 rounded flex-wrap @container" :class="{
        'flex-col gap-0.5': inputSize !== 'lg',
        'flex-row': inputSize === 'lg'
    }">

        <legend v-if="label" class="font-semibold px-1 w-full">{{ label }}</legend>

        <template v-if="inputSize !== 'lg'">
            <label class="flex flex-col @sm:flex-row items-center text-left">
                <span class="w-8 p-1 text-center tracking-tighter">EN</span>
                <markdown-input :value="modelValue?.en" @input="handleEnInput" class="border border-gray-300 p-1 w-full">
                </markdown-input>
            </label>

            <label class="flex flex-col @sm:flex-row items-center text-left">
                <span class=" w-8 p-1 text-center tracking-tighter">FR</span>
                <markdown-input :value="modelValue?.fr" @input="handleFrInput" class="border border-gray-300 p-1 w-full">
                </markdown-input>
            </label>
        </template>
        <template v-else>
            <markdown-textarea class="w-1/2 px-2" :model-Value="modelValue?.en" @update:model-value="handleEnInput"
                label="EN"></markdown-textarea>
            <markdown-textarea class="w-1/2 px-2" :model-Value="modelValue?.fr" @update:model-value="handleFrInput"
                label="FR"></markdown-textarea>
        </template>


    </fieldset>
</template>
<script setup>

import MarkdownInput from "./MarkdownInput.vue"
import MarkdownTextarea from "./MarkdownTextarea.vue"

const props = defineProps(['modelValue', 'label', "inputSize"])
const emit = defineEmits(['update:modelValue'])


const handleEnInput = (eventOrValue) => {
    if (eventOrValue?.target?.value)
        emit('update:modelValue', { en: eventOrValue.target.value, fr: props.modelValue?.fr })
    else
        emit('update:modelValue', { en: eventOrValue, fr: props.modelValue?.fr })
}

const handleFrInput = (eventOrValue) => {
    if (eventOrValue?.target?.value)
        emit('update:modelValue', { en: props.modelValue?.en, fr: eventOrValue.target.value })
    else
        emit('update:modelValue', { en: props.modelValue?.en, fr: eventOrValue })
}

</script>
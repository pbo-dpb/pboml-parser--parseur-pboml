<template>
    <fieldset class="flex flex-col p-1 gap-0.5 border border-gray-300 rounded-sm">
        <legend v-if="label" class="font-semibold px-1">{{ label }}</legend>


        <label class="flex flex-row items-center text-left">
            <markdown-input :value="modelValue" @input="handleInput" @blur="$emit('blur', $event)"
                class="border border-gray-300 p-1 w-full">
            </markdown-input>
        </label>

        <span v-if="hint" class="text-sm italic text-gray-700 dark:text-gray-300">{{ hint }}</span>

    </fieldset>
</template>
<script setup>

import MarkdownInput from "./MarkdownInput.vue"
const props = defineProps(['modelValue', 'label', 'hint'])
const emit = defineEmits(['update:modelValue', 'blur-sm'])


const handleInput = (event) => {
    emit('update:modelValue', event.target.value)
}

</script>
<template>
    <fieldset :class="label ? `flex flex-col p-1 gap-0.5 border border-gray-300 rounded-sm` : ''">
        <legend v-if="label" class="font-semibold px-1">{{ label }}</legend>

        <input ref="input" class="border border-gray-300 p-1 w-full rounded-sm" :value="modelValue" type="number"
            @input="handleInput" @blur="handleBlur" />

        <span v-if="hint" class="text-sm italic text-gray-700 dark:text-gray-300">{{ hint }}</span>
    </fieldset>
</template>
<script setup>
import { ref, onMounted } from 'vue'

defineProps(['modelValue', 'label', 'hint'])
const emit = defineEmits(['update:modelValue'])

const input = ref(null)

function handleInput(e) {
    let value = e.target.value;
    if (value !== '' && value != '-') {
        emit('update:modelValue', parseFloat(value))
    }
}

function handleBlur(e) {
    let value = e.target.value;
    emit('update:modelValue', value ? parseFloat(value) : null)
}
</script>
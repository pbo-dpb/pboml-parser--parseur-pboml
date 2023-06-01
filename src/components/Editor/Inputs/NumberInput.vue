<template>
    <fieldset :class="label ? `flex flex-col p-1 gap-0.5 border border-gray-300 rounded` : ''">
        <legend v-if="label" class="font-semibold px-1">{{ label }}</legend>

        <input class="border border-gray-300 p-1 w-full rounded" :value="modelValue" type="number"
            @input="$emit('update:modelValue', parseFloat($event.target.value))" />

        <span v-if="hint" class="text-sm italic text-gray-700 dark:text-gray-300">{{ hint }}</span>
    </fieldset>
</template>
<script setup>
defineProps(['modelValue', 'label', 'hint'])
defineEmits(['update:modelValue'])
</script>
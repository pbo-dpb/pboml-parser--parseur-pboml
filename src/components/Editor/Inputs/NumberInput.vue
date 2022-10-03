<template>
    <input class="border border-gray-300 p-1 w-full rounded" :value="modelValue" type="number"
        @input="$emit('update:modelValue', parseFloat($event.target.value))" />
</template>
<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>
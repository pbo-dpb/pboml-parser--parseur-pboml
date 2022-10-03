<template>
    <textarea class="border border-gray-300 p-1 rounded" :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)">
    </textarea>
</template>
<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>
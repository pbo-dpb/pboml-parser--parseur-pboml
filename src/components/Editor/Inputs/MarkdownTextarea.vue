<template>
    <textarea class="border border-gray-300 p-2" :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)">
    </textarea>
</template>
<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>
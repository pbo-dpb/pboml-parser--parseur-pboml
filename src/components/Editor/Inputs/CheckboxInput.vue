<template>
    <label class="flex flex-row items-center gap-2 select-none">
        <input type="checkbox" @change="handleInput" :checked="modelValue" :disabled>{{ label }}
    </label>
</template>
<script setup>

const props = defineProps(['modelValue', 'label', 'disabled'])
const emit = defineEmits(['update:modelValue'])

const handleInput = (event) => {
    emit('update:modelValue', event.target.checked)
}

</script>
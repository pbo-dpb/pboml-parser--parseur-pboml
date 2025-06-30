<template>
    <div class="flex flex-col gap-1">
        <label v-if="label" :for="eluid" class="font-semibold">{{ label }}</label>
        <textarea :id="eluid" class="border border-gray-300 p-1 rounded-sm h-96 font-mono" :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)">
                        </textarea>
    </div>
</template>
<script setup>
defineProps(['modelValue', 'label'])
defineEmits(['update:modelValue'])
const eluid = Math.random().toString(36).substring(2)
</script>
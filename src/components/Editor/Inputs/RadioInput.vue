<template>
    <fieldset class="flex flex-col gap-1 w-full">

        <legend v-if="label" class="font-semibold">{{ label }}</legend>
        <div class="flex flex-col gap-0.5">
            <label v-for="(choice, value) in choices"
                class="flex flex-row justify-between gap-2 text-sm font-semibold text-gray-700 hover:text-gray-800 has-checked:bg-purple-50 rounded-sm px-2 py-1">
                <div class="flex flex-row gap-1 items-center">
                    <component v-if="choice.icon" :is="choice.icon" class="size-4"></component>
                    <span v-if="choice.label">{{ choice.label }}</span>
                    <span v-else>{{ choice }}</span>
                </div>
                <input :name="inputUuid" type="radio" @change="handleInput(value)"
                    :checked="modelValue === value"></input>
            </label>
        </div>

    </fieldset>
</template>
<script setup>

const props = defineProps(['modelValue', 'label', 'choices'])
const emit = defineEmits(['update:modelValue'])

const handleInput = (value) => {
    emit('update:modelValue', value)
}

const inputUuid = Math.random().toString(36).substring(2);
</script>
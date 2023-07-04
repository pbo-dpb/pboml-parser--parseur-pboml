<template>
    <fieldset class="flex flex-col gap-1 w-full" :id="inputUuid">

        <legend v-if="label" class="font-semibold">{{ label }}</legend>

        <div class="flex flex-row gap-2 items-center">
            <label class=" select-none p-1 w-full rounded flex flex-row justify-center items-center font-semibold" :class="{
                'cursor-pointer border border-blue-100 bg-blue-100 text-blue-800': modelValue != value,
                'cursor-pointer border border-orange-300 bg-gray-100 shadow-inner': modelValue == value,
            }" v-for="(value, label) in choices">
                <input class="sr-only" type="radio" :name="`radio-input-${inputUuid}`" @input="handleInput" :value="value"
                    :checked="modelValue == value">
                {{ label }}
            </label>
        </div>

    </fieldset>
</template>
<script setup>

const props = defineProps(['modelValue', 'label', 'choices'])
const emit = defineEmits(['update:modelValue'])

const handleInput = (event) => {
    emit('update:modelValue', event.target.value)
}

const inputUuid = Math.random().toString(36).substring(2);
</script>
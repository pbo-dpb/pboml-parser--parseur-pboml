<template>
    <fieldset
        :class="
            label
                ? `flex flex-col gap-0.5 rounded-sm border border-gray-300 p-1`
                : ''
        ">
        <legend
            v-if="label"
            class="px-1 font-semibold">
            {{ label }}
        </legend>

        <input
            class="w-full rounded-sm border border-gray-300 p-1"
            :value="modelValue"
            type="number"
            @input="handleInput"
            @blur="handleBlur" />

        <span
            v-if="hint"
            class="text-sm text-gray-700 italic dark:text-gray-300"
            >{{ hint }}</span
        >
    </fieldset>
</template>
<script setup>
    defineProps(["modelValue", "label", "hint"]);
    const emit = defineEmits(["update:modelValue"]);

    function handleInput(e) {
        let value = e.target.value;
        if (value !== "" && value != "-") {
            emit("update:modelValue", parseFloat(value));
        }
    }

    function handleBlur(e) {
        let value = e.target.value;
        emit("update:modelValue", value ? parseFloat(value) : null);
    }
</script>

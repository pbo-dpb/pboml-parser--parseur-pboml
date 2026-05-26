<template>
  <fieldset class="flex flex-col gap-0.5 rounded-sm border border-gray-300 p-1">
    <legend v-if="label" class="px-1 font-semibold">{{ label }}</legend>

    <label class="flex flex-row items-center text-left">
      <markdown-input
        :value="modelValue"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        class="w-full border border-gray-300 p-1"
      >
      </markdown-input>
    </label>

    <span v-if="hint" class="text-sm text-gray-700 italic dark:text-gray-300">{{
      hint
    }}</span>
  </fieldset>
</template>
<script setup>
import MarkdownInput from "./MarkdownInput.vue";
const props = defineProps(["modelValue", "label", "hint"]);
const emit = defineEmits(["update:modelValue", "blur-sm"]);

const handleInput = (event) => {
  emit("update:modelValue", event.target.value);
};
</script>

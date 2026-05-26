<template>
  <div class="flex w-full flex-col gap-1">
    <label v-if="label" class="font-semibold" :for="inputUuid">{{
      label
    }}</label>
    <select
      @change="handleInput"
      :id="inputUuid"
      class="w-full rounded-sm border border-gray-300 p-1"
      :value="modelValue"
    >
      <option v-for="(value, label) in choices" :value="value">
        {{ label }}
      </option>
    </select>
  </div>
</template>
<script setup>
const props = defineProps(["modelValue", "label", "choices"]);
const emit = defineEmits(["update:modelValue"]);

const handleInput = (event) => {
  emit("update:modelValue", event.target.value);
};

const inputUuid = Math.random().toString(36).substring(2);
</script>

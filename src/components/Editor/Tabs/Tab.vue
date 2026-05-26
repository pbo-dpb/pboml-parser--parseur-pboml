<template>
  <button
    class="flex flex-row items-center gap-2 border-b-4 px-2 font-semibold tracking-tighter select-none"
    :class="{
      'text-xl': size === 'lg',
      'text-lg': size === 'md',
      'text-base': size === 'sm',
      'cursor-default border-purple-800 text-purple-800': selected,
      'border-gray-100 text-gray-600 hover:border-blue-800 hover:text-blue-800':
        !selected,
    }"
    role="tab"
    :aria-selected="selected"
    :aria-controls="controls"
    :id="`tab-${controls}`"
    :tabindex="selected ? 0 : -1"
  >
    <slot></slot>

    <span v-if="warning" class="text-xs font-bold text-orange-500">
      <ExclamationTriangleIcon class="h-4 w-4"></ExclamationTriangleIcon>
    </span>
  </button>
</template>
<script>
import { ExclamationTriangleIcon } from "@heroicons/vue/16/solid";
export default {
  props: {
    selected: Boolean,
    controls: String,
    size: {
      type: String,
      default: "lg",
    },
    warning: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ExclamationTriangleIcon,
  },
};
</script>

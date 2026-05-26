<template>
  <button
    class="flex flex-row items-center justify-center gap-2 rounded-sm p-2 font-semibold outline-yellow-600 disabled:opacity-30 aria-pressed:outline-2 aria-pressed:outline-solid"
    :class="{
      'bg-blue-800 text-white enabled:hover:bg-blue-700': primary,
      'bg-blue-100 text-blue-800 enabled:hover:bg-blue-300': !primary,
      'shadow-inner aria-pressed:bg-blue-600': primary && toggled,
      'shadow-inner aria-pressed:bg-slate-600': !primary && toggled,
    }"
    :aria-pressed="toggled"
  >
    <slot></slot>
  </button>
</template>
<script>
export default {
  props: ["primary", "toggled"],
};
</script>

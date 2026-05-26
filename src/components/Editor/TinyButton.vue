<template>
  <button
    :aria-pressed="toggled"
    class="flex w-fit flex-row place-content-center items-center gap-1 rounded-sm p-1 text-xs outline-yellow-600 disabled:opacity-80 disabled:grayscale disabled:filter aria-pressed:outline-2 aria-pressed:outline-solid"
    :class="{
      'bg-red-100 text-red-800 enabled:hover:bg-red-300': danger,
      'bg-blue-100 text-blue-800 enabled:hover:bg-blue-300': !danger,
    }"
  >
    <slot></slot>
  </button>
</template>
<script>
export default {
  props: ["danger", "toggled"],
};
</script>

<template>
    <button class="font-semibold text-xl border-b-4" :class="{
        'border-blue-800  text-blue-800': selected,
        'border-gray-100 hover:border-gray-800 text-gray-600 hover:text-gray-800': !selected
    }" role="tab" :aria-selected="selected" :aria-controls="controls" :id="`tab-${controls}`"
        :tabindex="selected ? 0 : -1">
        <slot></slot>
    </button>
</template>
<script>
export default {
    props: [
        "selected",
        "controls"
    ]
}
</script>
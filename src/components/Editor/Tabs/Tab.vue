<template>
    <button class="font-semibold text-xl border-b-4 tracking-tighter px-2 flex flex-row gap-2 items-center select-none"
        :class="{
            'border-purple-800  text-purple-800 cursor-default': selected,
            'border-gray-100 hover:border-blue-800 text-gray-600 hover:text-blue-800': !selected
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